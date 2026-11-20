import React, { useContext } from 'react'
import './Chat.css';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import Chatbox from '../../components/Chatbox/Chatbox';
import { AppContext } from '../../context/AppContext';
function Chat() {
  const {chatData,userData,isMobile,activeView} = useContext(AppContext);
  const loading = !chatData || !userData;
  return (
    <div className='chat'>
      {
        loading
        ?<div className='loading-wrap' role='status'><p className='loading-text'>Loading your conversations...</p></div>
        :<div className={`chat-container${isMobile ? ` mobile-view-${activeView}` : ''}`}>
        <LeftSidebar/>
        <Chatbox/>
         <RightSidebar/>
     </div>
      }
    </div>
  )
}

export default Chat
