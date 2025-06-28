# AIRLN - Dead simple AI Rules Link

<div align="center">

```
    █████╗ ██╗██████╗ ██╗     ███╗   ██╗
   ██╔══██╗██║██╔══██╗██║     ████╗  ██║
   ███████║██║██████╔╝██║     ██╔██╗ ██║
   ██╔══██║██║██╔══██╗██║     ██║╚██╗██║
   ██║  ██║██║██║  ██║███████╗██║ ╚████║
   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
```

**🎯 One source of truth for all your AI Agent rules**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2012.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/nxnom/airln/pulls)

</div>

## 🤔 The Problem

Are you tired of maintaining separate instruction files for every AI code assistant? Do you find yourself copying and pasting the same rules across multiple files whenever you make updates?

## ✨ The Solution

AIRLN (AI Rules Link) solves this by creating a single `Rules.md` file that automatically syncs to all your AI agent configuration files through symbolic links. 

**Edit once, update everywhere!**

## 🚀 Quick Start

### Installation

```bash
# Install globally via npm
npm install -g airln

# Or using yarn
yarn global add airln

# Or run directly with npx (no installation needed)
npx airln
```

#### Install from source

```bash
# Clone the repository
git clone https://github.com/nxnom/airln.git
cd airln

# Install dependencies
yarn install

# Link globally
yarn link
```

### Usage

```bash
# Interactive mode (recommended for first time)
airln

# Skip all prompts and use defaults
airln -y
```

## 📸 Demo

<div align="center">
  <img src="demo.gif" alt="AGRG Demo" width="600">
</div>

## 🤝 Contributing

We welcome contributions! If your favorite AI agent or code editor isn't supported yet, please create a Pull Request.

### Adding Support for New AI Agents

1. Fork the repository
2. Edit `cli.js` and add your agent to the `SYMLINK_OPTIONS` array:
   ```javascript
   const SYMLINK_OPTIONS = [
     // ... existing options
     { name: 'Your Agent Name', value: '.youragentfile' }
   ];
   ```
3. Submit a Pull Request with:
   - The agent/editor name
   - The expected file location
   - A link to documentation (if available)

### Development

```bash
# Run locally
node cli.js
```

## 🔧 How It Works

1. **Creates `Rules.md`**: If it doesn't exist, AGRG creates it with sensible defaults
2. **Creates Symlinks**: Selected files are symlinked to `Rules.md`
3. **Updates `.gitignore`**: Optionally adds symlinked files to `.gitignore`
4. **Single Edit Point**: Edit `Rules.md` and all symlinked files update automatically

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🐛 Issues & Feature Requests

Found a bug or have a feature request? Please [open an issue](https://github.com/nxnom/airln/issues).

---

<div align="center">
  Made with ❤️ by developers, for developers
</div>
