// src/components/Chatbox/Chatbox.jsx
import React, { useContext, useRef, useState, useEffect } from "react";
import "./Chatbox.css";

import defaultProfile from "../../assets/Profile.png";
import green from "../../assets/green.png";
import helpIcon from "../../assets/Help.png";
import gallary from "../../assets/Gallary.png";
import sendIcon from "../../assets/Send.png";
import Logo from "../../assets/ChatGPT Image Dec 6, 2025, 02_09_34 PM.png";

import { AppContext } from "../../context/AppContext";
import { db } from "../../config/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  collection,
  addDoc,
  setDoc,
} from "firebase/firestore";

export default function Chatbox() {
  const { userData, chatUser, messages, setMessages, messagesId } =
    useContext(AppContext);

  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  const formatTime = (ts) => {
    if (!ts) return "";
    if (typeof ts === "object" && ts !== null && typeof ts.toMillis === "function") {
      return new Date(ts.toMillis()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 60);
    }
  }, [messages]);

  // Helper: update chat entry (create or update) for a given userId
  // sets lastMessage, updatedAt and messageSeen per `seen` boolean
  const upsertChatEntry = async (ownerUserId, entryForOtherUserId, messagesIdValue, lastMessageText, seen) => {
    if (!ownerUserId) return;
    try {
      const myChatRef = doc(db, "chats", ownerUserId);
      const snap = await getDoc(myChatRef);

      if (!snap.exists()) {
        // ensure doc exists
        await setDoc(myChatRef, { chatsData: [] }, { merge: true });
      }

      const freshSnap = await getDoc(myChatRef);
      const data = freshSnap.data() || {};
      const arr = Array.isArray(data.chatsData) ? [...data.chatsData] : [];

      const idx = arr.findIndex((c) => String(c.messagesId) === String(messagesIdValue));
      const now = Date.now();

      if (idx === -1) {
        // create new entry
        const newEntry = {
          messagesId: messagesIdValue,
          lastMessage: lastMessageText || "",
          rId: entryForOtherUserId || null,
          updatedAt: now,
          messageSeen: !!seen,
        };
        arr.push(newEntry);
      } else {
        // update existing
        arr[idx] = {
          ...arr[idx],
          lastMessage: lastMessageText || arr[idx].lastMessage || "",
          updatedAt: now,
          messageSeen: !!seen,
        };
      }

      await updateDoc(myChatRef, { chatsData: arr });
    } catch (err) {
      console.error("upsertChatEntry error", err);
    }
  };

  /* ------------------- SEND MESSAGE ------------------- */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;
    if (!messagesId || !chatUser || !userData) return;

    const msg = {
      id: Date.now(),
      from: userData.id,
      text: input.trim(),
      image: imagePreview?.url || null,
      createdAt: Date.now(),
    };

    // optimistic UI
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), msg]);

    try {
      // 1) push message to messages doc
      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion(msg),
      });

      // 2) update chats for sender (current user) -> seen true
      await upsertChatEntry(userData.id, chatUser.id, messagesId, msg.text || (msg.image ? "Image" : ""), true);

      // 3) update chats for recipient -> seen false (unread)
      await upsertChatEntry(chatUser.id, userData.id, messagesId, msg.text || (msg.image ? "Image" : ""), false);
    } catch (err) {
      console.error("Error sending message / updating chats", err);
      // Optionally show toast
    }

    setInput("");
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImagePreview({
      url: URL.createObjectURL(f),
      name: f.name,
    });
  };

  const removePreview = () => {
    if (imagePreview?.url && imagePreview.url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview.url);
      } catch (e) {}
    }
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ------------------- DELETE MESSAGE ------------------- */
  const deleteMessage = async (messageId) => {
    if (!messagesId) return;
    const msgToDelete = (messages || []).find((m) => String(m.id) === String(messageId));
    if (!msgToDelete) return;
    if (String(msgToDelete.from) !== String(userData.id)) {
      console.warn("Not authorized to delete this message");
      return;
    }
    if (!window.confirm("Delete this message?")) return;

    // optimistic remove locally
    setMessages((prev) => (Array.isArray(prev) ? prev.filter((m) => String(m.id) !== String(messageId)) : []) );
    setSelectedMsg(null);

    try {
      const docRef = doc(db, "messages", messagesId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const current = Array.isArray(data.messages) ? data.messages : [];
      const filtered = current.filter((m) => String(m.id) !== String(messageId));
      await updateDoc(docRef, { messages: filtered });
    } catch (err) {
      console.error("Failed to delete message in Firestore:", err);
      alert("Failed to delete message. Check console.");
    }
  };

  /* ------------------- REPORT ------------------- */
  const openReportModal = () => {
    if (!messagesId) {
      alert("No active conversation to report.");
      return;
    }
    setReportReason("");
    setReportOpen(true);
  };

  const reportConversationForMe = async (reason) => {
    if (!messagesId) return;
    setReporting(true);
    // hide locally
    setMessages([]);

    try {
      const messagesRef = doc(db, "messages", messagesId);
      const snap = await getDoc(messagesRef);
      if (snap.exists()) {
        const data = snap.data();
        const current = Array.isArray(data.messages) ? data.messages : [];
        const mapped = current.map((m) => {
          const deletedFor = Array.isArray(m.deletedFor) ? [...m.deletedFor] : [];
          if (!deletedFor.includes(userData.id)) deletedFor.push(userData.id);
          return { ...m, deletedFor };
        });
        await updateDoc(messagesRef, { messages: mapped });
      }

      // add admin report doc
      try {
        const reportsRef = collection(db, "reports");
        await addDoc(reportsRef, {
          messagesId,
          reportedBy: userData.id,
          reportedUserId: chatUser?.id || null,
          reason: reason || "",
          reportedAt: Date.now(),
        });
      } catch (errReports) {
        console.error("Failed to write admin report entry:", errReports);
      }

      setReportOpen(false);
      alert("Reported. Conversation hidden locally.");
    } catch (err) {
      console.error("Failed to report conversation:", err);
      alert("Failed to report. Try again.");
    } finally {
      setReporting(false);
    }
  };

  /* ------------------- RENDER ------------------- */
  if (!chatUser) {
    return (
      <div className="chat-welcome">
        <img src={Logo} alt="logo" />
        <p style={{ fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
          Chat Anytime
        </p>
      </div>
    );
  }

  return (
    <div className="chat-box">
      {/* HEADER */}
      <div className="chat-user">
        <div className="header-avatar-wrap">
          <img src={chatUser.avatar || defaultProfile} className="header-avatar" alt="" />
          <span className="online-dot" />
        </div>

        <div className="header-title">
          <div className="header-name">
            {chatUser.name || chatUser.username || "Unknown"}
            <img src={green} className="header-dot-icon" alt="" />
          </div>
          <div className="header-sub">
            {chatUser.bio || "Hey, There I am Using Chat App"}
          </div>
        </div>

        <button type="button" className="help-icon-btn" title="Report / Help" onClick={openReportModal}>
          <img src={helpIcon} alt="help" />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="chat-msg" ref={scrollRef} onClick={(e) => { if (e.target === e.currentTarget) setSelectedMsg(null); }}>
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((m, index) => {
            if (Array.isArray(m.deletedFor) && m.deletedFor.includes(userData.id)) return null;
            const mine = String(m.from) === String(userData.id);

            return (
              <div key={m.id ?? index} className={mine ? "s-msg" : "r-msg"}>
                {!mine && (
                  <div className="msg-info">
                    <img src={chatUser.avatar || defaultProfile} alt="avatar" />
                    <span className="msg-time">{formatTime(m.createdAt)}</span>
                  </div>
                )}

                <div
                  className={`msg ${selectedMsg === m.id ? "msg-selected" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!mine) return;
                    setSelectedMsg((prev) => (prev === m.id ? null : m.id));
                  }}
                >
                  {m.image && (
                    <img src={m.image} className={`msg-img ${m.text ? "" : "msg-img--large"}`} alt="message attachment" />
                  )}
                  {m.text && <p>{m.text}</p>}

                  {mine && selectedMsg === m.id && (
                    <div className="msg-actions">
                      <button className="msg-delete-popup" type="button" onClick={(e) => { e.stopPropagation(); deleteMessage(m.id); }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {mine && (
                  <div className="msg-info">
                    <img src={userData.avatar || defaultProfile} alt="me" />
                    <span className="msg-time">{formatTime(m.createdAt)}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-msg">No messages yet — say hello 👋</div>
        )}
      </div>

      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="image-preview">
          <div className="preview-thumb">
            <img src={imagePreview.url} alt="preview" className="preview-img" />
            <button type="button" className="preview-remove" onClick={removePreview}>×</button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <form className="chat-input" onSubmit={handleSend}>
        <input type="text" placeholder="Send Message" value={input} onChange={(e) => setInput(e.target.value)} />

        <input type="file" id="image" accept="image/png, image/jpeg" ref={fileRef} hidden onChange={handleImage} />
        <label htmlFor="image" className="gallery-label"><img src={gallary} alt="upload" /></label>

        <button type="submit" className="send-button"><img src={sendIcon} alt="send" /></button>
      </form>

      {/* REPORT MODAL */}
      {reportOpen && (
        <div className="report-modal-backdrop" onClick={() => !reporting && setReportOpen(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Report Conversation</h3>
            <p>Reporting will hide this conversation for you and submit it for admin review. Optionally provide a reason.</p>

            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Optional: reason..." rows={4} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="report-cancel" onClick={() => setReportOpen(false)} disabled={reporting}>Cancel</button>
              <button type="button" className="report-submit" onClick={() => reportConversationForMe(reportReason)} disabled={reporting}>{reporting ? "Reporting..." : "Report & Hide"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
