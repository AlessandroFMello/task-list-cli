import fs from "node:fs";

const file = "dist/index.js";
const content = fs.readFileSync(file, "utf8");

if (!content.startsWith("#!")) {
  fs.writeFileSync(file, `#!/usr/bin/env node\n${content}`);
}
