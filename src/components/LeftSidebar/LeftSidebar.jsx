import React, { useContext, useEffect, useState } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { logout } from '../../config/firebase'
const LeftSidebar = () => {
    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser,setMessagesId,messagesId, chatvisible,setChatVisible} = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    
    // Extract already added user IDs from chatData
    const addedUserIds = chatData?.map(chat => chat.rId) || [];

    const inputHandler = async (e) => {
        try {
            const input = e.target.value.trim();
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);

                if (!querySnap.empty) {
                    const foundUser = querySnap.docs[0].data();

                    // Check if the found user is not the current user and not already in chats
                    if (foundUser.id !== userData.id && !addedUserIds.includes(foundUser.id)) {
                        let userExist =false
                        chatData.map((user)=>{
                       if(user.rId === foundUser.id){
                        userExist = true;
                       }
                        })
                        if(!userExist){
                        setUser(foundUser);
                        }
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
            }
        } catch (error) {
            console.error("Error searching user:", error);
        }
    };

    const addChat = async () => {
        if (!user) return;

        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");

        try {
            const newMessageRef = doc(messagesRef);

            await setDoc(newMessageRef, {
                createdAt: serverTimestamp(),
                messages: []
            });

            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });

            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: " ",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
            const uSnap = await getDoc(doc(db,"users",user.id));
           const uData = uSnap. data();
           setChat({
           messagesId:newMessageRef.id,
           lastMessage:"",
           rId:user.id,
           updatedAt: Date.now(),
           messageSeen : true,
           userData: uData
        })
          setShowSearch(false)
          setChatVisible(true)
        } catch (error) {
            toast.error(error.message);
            console.error("Error adding chat:", error);
        }
    };

    const setChat = async (item) =>{
        try {
            setMessagesId(item.messageId);
     setChatUser(item)
     const userChatsRef = doc(db,'chats',userData.id);
     const userChatsSnapshot = await getDoc(userChatsRef);
     const userChatsData = userChatsSnapshot.data();
     const chatIndex = userChatsData. chatsData. findIndex((c)=>c.messageId === item.messageId);
     userChatsData. chatsData[chatIndex].messageSeen = true;
     await updateDoc(userChatsRef,{
     chatsData: userChatsData.chatsData
    })
    setChatVisible(true);
        } catch (error) {
            toast.error(error.message)
        }
     }
useEffect(()=>{
 const updatedChatUserData =async ()=>{
   if(chatUser){
    const userRef = doc(db,"users",chatUser.userData.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
     setChatUser(prev=>({ ... prev, userData: userData})) 
   }

 }
 updatedChatUserData();
},[chatData])
    return (
        <div className={`ls ${chatvisible? "hidden" :""}`}>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className="logo" alt="" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p onClick={()=>logout()}>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder='Search here ..' />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user ? (
                    <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar || assets.profile_img} alt="" />
                        <p>{user.name || "Unknown User"}</p>
                    </div>
                ) : (
                    chatData && Array.isArray(chatData) && chatData.map((item, index) => (
                        <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "friends" :"border" }`}>
                            <img src={item.userData?.avatar } alt="" />
                            <div>
                                <p>{item.userData?.name }</p>
                                <span>{item?.lastMessage }</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
