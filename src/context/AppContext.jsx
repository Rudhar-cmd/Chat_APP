import React, { createContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);

  // ✅ ADDED (mobile navigation support)
  const [activeView, setActiveView] = useState("sidebar"); // sidebar | chat
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const authUnsubRef = useRef(null);
  const chatUnsubRef = useRef(null);
  const messagesUnsubRef = useRef(null);

  const loadUserData = async (uid) => {
    if (!uid) return;
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        navigate("/profile");
        return;
      }

      const data = { id: uid, ...(snap.data() || {}) };
      setUserData(data);

      const complete = data.name && data.avatar;
      if (complete && location.pathname === "/profile") navigate("/chat");
      if (!complete) navigate("/profile");

      updateDoc(ref, { lastSeen: serverTimestamp() }).catch(() => {});
    } catch (err) {
      console.error("loadUserData error:", err);
    }
  };

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    authUnsubRef.current = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserData(user.uid);
      } else {
        setUserData(null);
        setChatData([]);
        navigate("/");
      }
    });

    return () => {
      if (authUnsubRef.current) authUnsubRef.current();
    };
  }, []);

  /* ---------------- CHATS ---------------- */
  useEffect(() => {
    if (!userData?.id) return;

    const ref = doc(db, "chats", userData.id);
    chatUnsubRef.current = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        setChatData([]);
        return;
      }

      const raw = snap.data().chatsData || [];
      const resolved = await Promise.all(
        raw.map(async (chat) => {
          const otherRef = doc(db, "users", chat.rId);
          const otherSnap = await getDoc(otherRef);
          return {
            ...chat,
            userData: { id: chat.rId, ...(otherSnap.data() || {}) }
          };
        })
      );

      resolved.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setChatData(resolved);
    });

    return () => chatUnsubRef.current?.();
  }, [userData]);

  useEffect(() => {
    if (!messagesId) {
      setMessages([]);
      return;
    }

    const ref = doc(db, "messages", messagesId);

    messagesUnsubRef.current = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      setMessages(snap.data().messages || []);
    });

    return () => messagesUnsubRef.current?.();
  }, [messagesId]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        setActiveView("sidebar");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (chatUser && isMobile) {
      setActiveView("chat");
    }
  }, [chatUser, isMobile]);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        loadUserData, 
        chatData,
        setChatData,
        chatUser,
        setChatUser,
        messagesId,
        setMessagesId,
        messages,
        setMessages,

        isMobile,
        activeView,
        setActiveView
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
