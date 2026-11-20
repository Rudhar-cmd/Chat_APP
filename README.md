# Chat App

A responsive one-to-one messaging app built with React and Firebase. It uses Firebase Authentication for accounts and Cloud Firestore for chat data and real-time updates—there is no separate custom backend.

![Chat App preview](https://github.com/user-attachments/assets/77b8fad7-b584-4ea9-8c9f-2545017af6db)

## Features

- Sign up and sign in with email and password
- Create a profile with a name, bio, phone number, and avatar
- Find people by username and start a direct conversation
- Receive live chat and message updates from Firestore
- Send text messages and select image attachments
- View conversation media and message timestamps
- See unread conversation indicators
- Hide conversations, delete your own messages, and report a conversation
- Use the chat layout on desktop and mobile

## Built with

- React 19 and Vite
- JavaScript and CSS
- Firebase Authentication
- Cloud Firestore
- React Router

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Firebase project

### Install and run

```bash
git clone https://github.com/Rudhar-cmd/Chat_APP.git
cd Chat_APP
npm install
npm run dev
```

Vite prints a local URL in the terminal after the development server starts.

### Configure Firebase

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password** under Authentication providers.
3. Create a Cloud Firestore database.
4. Register a web app in the Firebase project.
5. Add your web app's Firebase configuration to the `firebaseConfig` object in [`src/config/firebase.js`](./src/config/firebase.js).
6. Configure Firestore Security Rules for your app before using real user data.

The Firebase web configuration is used by the browser and is not an authorization boundary. Restrict the API key where appropriate, and use Security Rules to protect user and chat data. Do not use open/test-mode Firestore rules in production.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Data model

The app stores its data in Firestore:

- `users/{uid}` — account profile information
- `chats/{uid}` — a user's conversation list and last-message metadata
- `messages/{conversationId}` — messages for a conversation
- `reports/{reportId}` — submitted conversation reports

## Project structure

```text
src/
├── components/
│   ├── Avatar.jsx
│   ├── Chatbox/
│   ├── LeftSidebar/
│   └── RightSidebar/
├── config/
│   └── firebase.js
├── context/
│   └── AppContext.jsx
├── pages/
│   ├── Chat/
│   ├── Login/
│   └── ProfileUpdate/
├── assets/
├── App.jsx
└── main.jsx
```

## Notes

- Firebase Authentication and Firestore are accessed directly from the client; Firebase Security Rules are essential.
- Image selection includes a local preview. Persistent image sharing across devices requires uploading images to Firebase Storage; the current message flow does not yet provide that persistence.

## License

No license file is currently included in this repository.
