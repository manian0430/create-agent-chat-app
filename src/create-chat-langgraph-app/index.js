#!/usr/bin/env node

import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "url";
import prompts from "prompts";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  console.log(`
  ${chalk.green("Welcome to create-chat-langgraph-app!")}
  Let's set up your new LangGraph chat application.
  `);

  // Collect user input
  const questions = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "What is the name of your project?",
      initial: "langgraph-chat-app",
    },
  ]);
  const { projectName } = questions;

  // Create project directory
  const targetDir = path.join(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`Error: Directory ${projectName} already exists.`));
    process.exit(1);
  }

  // Log the collected values
  console.log(`Project will be created at: ${chalk.green(targetDir)}\n`);

  // Create the project directory
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(chalk.yellow("Creating project files..."));

  // Copy all the template files to the target directory
  const templateDir = path.join(__dirname, "template");
  fs.copySync(templateDir, targetDir);

  // Update package.json with project name
  const pkgJsonPath = path.join(targetDir, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  pkgJson.name = projectName;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  console.log(chalk.green("\nSuccess!"));
  console.log(`
  Your LangGraph chat app has been created at ${chalk.green(targetDir)}
  
  To get started:
    ${chalk.cyan(`cd ${projectName}`)}
    ${chalk.cyan("pnpm install")}
    ${chalk.cyan("pnpm dev")}
  
  This will start a development server at:
    ${chalk.cyan("http://localhost:5173")}
  `);
}

init().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});
