// Emulates the slice of the Supabase API the site uses: PostgREST behind
// /rest/v1, password auth under /auth/v1, and public object storage.
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const PORT = 54321,
  REST = "http://127.0.0.1:3010",
  MEDIA = process.env.MEDIA_DIR;
const SECRET = "harness-jwt-secret-with-at-least-32-characters";
// Any Supabase secret key (the local stack's default lives in .env.local) is
// treated as the service role; the harness only listens on 127.0.0.1.
const isSecretKey = (key) => String(key ?? "").startsWith("sb_secret_");
const b64 = (s) => Buffer.from(s).toString("base64url");
const sign = (claims) => {
  const h = b64(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    p = b64(JSON.stringify(claims));
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(`${h}.${p}`)
    .digest("base64url");
  return `${h}.${p}.${sig}`;
};
const verify = (token) => {
  const [h, p, sig] = String(token).split(".");
  if (!h || !p || !sig) return null;
  const expect = crypto
    .createHmac("sha256", SECRET)
    .update(`${h}.${p}`)
    .digest("base64url");
  if (expect !== sig) return null;
  try {
    return JSON.parse(Buffer.from(p, "base64url").toString());
  } catch {
    return null;
  }
};
const isJwt = (t) =>
  typeof t === "string" && t.split(".").length === 3 && verify(t) !== null;
const now = () => Math.floor(Date.now() / 1000);
const serviceToken = () =>
  sign({ role: "service_role", iss: "harness", iat: now(), exp: now() + 3600 });
const userToken = (u) =>
  sign({
    aud: "authenticated",
    role: "authenticated",
    sub: u.id,
    email: u.email,
    iss: "harness",
    iat: now(),
    exp: now() + 3600,
  });
const session = (u) => {
  const at = userToken(u);
  return {
    access_token: at,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now() + 3600,
    refresh_token: sign({
      type: "refresh",
      sub: u.id,
      email: u.email,
      iat: now(),
    }),
    user: userJson(u),
  };
};
const userJson = (u) => ({
  id: u.id,
  aud: "authenticated",
  role: "authenticated",
  email: u.email,
  email_confirmed_at: u.created_at,
  app_metadata: u.app_metadata ?? { provider: "email", providers: ["email"] },
  user_metadata: u.user_metadata ?? {},
  identities: [],
  created_at: u.created_at,
  updated_at: u.created_at,
});
const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
const json = (res, status, data, extra = {}) => {
  res.writeHead(status, {
    "content-type": "application/json",
    ...cors,
    ...extra,
  });
  res.end(JSON.stringify(data));
};
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-expose-headers": "*",
};
async function rpc(name, args) {
  const r = await fetch(`${REST}/rpc/${name}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${serviceToken()}`,
    },
    body: JSON.stringify(args),
  });
  return r.json();
}
async function findUser(id) {
  const users = await rpc("__harness_users", {});
  return users.find((u) => u.id === id) ?? null;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (req.method === "OPTIONS") {
      res.writeHead(204, cors);
      return res.end();
    }
    const bearer = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
    try {
      if (url.pathname.startsWith("/rest/v1/")) {
        const headers = {};
        for (const h of [
          "content-type",
          "prefer",
          "range",
          "accept",
          "accept-profile",
          "content-profile",
          "range-unit",
        ])
          if (req.headers[h]) headers[h] = req.headers[h];
        if (isJwt(bearer)) headers.authorization = `Bearer ${bearer}`;
        else if (isSecretKey(bearer) || isSecretKey(req.headers.apikey))
          headers.authorization = `Bearer ${serviceToken()}`;
        const body = ["GET", "HEAD"].includes(req.method)
          ? undefined
          : await readBody(req);
        const upstream = await fetch(
          `${REST}${url.pathname.slice("/rest/v1".length)}${url.search}`,
          { method: req.method, headers, body },
        );
        const out = Buffer.from(await upstream.arrayBuffer());
        const h = { ...cors };
        for (const k of [
          "content-type",
          "content-range",
          "content-location",
          "preference-applied",
        ]) {
          const v = upstream.headers.get(k);
          if (v) h[k] = v;
        }
        res.writeHead(upstream.status, h);
        return res.end(out);
      }
      if (url.pathname === "/auth/v1/token") {
        const body = JSON.parse((await readBody(req)).toString() || "{}");
        if (url.searchParams.get("grant_type") === "password") {
          const u = await rpc("__harness_login", {
            p_email: body.email ?? "",
            p_password: body.password ?? "",
          });
          if (!u)
            return json(res, 400, {
              error: "invalid_grant",
              error_description: "Invalid login credentials",
              code: 400,
              msg: "Invalid login credentials",
            });
          return json(res, 200, session(u));
        }
        if (url.searchParams.get("grant_type") === "refresh_token") {
          const claims = verify(body.refresh_token);
          const u = claims && (await findUser(claims.sub));
          if (!u)
            return json(res, 400, {
              error: "invalid_grant",
              msg: "Invalid Refresh Token",
              code: 400,
            });
          return json(res, 200, session(u));
        }
        return json(res, 400, { error: "unsupported_grant_type" });
      }
      if (url.pathname === "/auth/v1/user" && req.method === "GET") {
        const claims = verify(bearer);
        const u = claims?.sub && (await findUser(claims.sub));
        if (!u) return json(res, 401, { code: 401, msg: "invalid JWT" });
        return json(res, 200, userJson(u));
      }
      if (url.pathname === "/auth/v1/logout") {
        res.writeHead(204, cors);
        return res.end();
      }
      if (url.pathname === "/auth/v1/admin/users" && req.method === "GET") {
        const users = await rpc("__harness_users", {});
        return json(res, 200, {
          users: users.map(userJson),
          aud: "authenticated",
        });
      }
      if (
        url.pathname.startsWith("/auth/v1/invite") ||
        url.pathname.startsWith("/auth/v1/admin/")
      )
        return json(res, 501, { msg: "not emulated by the harness" });
      if (url.pathname.startsWith("/storage/v1/object/")) {
        const rel = url.pathname.replace(
          /^\/storage\/v1\/object\/(public\/)?/,
          "",
        );
        const file = path.join(MEDIA, rel);
        if (req.method === "GET") {
          if (!fs.existsSync(file))
            return json(res, 404, { error: "not found" });
          res.writeHead(200, {
            ...cors,
            "content-type": rel.endsWith(".png")
              ? "image/png"
              : rel.endsWith(".webp")
                ? "image/webp"
                : "application/octet-stream",
          });
          return fs.createReadStream(file).pipe(res);
        }
        if (req.method === "POST" || req.method === "PUT") {
          if (!isJwt(bearer)) return json(res, 401, { error: "unauthorized" });
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, await readBody(req));
          return json(res, 200, { Key: rel, Id: crypto.randomUUID() });
        }
        if (req.method === "DELETE") {
          fs.rmSync(file, { force: true });
          return json(res, 200, []);
        }
      }
      json(res, 404, {
        error: `harness: no route for ${req.method} ${url.pathname}`,
      });
    } catch (e) {
      json(res, 500, { error: String(e) });
    }
  })
  .listen(PORT, "127.0.0.1", () => console.log(`harness proxy on ${PORT}`));
