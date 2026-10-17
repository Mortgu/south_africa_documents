// Entry point for Hetzner webhosting / managed servers, where the hosting starts a fixed script
// (~/public_html/<domain>/app.js) that cannot be changed without konsoleH access. Copy this file
// there as app.js; it starts the built Next.js app from the repo checkout (see deploy/README.md).
//
// The checkout defaults to ~/apps/dignum; override with DIGNUM_APP_DIR.
"use strict";

const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const dir = process.env.DIGNUM_APP_DIR || path.join(os.homedir(), "apps", "dignum");
process.env.NODE_ENV = "production";
// Next.js reads .env.local and the build output relative to the working directory.
process.chdir(dir);

const next = require(require.resolve("next", { paths: [dir] }));
const app = next({ dir, dev: false });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

app
  .prepare()
  .then(() => {
    http.createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`> dignum ready on port ${port} (${dir})`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Next.js", error);
    process.exit(1);
  });
