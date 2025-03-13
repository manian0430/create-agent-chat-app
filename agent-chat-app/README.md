# Agent Chat UI

Agent Chat UI is a Vite + React application which enables chatting with any LangGraph server with a `messages` key through a chat interface.

## Setup

> [!TIP]
> Don't want to run the app locally? Use the deployed site here: [agent-chat-ui.vercel.app](https://agentchat.vercel.app)!

First, clone the repository:

```bash
git clone https://github.com/langchain-ai/agent-chat-ui.git

cd agent-chat-ui
```

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

## Usage

Once the app is running (or if using the deployed site), you'll be prompted to enter:

- **Deployment URL**: The URL of the LangGraph server you want to chat with. This can be a production or development URL.
- **Assistant/Graph ID**: The name of the graph, or ID of the assistant to use when fetching, and submitting runs via the chat interface.
- **LangSmith API Key**: (only required for connecting to deployed LangGraph servers) Your LangSmith API key to use when authenticating requests sent to LangGraph servers.

After entering these values, click `Continue`. You'll then be redirected to a chat interface where you can start chatting with your LangGraph server.

## Features

### Multi-Agent System
- Collaborative AI agents with different roles (Researcher, Analyzer, Summarizer)
- Dynamic agent management with ability to add custom agents
- Role-based context-aware responses
- Active/Inactive agent toggling
- Real-time agent interactions with the chat
- Customizable agent roles and responsibilities
- Easy integration with existing chat flow

### Chat Export Functionality
- Export your entire chat history with one click
- Support for both JSON and plain text formats
- Automatic timestamping of exports
- JSON format includes detailed message metadata
- Text format provides clean, readable conversation logs
- Downloads are named with timestamps for easy organization

### Enhanced API Key Management
- Secure storage of LangSmith API keys in browser's local storage
- Real-time validation of API key format
- Visual feedback for valid/invalid keys
- Easy key management with save/clear functionality

### Getting Started with API Keys
1. When you first launch the application, you'll be prompted to enter your API key
2. The key should start with `lsv2_pt_`
3. Valid keys will show a green indicator
4. Invalid keys will show a red indicator and cannot be saved
5. You can clear your stored key at any time

> [!NOTE]
> The LangSmith API key is only required when connecting to deployed LangGraph servers. For local development, you can skip this step.
