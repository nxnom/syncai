#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

const INSTRUCTIONS_FILE = 'Instructions.md';
const SYMLINK_OPTIONS = [
  { name: 'GEMINI.md', value: 'GEMINI.md' },
  { name: 'CLAUDE.md', value: 'CLAUDE.md' },
  { name: '.github/copilot-instructions.md', value: '.github/copilot-instructions.md' },
  { name: '.cursorrules', value: '.cursorrules' },
  { name: '.clinerules', value: '.clinerules' },
  { name: '.windsurfrules', value: '.windsurfrules' }
];

const DEFAULT_INSTRUCTIONS = `# AI Agent Instructions

## Overview
This document contains the main instructions for AI agents working on this project.

## General Guidelines
- Follow best practices for code quality and maintainability
- Write clear, concise, and well-documented code
- Prioritize security and performance
- Use consistent coding style throughout the project
- Test your code thoroughly before committing

## Project-Specific Instructions
[Add your project-specific instructions here]

## Code Style
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Follow the existing code patterns in the project

## Communication
- Provide clear explanations for your changes
- Ask for clarification when requirements are unclear
- Report any potential issues or improvements
`;

async function checkAndCreateInstructions() {
  if (!fs.existsSync(INSTRUCTIONS_FILE)) {
    console.log(chalk.yellow('Creating Instructions.md with default content...'));
    fs.writeFileSync(INSTRUCTIONS_FILE, DEFAULT_INSTRUCTIONS);
    console.log(chalk.green('✓ Instructions.md created successfully'));
    return true;
  }
  return false;
}

async function createSymlinks(selectedFiles) {
  for (const file of selectedFiles) {
    const symlinkPath = path.resolve(file);
    const targetPath = path.resolve(INSTRUCTIONS_FILE);
    
    // Create directory if needed
    const dir = path.dirname(symlinkPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Remove existing file/symlink if it exists
    if (fs.existsSync(symlinkPath)) {
      fs.unlinkSync(symlinkPath);
    }
    
    try {
      // Create relative symlink
      const relativePath = path.relative(dir, targetPath);
      fs.symlinkSync(relativePath, symlinkPath);
      console.log(chalk.green(`✓ Created symlink: ${file} → ${INSTRUCTIONS_FILE}`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to create symlink for ${file}: ${error.message}`));
    }
  }
}

async function updateGitignore(files) {
  const gitignorePath = '.gitignore';
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  const lines = gitignoreContent.split('\n').map(line => line.trim());
  
  let added = [];
  for (const file of files) {
    if (!lines.includes(file)) {
      lines.push(file);
      added.push(file);
    }
  }
  
  if (added.length > 0) {
    fs.writeFileSync(gitignorePath, lines.join('\n'));
    console.log(chalk.green(`✓ Added ${added.length} file(s) to .gitignore`));
    added.forEach(file => console.log(chalk.gray(`  + ${file}`)));
  } else {
    console.log(chalk.gray('✓ All symlinks already in .gitignore'));
  }
}

async function main() {
  console.log(chalk.blue.bold('\n🤖 AI Agent Instructions Generator\n'));
  
  const instructionsExists = fs.existsSync(INSTRUCTIONS_FILE);
  
  if (instructionsExists) {
    console.log(chalk.green('✓ Instructions.md already exists'));
  } else {
    console.log(chalk.yellow('⚠ Instructions.md not found. It will be created after selection.'));
  }
  
  console.log(chalk.cyan('\nChecking existing symlinks...'));
  const existingSymlinks = [];
  
  for (const option of SYMLINK_OPTIONS) {
    if (fs.existsSync(option.value)) {
      try {
        const stats = fs.lstatSync(option.value);
        if (stats.isSymbolicLink()) {
          const target = fs.readlinkSync(option.value);
          if (target.includes(INSTRUCTIONS_FILE) || path.resolve(path.dirname(option.value), target) === path.resolve(INSTRUCTIONS_FILE)) {
            existingSymlinks.push(option.value);
            console.log(chalk.gray(`  ${option.value} → ${INSTRUCTIONS_FILE}`));
          }
        }
      } catch (error) {
        chalk.red(`✗ Error reading symlink ${option.value}: ${error.message}`);
      }
    }
  }
  
  if (existingSymlinks.length === 0) {
    console.log(chalk.gray('  No existing symlinks found'));
  }
  
  const { selectedFiles } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedFiles',
      message: 'Select files to link to Instructions.md (use space to toggle, enter to confirm):',
      choices: SYMLINK_OPTIONS.map(option => ({
        ...option,
        checked: true 
      }))
    }
  ]);
  
  if (selectedFiles.length === 0) {
    console.log(chalk.yellow('\nNo files selected. Exiting...'));
    process.exit(0);
  }
  
  const { addToGitignore } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addToGitignore',
      message: 'Add symlink files to .gitignore?',
      default: true
    }
  ]);
  
  if (!instructionsExists) {
    console.log(chalk.cyan('\nCreating Instructions.md...'));
    const wasCreated = await checkAndCreateInstructions();
  }
  
  console.log(chalk.cyan('\nCreating symlinks...'));
  await createSymlinks(selectedFiles);
  
  if (addToGitignore) {
    console.log(chalk.cyan('\nUpdating .gitignore...'));
    await updateGitignore(selectedFiles);
  }
  
  console.log(chalk.green.bold('\n✨ Done! All selected files are now linked to Instructions.md'));
  console.log(chalk.gray('Any changes to Instructions.md will be reflected in all linked files.\n'));
}

// Run the CLI
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});
