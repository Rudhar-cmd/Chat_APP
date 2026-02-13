// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {doc, getFirestore, setDoc} from "firebase/firestore"
import { use } from "react";
import { toast } from "react-toastify";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "",
      phone: "",
      lastSeen: Date.now()
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatData: []
    });

    return "NEW_USER";   // ⭐ IMPORTANT
  } catch (error) {
    console.error(error);
    toast.error(error.code);
  }
};



const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Login Successful!");
    return "LOGGED_IN"; 
  } catch (error) {
    console.error(error);
    toast.error(error.code);
  }
};


const logout = async()=>{
    try{
      await signOut(auth)
    } 
    catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-'.join(" ")));
  }
};

export {signup,login,auth,db,logout}