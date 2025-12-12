# Chat_APP

- screenshot: <img width="1102" height="656" alt="Screenshot 2025-12-12 at 1 56 13 PM" src="https://github.com/user-attachments/assets/77b8fad7-b584-4ea9-8c9f-2545017af6db" />


- description: |
    A real-time chat application built with React and Firebase.
    Users can sign up, log in, and chat instantly with real-time updates.
    The UI is clean, responsive, and optimized for a modern chatting experience.

# Description
description: |
  Chat_App is a responsive real-time chatting application.
  It lets users authenticate securely and exchange messages instantly.
  Firebase Authentication handles user login, while Firestore provides live chat updates.

# Features
features:
  - User signup (Firebase Authentication)
  - User login with email/password
  - Real-time messaging using Firestore
  - Auto-scroll to latest message
  - Timestamps on messages
  - Responsive UI (mobile + desktop)
  - Context API for global user state
  - Error handling for login/signup
  - Protected chat route

# Technologies Used
technologies_used:
  frontend:
    - React (Vite)
    - JavaScript (ES6+)
    - CSS3
  backend:
    - Firebase Authentication
    - Firebase Firestore
  tools:
    - Git & GitHub
    - VS Code
    - Netlify / Vercel
    - npm

# Project Structure
project_structure:
  public: "Static assets and index.html"
  src:
    Assets: "Logos and icons"
    Components:
      Login.jsx: "Handles login logic + UI"
      Signup.jsx: "Handles new user registration"
      Chat.jsx: "Chat interface and Firestore logic"
    context:
      UserContext.jsx: "Manages global auth state"
    firebase:
      firebase.jsx: "Firebase configuration file"
    root_files:
      App.jsx: "Main routing & component integration"
      App.css: "Global styles"
      index.css: "Base styles"
      main.jsx: "React entry point"
  config_files:
    - vite.config.js
    - ".env (Stores Firebase API keys securely)"

# Environment Variables
environment_variables:
  info: "Create a `.env` file in the project root:"
  variables:
    - VITE_FIREBASE_API_KEY
    - VITE_FIREBASE_AUTH_DOMAIN
    - VITE_FIREBASE_PROJECT_ID
    - VITE_FIREBASE_STORAGE_BUCKET
    - VITE_FIREBASE_MESSAGING_SENDER_ID
    - VITE_FIREBASE_APP_ID

# Installation
installation:
  steps:
    - step: "Clone the repository"
      command: "git clone https://github.com/Rudhar-cmd/Chat_APP.git"

    - step: "Navigate to project directory"
      command: "cd Chat_APP"

    - step: "Install dependencies"
      command: "npm install"

    - step: "Run development server"
      command: "npm run dev"

# Usage
usage:
  description: |
    1. Sign up or log in.
    2. Enter the chat room.
    3. Type your message and send.
    4. Messages appear instantly with timestamps.

# Example Chat Flow
example_flow:
  - "User signs up"
  - "User logs in"
  - "Chat page loads"
  - "User sends message: 'Hello!'"
  - "Firestore updates instantly"

# Firebase Services Used
firebase_services:
  authentication:
    - "Email & Password Authentication"
    - "Invalid credential error handling"
  firestore:
    - "Stores chat messages"
    - "Real-time update listeners"

# License
license:
  type: MIT
  description: "This project is open-source under the MIT License."

  github: "https://github.com/Rudhar-cmd"
  repository: "https://github.com/Rudhar-cmd/Chat_APP"
