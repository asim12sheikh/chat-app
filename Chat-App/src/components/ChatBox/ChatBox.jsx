import React, { useContext, useEffect, useState } from 'react'
import assets from '../../assets/assets'
import "./Chatbox.css"
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import { uploadImage } from '../../config/cloudinary'

const ChatBox = () => {

  const {userData, messagesId,chatUser, messages,setMessages,chatVisible,setChatVisible} = useContext(AppContext);
  const [input,setInput] = useState("")
  const [showModal,setShowModal] = useState(false);


  const sendMessage = async () => {


    try {   
      if (input && messagesId) {
        await updateDoc(doc(db,"messages",messagesId),{
          messages:arrayUnion({
            sId:userData.id,
            text:input,
            createdAt:new Date()
          })
        })
        const userIDs = [chatUser.rId,userData.id]

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db,"chats",id)
          const userChatsSnapshot = await getDoc(userChatsRef)
  
          if (userChatsSnapshot.exists()) {
            const userChatData  = userChatsSnapshot.data()
            const chatIndex = userChatData.chatsData.findIndex((c)=>c.messageId === messagesId);
            if (chatIndex === -1 ) return; 
              
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30)
            userChatData.chatsData[chatIndex].updatedAt = Date.now()
                
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false
            }

            await updateDoc(userChatsRef,{
              chatsData:userChatData.chatsData
            })
          }

        })
      }
    } catch (error) {
      toast.error(error.message)
      console.error(error)
    }
    setInput("")
  };

  const sendImage = async (e) => {
 try {
  const fileUrl = await uploadImage(e.target.files[0])
  if (fileUrl && messagesId) {
    await updateDoc(doc(db,"messages",messagesId),{
          messages:arrayUnion({
            sId:userData.id,
            image:fileUrl,
            createdAt:new Date()
          })
        });

        const userIDs = [chatUser.rId,userData.id]

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db,"chats",id)
          const userChatsSnapshot = await getDoc(userChatsRef);
  
          if (userChatsSnapshot.exists()) {
            const userChatData  = userChatsSnapshot.data()
            const chatIndex = userChatData.chatsData.findIndex((c)=>c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = "Image"
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
                
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef,{
              chatsData:userChatData.chatsData
            })
          }

        })
  }
 } catch (error) {
  toast.error(error.message)
 }
  };

  const handleClearChat = async () => {
    const confirmDelete = window.confirm("Are you sure you want to clear all chats?");
    if (!confirmDelete) return;
      
    try {
      await  updateDoc(doc(db,"messages",messagesId), {
        messages:[]
      });
      setShowModal(false)
    } catch (error) {
      console.log(error);
      
    }
    

  }

  const convertTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour>12) {
      return hour-12 + ":" + minute + "PM";
    }
    else {
       return hour + ":" + minute + "AM"
    }
  } 


  useEffect(()=>{
  if (messagesId) {
    const unSub = onSnapshot(doc(db,"messages",messagesId),(res)=>{
      setMessages(res.data().messages.reverse())
      
    })
    return () => {
      unSub();
    }
  }
  },[messagesId]);
 


  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-content">
        <img src={chatUser?.userData?.avatar || "/default-avatar.png"} alt="" />
        <p>{chatUser?.userData?.name} {Date.now()-chatUser?.userData?.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="" /> : null } </p>
       <img onClick={()=>setShowModal(true)} src={assets.help_icon} className='help' alt="" />
       <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} className='arrow' alt="" />
      </div>             


      <div className="chat-msg">
        {messages.map((msg,index)=>(
      <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
        {msg["image"]
        ? <img className='msg-img' src={msg.image || null} alt="" />
        : <p className='msg'>{msg.text}</p>
        }
          <div>
            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
            <p>{convertTimestamp(msg.createdAt)}</p>
          </div>
        </div>
       ))}            
      </div>


      <div className="chat-input">
        <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
        <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
          {showModal && (
      <div className="modal-overlay">
      <div className="modal">
      <h3>Chat Options</h3>
    
      <button onClick={handleClearChat} className='clear-btn'>Clear Chat</button>
      <button onClick={()=>setShowModal(false)}>Cancel</button>

      </div>
      </div>
    )}
    </div>

  )
  : <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
    <img src={assets.logo_icon} alt="" />
    <p>Chat anytime, anywhere</p>
  </div>
}

export default ChatBox
