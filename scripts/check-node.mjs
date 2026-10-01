// Runs before `npm run dev`/`build`: the site, its Supabase client and the
// test runner all need Node 22+ (see .nvmrc). Fails early with a clear
// message instead of the framework's deprecation warnings.
const [major] = process.versions.node.split(".").map(Number);
if (major < 22) {
  console.error(
    `\nNode ${process.versions.node} detected; this project needs Node 22 or later.\n` +
      "Run `nvm use` (reads .nvmrc) for this terminal, `nvm alias default 22` to make it\n" +
      "the default for new terminals, or install it from https://nodejs.org, then retry.\n",
  );
  process.exit(1);
}
