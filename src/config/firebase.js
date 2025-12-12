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
  apiKey: "AIzaSyAqqa-PFmn859nemhCI-aVrcAcEPKFPRwg",
  authDomain: "chat-app-63211.firebaseapp.com",
  projectId: "chat-app-63211",
  storageBucket: "chat-app-63211.firebasestorage.app",
  messagingSenderId: "459588460726",
  appId: "1:459588460726:web:9784a8aef0861370054617"
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