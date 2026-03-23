import React, { useContext, useEffect, useState } from 'react'
import "./ProfileUpdate.css"
import assets from '../../assets/assets'
import { uploadImage } from '../../config/cloudinary'
import { AppContext } from '../../context/AppContext'
import { auth, db } from '../../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const ProfileUpdate = () => {
  const {setUserData} = useContext(AppContext)
  const [image,setImage] = useState(null)
  const [name,setName] = useState("")
  const [bio,setBio] = useState("")
  const [uid,setUid] = useState("")
  const [prevImage,setPrevImage] = useState(null)
  const navigate = useNavigate()

  const profileUpdate = async (e) => {
   e.preventDefault();
   
   try {
    if (!prevImage && image) {
      toast.error("Please Upload Profile Picture")
    }
    const docRef = doc(db,"users",uid);

    if (image) {
      const imgUrl = await uploadImage(image)
      setPrevImage(imgUrl);
      await updateDoc(docRef,{
        avatar:imgUrl || prevImage || "",
        bio:bio || "",
        name:name || ""
      });
      toast.success("Profile Image Updated");
    }
    else {
      
      await updateDoc(docRef,{
        bio:bio || "",
        name:name || ""
      })
      toast.success("Profile Updated")
    }
    const snap = await getDoc(docRef)
    setUserData(snap.data())
    navigate('/chat')
   } catch (error) {
    console.error(error)
    toast.error("Profile Upload Failed")
   }
  };

  useEffect(()=>{
    onAuthStateChanged(auth, async (user) => {
     if (user) {
      setUid(user.uid);
      const docRef = doc(db,"users",user.uid)
      const docSnap = await getDoc(docRef);
      if (docSnap.data().name) {
        setName(docSnap.data().name);
      }
      if (docSnap.data().bio) {
        setBio(docSnap.data().bio);
      }
      if (docSnap.data().avatar) {
        setPrevImage(docSnap.data().avatar);
      }
     }
     else{
      navigate('/')
     }
    
    })
  },[])

  return (
    <div className='profile'>
      <div className="profile-container">
     <form onSubmit={profileUpdate}>
      <h3>Profile Details</h3>
      <label htmlFor="avatar">
        <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="avatar" accept='.jpg,.png,.jpeg' hidden/>
        <img src={image? URL.createObjectURL(image) : prevImage} alt="" />
        Upload Profile Image
      </label>
      <input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder='Enter Your Name'  required/>
      <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Enter Profile Bio' required></textarea>
      <button type="submit">Save</button>
     </form>
     <img className='profile-pic' src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate
