# Legal Aura UI - AI Legal Assistant

An AI-powered legal assistant application built with React, TypeScript, and Google's Gemini API. This application provides users with legal information and guidance based on Indian law, with a focus on the Constitution of India.

## Features

- **AI-Powered Legal Assistance**: Get responses from Google's Gemini AI trained on Indian legal principles
- **Multiple Model Support**: Choose from various Gemini models including Gemini 2.5 Flash, Pro, and legacy models
- **Chat History Management**: Start new chats, switch between conversations, and persistent chat storage
- **Delete Conversations**: Remove unwanted chat sessions with the delete button
- **Legal Reference Extraction**: Automatic extraction and display of relevant legal sections and articles
- **Modern UI**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS
- **Dark/Light Theme Support**: Toggle between themes for comfortable viewing
- **Real-time Responses**: Live chat interface with typing indicators and loading states

## Setup Instructions

### Prerequisites

- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd legal-aura-ui
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up Gemini API Key**

   Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start the development server**
   ```sh
   npm run dev
   ```

## Usage

- **Start a new chat**: Click the "New Chat" button in the sidebar
- **Ask legal questions**: Type your questions in the input field at the bottom
- **View chat history**: All conversations are automatically saved and can be accessed from the sidebar
- **Switch between chats**: Click on any chat in the sidebar to switch to it
- **Delete conversations**: Hover over a chat in the sidebar and click the trash icon to delete it
- **Select AI model**: Use the model selector in the header to choose between different Gemini models
- **Legal references**: AI responses include relevant sections and articles automatically

## Important Disclaimer

⚖️ **This application provides general legal information only. It is not a substitute for professional legal advice. Always consult qualified legal professionals for specific legal matters.**

## Available Gemini Models

The application supports the following Gemini models:

- **gemini-2.5-flash** - Latest fast model (Default)
- **gemini-2.5-pro** - Latest high-performance model
- **gemini-2.0-flash** - Previous generation fast model
- **gemini-2.0-flash-lite** - Lightweight version of 2.0 Flash
- **gemini-flash-latest** - Always points to latest Flash model
- **gemini-pro-latest** - Always points to latest Pro model
- **models/gemini-2.5-flash** - Alternative naming for 2.5 Flash
- **models/gemini-2.5-pro** - Alternative naming for 2.5 Pro
- **models/gemini-2.0-flash** - Alternative naming for 2.0 Flash

You can switch between models using the dropdown in the header. Different models may offer varying response quality, speed, and capabilities.

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── ChatLayout.tsx    # Main chat interface
│   ├── ChatMessages.tsx  # Message display component
│   ├── ChatInput.tsx     # Message input component
│   ├── ChatSidebar.tsx   # Sidebar with chat history
│   └── ThemeToggle.tsx   # Theme switching
├── hooks/
│   └── useChatHistory.ts # Chat management hook
├── lib/
│   └── gemini.ts         # Gemini API service
└── pages/
    ├── Index.tsx
    └── NotFound.tsx
```

## Development

```sh
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Deployment

Deploy easily using [Lovable](https://lovable.dev/projects/8fa0072f-01a9-4cbd-911f-c3bbe4a744b0):

1. Open your Lovable project
2. Click Share → Publish
3. Your app will be live!

## Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Follow the setup instructions

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
