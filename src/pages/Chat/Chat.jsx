import React, { useContext, useEffect } from 'react'
import './Chat.css';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import Chatbox from '../../components/Chatbox/Chatbox';
import { AppContext } from '../../context/AppContext';
import { useState } from 'react';
function Chat() {
  const {chatData,userData} = useContext(AppContext);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
     if(chatData && userData){
      setLoading(false) 
     }
  },[chatData,userData])
  return (
    <div className='chat'>
      {
        loading
        ?<p className='loading'>Loading....</p>
        :<div className='chat-container'>
        <LeftSidebar/>
        <Chatbox/>
         <RightSidebar/>
     </div>
      }
    </div>
  )
}

export default Chat
