// src/pages/ProfileUpdate/ProfileUpdate.jsx
import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import profile from '../../assets/Profile.png'

import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { AppContext } from '../../context/AppContext'

function ProfileUpdate() {
  const navigate = useNavigate()
  const { setUserData } = useContext(AppContext)

  const [uid, setUid] = useState('')
  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')      // preview (data URL or blob URL) if user picks one
  const [prevImage, setPrevImage] = useState(profile) // preset default

  // Load user data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/')
        return
      }

      setUid(user.uid)

      try {
        const docRef = doc(db, "users", user.uid)
        const snap = await getDoc(docRef)

        if (snap.exists()) {
          const data = snap.data()
          setName(data.name || '')
          setEmail(data.email || user.email || '')
          setAbout(data.bio || '')
          setPhone(data.phone || '')
          // if no avatar in firestore, use preset 'profile' asset
          setPrevImage(data.avatar || profile)
          setAvatar(data.avatar || '')
        } else {
          // First-time user → only email exists, keep preset avatar
          setEmail(user.email || '')
          setPrevImage(profile)
          setAvatar('')
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load profile")
      }
    })

    return () => unsub()
  }, [navigate])

  // Convert uploaded image → data URL for preview (optional)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result) // base64 data URL for preview (and saved to firestore below)
    reader.readAsDataURL(file)
  }

  // Save profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    // VALIDATION: keep text fields required
    if (!name.trim()) return toast.error("Name cannot be empty")
    if (!about.trim()) return toast.error("About cannot be empty")
    if (!email.trim()) return toast.error("Email cannot be empty")
    if (!phone.trim()) return toast.error("Phone cannot be empty")
    // avatar is implicitly satisfied by preset `profile`, so no extra check needed here

    try {
      const docRef = doc(db, "users", uid)
      const snap = await getDoc(docRef)

      // Prevent updateDoc error for missing doc
      if (!snap.exists()) {
        toast.error("User profile missing in database!")
        return
      }

      // finalAvatar: user's selected avatar (dataURL) or previously stored avatar or packed preset
      const finalAvatar = avatar || prevImage || profile

      // 1) Update Firestore
      await updateDoc(docRef, {
        name,
        bio: about,
        email,
        phone,
        avatar: finalAvatar
      })

      // 2) Update Firebase Auth profile (only displayName)
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: name
          })
        } catch (authErr) {
          // Not fatal — just warn (we avoid setting photoURL to large/base64)
          console.warn("Failed to update auth profile displayName:", authErr)
        }
      }

      // 3) Update Context so UI updates everywhere instantly
      setUserData({
        id: uid,
        name,
        bio: about,
        email,
        phone,
        avatar: finalAvatar
      })

      // Ensure preview uses the saved avatar
      setPrevImage(finalAvatar)
      setAvatar('') // optional: clear temporary preview field now that prevImage holds final

      toast.success("Profile updated successfully!")

      // 4) Navigate back to chat
      setTimeout(() => navigate("/chat"), 700)

    } catch (error) {
      console.error(error)
      toast.error("Profile update failed")
    }
  }

  return (
    <div className="profile-page">
      <form className="profile-card" onSubmit={handleProfileUpdate}>
        
        {/* LEFT PANEL */}
        <div className="profile-left">
          <div className="profile-avatar-wrap">
            <img
              src={avatar || prevImage || profile}
              alt="Profile"
              className="profile-avatar"
            />

            <label htmlFor="profileImage" className="profile-avatar-edit">
              Change
            </label>

            <input
              type="file"
              id="profileImage"
              accept="image/png,image/jpeg"
              hidden
              onChange={handleImageChange}
            />
          </div>

          <h2 className="profile-name">{name || "Your Name"}</h2>
          <p className="profile-about-preview">{about || "No bio yet"}</p>
        </div>

        {/* RIGHT PANEL */}
        <div className="profile-right">
          <h3>Edit Profile</h3>

          <div className="profile-form">

            <label>
              Display Name  
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              About  
              <textarea
                rows="3"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </label>

            <label>
              Email  
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              Phone  
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <button type="submit" className="profile-save-btn">
              Save Changes
            </button>

          </div>
        </div>

      </form>
    </div>
  )
}

export default ProfileUpdate
