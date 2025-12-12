// src/components/LeftSidebar/LeftSidebar.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import "./LeftSidebar.css";

import logo from "../../assets/ChatGPT Image Dec 6, 2025, 02_09_34 PM.png";
import menuIcon from "../../assets/6d6435ce-aa4f-4b0d-888e-610b19996d2b.png";
import searchIcon from "../../assets/a15dc9ed-a526-4ca7-bfa7-ba2f178164ce.png";
import profilePlaceholder from "../../assets/Profile.png";

import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { db, logout } from "../../config/firebase";

import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { toast } from "react-toastify";

export default function LeftSidebar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  const menuRef = useRef(null);
  const searchTimer = useRef(null);

  const navigate = useNavigate();
  const { userData, chatData = [], setChatUser, setMessagesId } =
    useContext(AppContext);

  /* ---------------- CLOSE MENU ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  /* ---------------- SEARCH LOGIC ---------------- */
  const inputHandler = (e) => {
    const txt = (e.target.value || "").trim().toLowerCase();

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }

    if (!txt) {
      setShowSearch(false);
      setFoundUser(null);
      return;
    }

    searchTimer.current = setTimeout(() => doSearch(txt), 300);
  };

  const doSearch = async (txt) => {
    setSearching(true);
    setShowSearch(true);

    try {
      const q = query(collection(db, "users"), where("username", "==", txt));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const usr = snap.docs[0].data();
        if (usr.id !== userData.id) setFoundUser(usr);
        else setFoundUser(null);
      } else {
        setFoundUser(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  /* ---------------- ADD CHAT ---------------- */
  const addChat = async () => {
    if (!foundUser || !userData) return;

    try {
      const exists = chatData.some((c) => c.rId === foundUser.id);
      if (exists) {
        toast.info("Chat already exists");
        const existing = chatData.find((c) => c.rId === foundUser.id);
        if (existing) {
          setChatUser(existing.userData || foundUser);
          setMessagesId(existing.messagesId || null);
        }
        return;
      }

      const messagesCollection = collection(db, "messages");
      const newMessageRef = doc(messagesCollection);

      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const now = Date.now();
      const myChatRef = doc(db, "chats", userData.id);
      const otherChatRef = doc(db, "chats", foundUser.id);

      await setDoc(myChatRef, { chatsData: [] }, { merge: true });
      await setDoc(otherChatRef, { chatsData: [] }, { merge: true });

      await updateDoc(myChatRef, {
        chatsData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: foundUser.id,
          updatedAt: now,
          messageSeen: true,
          userData: foundUser,
          hiddenFor: [],
        }),
      });

      await updateDoc(otherChatRef, {
        chatsData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: now,
          messageSeen: false,
          userData: userData,
          hiddenFor: [],
        }),
      });

      toast.success("Chat created!");
      setChatUser(foundUser);
      setMessagesId(newMessageRef.id);
      setShowSearch(false);
      setFoundUser(null);
      setOpenMenu(false);
    } catch (err) {
      console.error("addChat error", err);
      toast.error("Failed to create chat");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    try {
      await logout();
      setOpenMenu(false);
      navigate("/");
    } catch (err) {
      console.error("logout failed", err);
      toast.error("Logout failed");
    }
  };

  /* ---------------- OPEN CHAT & MARK SEEN ---------------- */
  const openChat = async (item) => {
    if (!userData) return;

    setChatUser(item.userData || null);
    setMessagesId(item.messagesId || null);

    try {
      const myChatRef = doc(db, "chats", userData.id);
      const snap = await getDoc(myChatRef);
      if (!snap.exists()) return;

      const data = snap.data() || {};
      const arr = Array.isArray(data.chatsData) ? data.chatsData : [];
      const idx = arr.findIndex(
        (c) => String(c.messagesId) === String(item.messagesId)
      );

      if (idx !== -1 && arr[idx].messageSeen === false) {
        arr[idx].messageSeen = true;
        await updateDoc(myChatRef, { chatsData: arr });
      }
    } catch (err) {
      console.error("Error marking seen:", err);
    }
  };

  /* ---------------- HIDE CHAT (TEMP DELETE) ---------------- */
  const hideChat = async (item) => {
    if (!userData) return;

    try {
      const myChatRef = doc(db, "chats", userData.id);
      const snap = await getDoc(myChatRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const arr = Array.isArray(data.chatsData) ? data.chatsData : [];

      const idx = arr.findIndex(
        (c) => String(c.messagesId) === String(item.messagesId)
      );

      if (idx === -1) return;

      const chat = arr[idx];
      const hiddenFor = Array.isArray(chat.hiddenFor)
        ? [...chat.hiddenFor]
        : [];

      if (!hiddenFor.includes(userData.id)) hiddenFor.push(userData.id);

      arr[idx] = { ...chat, hiddenFor };

      await updateDoc(myChatRef, { chatsData: arr });

      toast.success("Chat hidden");
    } catch (err) {
      console.error("Hide chat failed:", err);
      toast.error("Failed to hide chat");
    }
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="ls">
      {/* TOP SECTION */}
      <div className="ls-top">
        <div className="ls-nav">
          <img src={logo} className="logo" alt="logo" />

          <div className="menu" ref={menuRef}>
            <img
              src={menuIcon}
              alt="menu"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((prev) => !prev);
              }}
              className="menu-icon"
            />

            {openMenu && (
              <div className="sub-menu" role="menu">
                <button
                  className="sub-menu-item"
                  onClick={() => {
                    setOpenMenu(false);
                    navigate("/profile");
                  }}
                >
                  Edit Profile
                </button>

                <hr />

                <button
                  className="sub-menu-item"
                  onClick={() => {
                    setOpenMenu(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="ls-search">
          <img src={searchIcon} alt="search" />
          <input
            type="text"
            placeholder="Search Here..."
            onChange={inputHandler}
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="ls-list">
        {showSearch ? (
          foundUser ? (
            <div className="freinds add-user" onClick={addChat}>
              <img src={foundUser.avatar || profilePlaceholder} alt="" />
              <p>{foundUser.name || foundUser.username}</p>
            </div>
          ) : (
            <p className="no-user">
              {searching ? "Searching..." : "No user found"}
            </p>
          )
        ) : chatData.length > 0 ? (

          chatData
            .filter(
              (c) =>
                !Array.isArray(c.hiddenFor) ||
                !c.hiddenFor.includes(userData.id)
            )
            .map((item) => (
              <div
                key={item.messagesId}
                className="freinds"
                onClick={() => openChat(item)}
              >
                <img
                  src={item.userData?.avatar || profilePlaceholder}
                  alt="avatar"
                />

                <div className="freinds-meta">
                  <p>{item.userData?.name || item.userData?.username}</p>
                  <span>{item.lastMessage || ""}</span>
                </div>

                {!item.messageSeen && (
                  <span className="unread-dot" title="New messages"></span>
                )}

                {/* Hide chat button */}
                <button
                  className="hide-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    hideChat(item);
                  }}
                >
                  ✕
                </button>
              </div>
            ))

        ) : (
          <p className="no-user">No chats yet</p>
        )}
      </div>
    </div>
  );
}
