# Recipe and Ingredient Assistant Chatbot

An intelligent chatbot that helps users explore and learn how to cook a wide variety of dishes. Chatbot allows users to ask about recipes, required ingredients, quantities, and detailed cooking instructions. It supports natural language queries like “How to cook bò kho?” or “What ingredients do I need for bánh xèo?”. The system provides step-by-step cooking guides, alternative ingredient suggestions, and even meal ideas based on available ingredients. The backend handles natural language processing, recipe database queries, and user input parsing, while the frontend offers a chat-based interface for easy interaction.

## Live Demo
- Screenshots:
  - Sign In/Sign Up (using Google Account)
    <img width="1920" height="1080" alt="Screenshot from 2025-07-10 16-37-39" src="https://github.com/user-attachments/assets/6aff7c54-fff6-4908-a6fa-315f3192d38b" />
  - Chat Interface
    <img width="1920" height="1080" alt="Screenshot from 2025-07-09 17-43-44" src="https://github.com/user-attachments/assets/8f6bb2c1-4903-4b29-9926-a0938955f275" />

## Key Features
- Sign in / Sign up with Google Account
- Ask anything about food and cooking
- Create and manage multiple conversation sessions
- Store and view chat history
- Upload and process image-based queries

## Tech Stack
| Category | Tools / Frameworks      |
| -------- | ----------------------- |
| Frontend | React, Vite, TypeScript |
| Backend  | Python, Flask API       |
| AI / LLM | Llama-3.2-1B-Instruct   |
| Database | MongoDB                 |

## Project Structure
```bash
.
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/                    # Main UI components
│   │   ├── ChatInterface.tsx          # Chat interface component
│   │   ├── ChatLayout.tsx             # Layout wrapper for chat view
│   │   ├── Header.tsx
│   │   ├── Login.tsx                  # Google Sign-In component
│   │   ├── ProtectedRoute.tsx         # Route guard for authenticated users
│   │   └── Sidebar.tsx
│   ├── store/                         # Global state management (Zustand)
│   │   ├── authStore.ts               # Manages authentication state
│   │   └── chatStore.ts               # Manages chat history and sessions
│   ├── App.css
│   ├── App.tsx                        # Root React component
│   ├── config.ts                      # Configuration file (e.g. API endpoints)
│   ├── index.css
│   ├── main.tsx                       # App entry point
│   ├── styles.css
│   └── vite-env.d.ts
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json                       # Project dependencies and scripts
├── postcss.config.cjs
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts                     # Vite build and dev server config
```

## Getting Started

1. Clone the backend repository and start the server. More details: [chatbot-app-backend](https://github.com/nguyen-anh-hao/chatbot-app-backend)

3. Install dependencies for the frontend:
  ```bash
  npm install
  ```

3. Build and start the project:
  ```bash
  npm run build
  npm run start
  ```

## Authors
- **Nguyễn Anh Hào** - Software Developer
- **Trương Vĩnh An** - AI Engineer
- **Nguyễn Hữu Bền** - AI Engineer
- **Nguyễn Trần Gia** - AI Engineer
- **Võ Tuấn Tài** - Data Engineer

