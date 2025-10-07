import fs from "fs";
import path from "path";

/**
 * Checks whether a given file exists in the current working directory and is not empty.
 *
 * @param envFileName - The name of the .env file (or any file) to check.
 * @returns boolean - true if file exists and is not empty, false otherwise.
 */
export function checkEnvFile(envFileName: string): boolean {
  const filePath = path.resolve(process.cwd(), envFileName);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File '${envFileName}' does not exist in the current working directory.`);
    return false;
  }

  // Check if file is not empty
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    console.error(`Error: File '${envFileName}' is empty.`);
    return false;
  }

  console.log(`Success: File '${envFileName}' exists and is not empty.`);
  return true;
}
