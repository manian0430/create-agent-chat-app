#!/usr/bin/env node

import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "url";
import prompts from "prompts";

// Get the directory name of the current module
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

interface ProjectAnswers {
  projectName: string;
  framework: "vite" | "nextjs";
  includeAllAgents: boolean;
  includeReactAgent: boolean;
  includeMemoryAgent: boolean;
  includeResearchAgent: boolean;
  includeRetrievalAgent: boolean;
}

async function init(): Promise<void> {
  console.log(`
  ${chalk.green("Welcome to create-agent-chat-app!")}
  Let's set up your new agent chat application.
  `);

  // Collect user input for project name and framework
  const initialQuestions = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "What is the name of your project?",
      initial: "agent-chat-app",
    },
    {
      type: "select",
      name: "framework",
      message: "Which framework would you like to use?",
      choices: [
        { title: "Next.js", value: "nextjs", selected: true },
        { title: "Vite", value: "vite" },
      ],
      initial: 0,
    },
    {
      type: "confirm",
      name: "includeAllAgents",
      message: "Would you like to include all pre-built agents?",
      initial: false,
    },
  ]);

  // If user doesn't want all agents, ask which specific ones they want
  let agentSelections: {
    includeReactAgent?: boolean;
    includeMemoryAgent?: boolean;
    includeResearchAgent?: boolean;
    includeRetrievalAgent?: boolean;
  } = {
    includeReactAgent: false,
    includeMemoryAgent: false,
    includeResearchAgent: false,
    includeRetrievalAgent: false
  };
  
  if (!initialQuestions.includeAllAgents) {
    agentSelections = await prompts([
      {
        type: "confirm",
        name: "includeReactAgent",
        message: "Include ReAct agent?",
        initial: false,
      },
      {
        type: "confirm",
        name: "includeMemoryAgent",
        message: "Include Memory agent?",
        initial: false,
      },
      {
        type: "confirm",
        name: "includeResearchAgent",
        message: "Include Research agent?",
        initial: false,
      },
      {
        type: "confirm",
        name: "includeRetrievalAgent",
        message: "Include Retrieval agent?",
        initial: false,
      },
    ]);
  }

  // Combine all answers
  const answers: ProjectAnswers = {
    projectName: initialQuestions.projectName,
    framework: initialQuestions.framework,
    includeAllAgents: initialQuestions.includeAllAgents,
    includeReactAgent: initialQuestions.includeAllAgents || !!agentSelections.includeReactAgent,
    includeMemoryAgent: initialQuestions.includeAllAgents || !!agentSelections.includeMemoryAgent,
    includeResearchAgent: initialQuestions.includeAllAgents || !!agentSelections.includeResearchAgent,
    includeRetrievalAgent: initialQuestions.includeAllAgents || !!agentSelections.includeRetrievalAgent
  };

  const { projectName, framework } = answers;

  // Create project directory
  const targetDir: string = path.join(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`Error: Directory ${projectName} already exists.`));
    process.exit(1);
  }

  // Log the collected values
  console.log(`Project will be created at: ${chalk.green(targetDir)}\n`);
  console.log(`Framework: ${chalk.green(framework)}`);
  
  if (answers.includeAllAgents) {
    console.log(`Including: ${chalk.green("All pre-built agents")}`);
  } else {
    const selectedAgents = [];
    if (answers.includeReactAgent) selectedAgents.push("ReAct");
    if (answers.includeMemoryAgent) selectedAgents.push("Memory");
    if (answers.includeResearchAgent) selectedAgents.push("Research");
    if (answers.includeRetrievalAgent) selectedAgents.push("Retrieval");
    
    if (selectedAgents.length > 0) {
      console.log(`Including agents: ${chalk.green(selectedAgents.join(", "))}`);
    } else {
      console.log(`No additional agents selected.`);
    }
  }

  // Create the project directory
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(chalk.yellow("Creating project files..."));

  // Copy the base template files based on the selected framework
  const templateDir: string = path.join(__dirname, "..", "templates", framework);
  fs.copySync(templateDir, targetDir);

  // Copy agent templates if selected
  if (answers.includeAllAgents || answers.includeReactAgent) {
    copyAgentTemplate("react-agent", targetDir);
  }
  
  if (answers.includeAllAgents || answers.includeMemoryAgent) {
    copyAgentTemplate("memory-agent", targetDir);
  }
  
  if (answers.includeAllAgents || answers.includeResearchAgent) {
    copyAgentTemplate("research-agent", targetDir);
  }
  
  if (answers.includeAllAgents || answers.includeRetrievalAgent) {
    copyAgentTemplate("retrieval-agent", targetDir);
  }

  // Update package.json with project name
  const pkgJsonPath: string = path.join(targetDir, "package.json");
  const pkgJson: Record<string, any> = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  pkgJson.name = projectName;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  console.log(chalk.green("\nSuccess!"));
  console.log(`
  Your agent chat app has been created at ${chalk.green(targetDir)}
  
  To get started:
    ${chalk.cyan(`cd ${projectName}`)}
    ${chalk.cyan("pnpm install")}
    ${chalk.cyan("pnpm dev")}
  
  This will start a development server at:
    ${chalk.cyan(framework === "nextjs" ? "http://localhost:3000" : "http://localhost:5173")}
  `);
}

// Helper function to copy agent templates
function copyAgentTemplate(agentName: string, targetDir: string): void {
  const agentTemplateDir: string = path.join(__dirname, "..", "templates", agentName);
  
  // Determine the destination directory based on the agent type
  // This assumes a specific structure in your project - adjust as needed
  const agentDestDir: string = path.join(targetDir, "src", "agents", agentName);
  
  // Create the destination directory if it doesn't exist
  fs.mkdirSync(agentDestDir, { recursive: true });
  
  // Copy the agent template files
  fs.copySync(agentTemplateDir, agentDestDir);
  
  console.log(`${chalk.green("✓")} Added ${chalk.cyan(agentName)}`);
}

init().catch((err: Error) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});
