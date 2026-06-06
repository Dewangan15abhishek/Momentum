# Momentum

A personal consistency tracking web app that helps you build and maintain long-term habits through visual progress tracking, streaks, and deadline analytics.

**Live Demo:** https://momentum-lilac-pi.vercel.app

---

## Features

- Google Authentication
- Create goals with targets, daily goals, and deadlines
- Log daily progress with hours spent and notes
- Activity heatmap showing consistency over time
- Streak tracking system
- Deadline analytics — required daily work to finish on time
- Fully responsive (mobile + desktop)

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router
- **Backend/Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Google Sign-In)
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites
- Node.js installed
- Firebase project with Firestore and Google Auth enabled

### Installation

```bash
git clone https://github.com/Dewangan15abhishek/Momentum.git
cd Momentum
npm install
```

Create a `src/firebase/config.js` file with your Firebase credentials:

```js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

### Run Locally

```bash
npm run dev
```

## Author

**Abhishek Dewangan**  
B.Tech CSE — KIIT University  
[GitHub](https://github.com/Dewangan15abhishek)
