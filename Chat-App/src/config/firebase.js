import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore"
import { toast } from "react-toastify"

const firebaseConfig = {
  apiKey: "AIzaSyDcRMJxrlGPQDRVshn_Q6PPM_SuvEBmla0",
  authDomain: "chat-app-p-ad5f4.firebaseapp.com",
  projectId: "chat-app-p-ad5f4",
  storageBucket: "chat-app-p-ad5f4.firebasestorage.app",
  messagingSenderId: "472846820422",
  appId: "1:472846820422:web:9468647d7794128b9c1647"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username,email,password) => {
   try {
    const res = await createUserWithEmailAndPassword(auth,email,password)
    const user = res.user
    await setDoc(doc(db,"users",user.uid), {
      id:user.uid,
      username:username.toLowerCase(),
      email,
      name:"",
      avatar:"",
      bio:"Hey,there i am using chat app",
      lastSeen:Date.now()
      
    });
    await setDoc(doc(db,"chats",user.uid),{
      chatsData:[]
    });
   } catch (error) {
    console.error(error)
    toast.error(error.code.split('/')[1].split('-').join(" "));
   }
}

const login = async (email,password) => {
  try {
    await signInWithEmailAndPassword(auth,email,password);
  } catch (error) {
    console.error(error)
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}
 
const logout = async () => {
  try {
  await signOut(auth)
  } catch (error) {
    console.error(error)
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const resetPassword = async (email) => {
  if (!email) {
    toast.error("Enter Your Email")
    return null
  }
  try {
    const userRef = collection(db,"users");
    const q = query(userRef,where("email","==",email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth,email);
      toast.success("Reset email sent")
    }
    else{
      toast.error("Email doesn't exists")
    }
  } catch (error) {
    console.error(error)
    toast.error(error.message)
  }
}


export {signup,login,logout,auth,db,resetPassword}