# create-agent-chat-app

A CLI tool to bootstrap a LangGraph chat application quickly.

## Description

This package provides a CLI tool to create a LangGraph chat application with minimal configuration. It sets up a Vite-based React application that can connect to your LangGraph deployment.

## Usage

```bash
# Using npx (recommended)
npx create-agent-chat-app

# Or install globally
npm install -g create-agent-chat-app
create-agent-chat-app
```

The CLI will prompt you for:

1. Deployment URL (default: http://localhost:2024)
2. Default graph/assistant ID (default: agent)
3. Project name

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/create-agent-chat-app.git
cd create-agent-chat-app

# Install dependencies
yarn install

# Build the package
yarn build
```

### Testing Locally

You can test the CLI locally by linking the package:

```bash
# In the project directory
npm link

# Then run
create-agent-chat-app
```

### Publishing

To publish to npm:

```bash
# Make sure you're logged in to npm
npm login

# Publish the package
npm publish
```

## License

MIT
