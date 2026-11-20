import React, { useContext } from 'react'
import './RightSidebar.css'
import Avatar from '../Avatar'
import { AppContext } from '../../context/AppContext'
import { logout } from '../../config/firebase'

function RightSidebar() {

  const { chatUser, messages } = useContext(AppContext);


  const mediaImages = Array.isArray(messages)
    ? messages.filter(m => m.image)
    : [];

  return (
    <div className="rs">
      <div className="rs-profile">
        <div className="profile-img">
          <Avatar src={chatUser?.avatar} alt="Profile" />
          <span className="dot"></span>
        </div>
        <h3>{chatUser?.name || chatUser?.username || "Unknown"}</h3>
        <p>{chatUser?.bio || "Hey, There I am Using Chat App"}</p>
      </div>

      <hr />

      <div className="rs-media">
        <p>Media</p>

        <div className="rs-media-grid">
          {mediaImages.length > 0 ? (
            mediaImages.map((m, i) => (
              <img key={i} src={m.image} alt="media" />
            ))
          ) : (
            <span className="no-media">No media yet</span>
          )}
        </div>
      </div>

      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

export default RightSidebar
