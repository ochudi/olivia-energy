import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DB_SCHEMA } from "./schema";

/**
 * The generated types name only this site's schema, so a client created
 * without `db.schema` still type-checks; at runtime it would query `public`,
 * which on a shared project is another application's tables. This walks the
 * source and fails on any client that leaves the option out.
 */
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)
      ? [full]
      : [];
  });
}

describe("Supabase clients", () => {
  const constructors =
    /\b(createClient|createServerClient|createBrowserClient)\s*(<[^>]*>)?\s*\(/;
  const files = sourceFiles(path.resolve(__dirname, "../..")).filter((file) =>
    constructors.test(fs.readFileSync(file, "utf8")),
  );

  it("are all created in src/lib/supabase", () => {
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(path.dirname(file)).toBe(__dirname);
    }
  });

  it.each(files.map((file) => [path.basename(file), file]))(
    "%s passes the site's schema",
    (_name, file) => {
      expect(fs.readFileSync(file, "utf8")).toContain(
        "db: { schema: DB_SCHEMA }",
      );
    },
  );

  it("use a schema of their own, never public", () => {
    expect(DB_SCHEMA).toBe("olivia_energy");
  });

  // The scripts are plain .mjs and cannot import the constant.
  const scriptsDir = path.resolve(__dirname, "../../../scripts");
  const scripts = fs
    .readdirSync(scriptsDir)
    .filter((name) => name.endsWith(".mjs"))
    .map((name) => path.join(scriptsDir, name))
    .filter((file) =>
      /\bcreateClient\s*\(/.test(fs.readFileSync(file, "utf8")),
    );

  it.each(scripts.map((file) => [path.basename(file), file]))(
    "scripts/%s names the same schema",
    (_name, file) => {
      const source = fs.readFileSync(file, "utf8");
      expect(source).toMatch(/db: \{ schema: (DB_SCHEMA|"olivia_energy") \}/);
      if (source.includes("const DB_SCHEMA")) {
        expect(source).toContain(`const DB_SCHEMA = "${DB_SCHEMA}"`);
      }
    },
  );
});
