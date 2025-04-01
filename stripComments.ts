#!/usr/bin/env ts-node

import strip from "strip-comments";
import * as fs from "fs";
import { glob } from "glob";

/**
 * Strips comments from TypeScript files in the src directory
 */
async function stripCommentsFromFiles(): Promise<void> {
  console.log("Starting to strip comments from TypeScript files...");

  try {
    const files = await glob("src/**/*.tsx");

    if (files.length === 0) {
      console.log("No TypeScript files found in src directory");
      process.exit(0);
    }

    try {
      files.forEach((file: string) => {
        const content: string = fs.readFileSync(file, "utf8");
        const stripped: string = strip(content);
        fs.writeFileSync(file, stripped);
        console.log(`Processed: ${file}`);
      });

      console.log(`Successfully processed ${files.length} files`);
    } catch (error) {
      console.error("Error processing files:", error);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error finding files:", error);
    process.exit(1);
  }
}

// Execute the function
stripCommentsFromFiles().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
