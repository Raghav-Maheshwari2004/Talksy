import { initializeApp } from "firebase/app";
import {   createUserWithEmailAndPassword,   getAuth,   signInWithEmailAndPassword,   signOut,  sendPasswordResetEmail} from "firebase/auth";
import {   getFirestore,   setDoc,   doc,   collection,   query,  where,   getDocs,   Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";



const firebaseConfig = {
  apiKey: "AIzaSyD98hpe-wZJMsQtX5_yjJ199XCv7qBK_c4",
  authDomain: "talksy-e86d3.firebaseapp.com",
  projectId: "talksy-e86d3",
  storageBucket: "talksy-e86d3.firebasestorage.app",
  messagingSenderId: "293629619849",
  appId: "1:293629619849:web:c87b6c1852e462d7166058",
  measurementId: "G-5LCJZDFREE"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
try {
const res = await createUserWithEmailAndPassword(auth, email,password);
const user = res. user;
await setDoc(doc(db,"users",user.uid),{
id:user.uid,
username : username. toLowerCase (),
email,
name:"",
avatar:"",
bio:"Hey, There i am using Talksy",
lastSeen: Date. now()
})
await setDoc(doc(db,"chats",user.uid),{
chatsData:[]

})
} catch (error) {
  console.error(error)
  toast.error(error.code.split('/')[1].split('-').join(" "));
}
}
const login =async (email,password)=>{
  try{
      await signInWithEmailAndPassword (auth,email,password)
  }
  catch(error){
console.error(error);
toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}
const logout = async () => {
  try {
       await signOut(auth)
  } catch (error) {
  console.error(error);
  toast.error(error.code.split('/')[1].split('-').join(" "));
  
  }
}

const resetPass = async (email) => {
  if (!email) {
  toast.error("Enter your email");
  return null;
  }
  try {
  const userRef = collection(db,'users');
  const q = query(userRef,where("email"," == ",email));
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
  await sendPasswordResetEmail(auth,email);
  toast.success("Reset Email Sent")
  }
  else{
  toast.error("Email doesn't exists")
  }
}
  catch (error) {
  console.error(error);
  toast.error(error.message)
  }
}

export{signup,login,logout,auth,db,resetPass}