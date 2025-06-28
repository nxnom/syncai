#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

const RULES_FILE = 'Rules.md';
const SYMLINK_OPTIONS = [
  { name: 'GEMINI.md', value: 'GEMINI.md' },
  { name: 'CLAUDE.md', value: 'CLAUDE.md' },
  { name: '.github/copilot-instructions.md', value: '.github/copilot-instructions.md' },
  { name: '.cursorrules', value: '.cursorrules' },
  { name: '.clinerules', value: '.clinerules' },
  { name: '.windsurfrules', value: '.windsurfrules' }
];

const DEFAULT_RULES = `# AI Agent Rules

## Overview
This document contains the main rules for AI agents working on this project.

## General Guidelines
- Follow best practices for code quality and maintainability
- Write clear, concise, and well-documented code
- Prioritize security and performance
- Use consistent coding style throughout the project
- Test your code thoroughly before committing

## Project-Specific Rules
[Add your project-specific rules here]

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

async function checkAndCreateRules() {
  if (!fs.existsSync(RULES_FILE)) {
    console.log(chalk.yellow('Creating Rules.md with default content...'));
    fs.writeFileSync(RULES_FILE, DEFAULT_RULES);
    console.log(chalk.green('✓ Rules.md created successfully'));
    return true;
  }
  return false;
}

async function createSymlinks(selectedFiles, skipPrompts = false) {
  for (const file of selectedFiles) {
    const symlinkPath = path.resolve(file);
    const targetPath = path.resolve(RULES_FILE);
    
    // Create directory if needed
    const dir = path.dirname(symlinkPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Check if file exists and is not a symlink
    if (fs.existsSync(symlinkPath)) {
      const stats = fs.lstatSync(symlinkPath);
      if (!stats.isSymbolicLink()) {
        if (!skipPrompts) {
          const { confirmReplace } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmReplace',
              message: chalk.yellow(`⚠️  ${file} already exists and is NOT a symlink. Replace it? (WARNING: Data will be lost)`),
              default: false
            }
          ]);
          
          if (!confirmReplace) {
            console.log(chalk.gray(`  ⏭️  Skipped ${file}`));
            continue;
          }
        } else {
          console.log(chalk.yellow(`⚠️  Replacing existing file: ${file}`));
        }
      }
      fs.unlinkSync(symlinkPath);
    }
    
    try {
      // Create relative symlink
      const relativePath = path.relative(dir, targetPath);
      fs.symlinkSync(relativePath, symlinkPath);
      console.log(chalk.green(`✓ Created symlink: ${file} → ${RULES_FILE}`));
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
  // Parse command line arguments
  const args = process.argv.slice(2);
  const skipPrompts = args.includes('-y') || args.includes('--yes');
  
  // Display ASCII art and introduction
  console.log(chalk.cyan(`
    █████╗ ██╗██████╗ ██╗     ███╗   ██╗
   ██╔══██╗██║██╔══██╗██║     ████╗  ██║
   ███████║██║██████╔╝██║     ██╔██╗ ██║
   ██╔══██║██║██╔══██╗██║     ██║╚██╗██║
   ██║  ██║██║██║  ██║███████╗██║ ╚████║
   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
  `));
  
  console.log(chalk.blue.bold('  AI Rules Link\n'));
  console.log(chalk.gray('  🎯 One source of truth for all your AI agents'));
  console.log(chalk.gray('  📁 Automatically creates symlinks to:'));
  console.log(chalk.gray('     • Claude, Gemini, GitHub Copilot'));
  console.log(chalk.gray('     • Cursor, Cline, Windsurf'));
  console.log(chalk.gray('  ⚡ Edit once, update everywhere\n'));
  
  if (skipPrompts) {
    console.log(chalk.yellow('  ⚡ Running with -y flag: using all defaults\n'));
  }
  
  const rulesExists = fs.existsSync(RULES_FILE);
  
  if (rulesExists) {
    console.log(chalk.green('✓ Rules.md already exists'));
  } else {
    console.log(chalk.yellow('⚠ Rules.md not found. It will be created after selection.'));
  }
  
  console.log(chalk.cyan('📍 Checking existing files...'));
  const existingSymlinks = [];
  const existingFiles = [];
  
  for (const option of SYMLINK_OPTIONS) {
    if (fs.existsSync(option.value)) {
      try {
        const stats = fs.lstatSync(option.value);
        if (stats.isSymbolicLink()) {
          const target = fs.readlinkSync(option.value);
          if (target.includes(RULES_FILE) || path.resolve(path.dirname(option.value), target) === path.resolve(RULES_FILE)) {
            existingSymlinks.push(option.value);
            console.log(chalk.gray(`  ✓ ${option.value} → ${RULES_FILE} (symlink)`));
          }
        } else {
          existingFiles.push(option.value);
          console.log(chalk.yellow(`  ⚠️  ${option.value} (regular file - will need confirmation to replace)`));
        }
      } catch (error) {
        console.error(chalk.red(`  ✗ Error reading ${option.value}: ${error.message}`));
      }
    }
  }
  
  if (existingSymlinks.length === 0 && existingFiles.length === 0) {
    console.log(chalk.gray('  ➤ No existing files found'));
  }
  
  let selectedFiles;
  let addToGitignore;
  
  if (skipPrompts) {
    // Use all files and add to gitignore by default
    selectedFiles = SYMLINK_OPTIONS.map(option => option.value);
    addToGitignore = true;
    console.log(chalk.cyan('\n✅ Selected all files for symlinking'));
  } else {
    const fileAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFiles',
        message: 'Select files to link to Rules.md (use space to toggle, enter to confirm):',
        choices: SYMLINK_OPTIONS.map(option => ({
          ...option,
          checked: true 
        }))
      }
    ]);
    selectedFiles = fileAnswer.selectedFiles;
    
    if (selectedFiles.length === 0) {
      console.log(chalk.yellow('\nNo files selected. Exiting...'));
      process.exit(0);
    }
    
    // Warn about files that will be replaced
    const filesToReplace = selectedFiles.filter(file => existingFiles.includes(file));
    if (filesToReplace.length > 0) {
      console.log(chalk.red.bold('\n⚠️  WARNING: The following files already exist and are NOT symlinks:'));
      filesToReplace.forEach(file => console.log(chalk.red(`   • ${file}`)));
      console.log(chalk.yellow('   These files will be replaced and their contents will be LOST!'));
    }
    
    const gitignoreAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addToGitignore',
        message: 'Add symlink files to .gitignore?',
        default: true
      }
    ]);
    addToGitignore = gitignoreAnswer.addToGitignore;
  }
  
  if (!rulesExists) {
    console.log(chalk.cyan('\n📝 Creating Rules.md...'));
    const wasCreated = await checkAndCreateRules();
  }
  
  console.log(chalk.cyan('\n🔗 Creating symlinks...'));
  await createSymlinks(selectedFiles, skipPrompts);
  
  if (addToGitignore) {
    console.log(chalk.cyan('\n📄 Updating .gitignore...'));
    await updateGitignore(selectedFiles);
  }
  
  console.log(chalk.green.bold('\n✨ Done! All selected files are now linked to Rules.md'));
  console.log(chalk.gray('Any changes to Rules.md will be reflected in all linked files.'));
  console.log(chalk.cyan('\n💡 Pro tip: Run `airln -y` next time to skip all prompts!\n'));
}

// Run the CLI
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});
