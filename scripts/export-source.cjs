
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../src");
const output = path.resolve(__dirname, "../data/screeps-source.txt");

function collectFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

const files = collectFiles(root);

const outputText = files.map(file => {
  const relativePath = path.relative(root, file).replace(/\\/g, "/");
  const content = fs.readFileSync(file, "utf8");

  return `\n${"=".repeat(60)}
FILE: src/${relativePath}
${"=".repeat(60)}

${content}
`;
}).join("\n");

fs.writeFileSync(output, outputText, "utf8");

console.log(`Exported ${files.length} TypeScript files to screeps-source.txt`);
