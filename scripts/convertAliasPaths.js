// convert-alias-paths.js

/*
How to Use the Script
Save the File: Save the code above into a file named convert-alias-paths.js and place it in the root of your common package directory.

Navigate to the Directory: Open your terminal and navigate to the root of your common package.

Bash

cd path/to/your/monorepo/packages/common
Run the Script: Execute the script using Node.js.

Bash

node convert-alias-paths.js
The script will then print its progress to the console, showing you which files are being updated and how the paths are being replaced.
*/

const fs = require("fs").promises;
const path = require("path");

// Define the root of the target package relative to this script's location.
// For example, if script is in `monorepo-root/scripts` and target is `monorepo-root/packages/common`,
// then the path should be `../packages/common`.
const projectRoot = path.resolve(__dirname, "../packages/common");

// The directory to scan is now an absolute path.
const SRC_DIR = path.join(projectRoot, "src");

const PATHS_CONFIG = {
  baseUrl: ".",
  paths: {
    "@commonTSX/*": ["./*"],
    "@/components/*": ["./src/components/*"],
    "@/test/*": ["./src/test/*"],
    "@/workers/*": ["./src/workers/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/contexts/*": ["./src/contexts/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/styles/*": ["./src/styles/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/server/*": ["./src/server/*"],
    "@/ui/*": ["./src/components/ui/*"],
    "@/types/*": ["./src/types/*"],
    "@/public/*": ["../../public/*"],
    "@/imgs/*": ["../../public/imgs/*"],
    "@/fonts/*": ["../../public/fonts/*"],
  },
};

const sortedAliasKeys = Object.keys(PATHS_CONFIG.paths).sort((a, b) => b.length - a.length);

/**
 * Converts an alias path to a full, absolute path.
 * @param {string} aliasPath The import path from the file.
 * @returns {string|null} The absolute resolved path or null if no match.
 */
function resolveAliasToFullPath(aliasPath) {
  for (const alias of sortedAliasKeys) {
    const aliasPrefix = alias.replace("*", "");
    if (aliasPath.startsWith(aliasPrefix)) {
      const physicalPathPattern = PATHS_CONFIG.paths[alias][0];
      const wildcardPart = aliasPath.substring(aliasPrefix.length);
      const resolvedPath = physicalPathPattern.replace("*", wildcardPart);

      // ✨ FIX: Join with the projectRoot to create a full, absolute path.
      return path.join(projectRoot, resolvedPath);
    }
  }
  return null;
}

async function processFile(filePath) {
  try {
    const originalContent = await fs.readFile(filePath, "utf-8");
    let contentChanged = false;

    const importRegex = /(import(?:[\s\S]*?from\s*)?)['"](@[^'"]+)['"]/g;

    const newContent = originalContent.replace((match, importStatement, aliasPath) => {
      // `resolvedPath` is now a full, absolute path.
      const resolvedPath = resolveAliasToFullPath(aliasPath);

      if (resolvedPath) {
        // `currentFileDir` is also an absolute path.
        const currentFileDir = path.dirname(filePath);
        // `path.relative` works perfectly when comparing two absolute paths.
        let relativePath = path.relative(currentFileDir, resolvedPath);

        relativePath = relativePath.replace(/\\/g, "/");

        if (!relativePath.startsWith("../")) {
          relativePath = "./" + relativePath;
        }

        console.log(`  - Replacing '${aliasPath}' with '${relativePath}'`);
        contentChanged = true;
        return `${importStatement}'${relativePath}'`;
      }

      return match;
    });

    if (contentChanged) {
      await fs.writeFile(filePath, newContent, "utf-8");
      // Use projectRoot for cleaner logging
      console.log(`✅ Updated imports in: ${path.relative(projectRoot, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error);
  }
}

async function traverseDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await traverseDirectory(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error traversing directory ${dirPath}:`, error);
  }
}

async function main() {
  console.log("🚀 Starting import path conversion...");
  console.log(`Target package root: ${projectRoot}`);
  console.log(`Scanning directory: ${SRC_DIR}`);
  console.log("Starting in 5 seconds... Press Ctrl+C to cancel.");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("---");

  await traverseDirectory(SRC_DIR);

  console.log("---");
  console.log("✨ Conversion process complete.");
}

main();
