
export const uploadImage = async (file) => {
   const formData = new FormData()
   formData.append("file", file)
   formData.append("upload_preset", "chatapp_images");



try {
    const res = await fetch(
        "https://api.cloudinary.com/v1_1/duurkror0/image/upload",
        {
            method:"POST",
            body: formData,
        }

    );
    const data = await res.json();
    return data.secure_url;

} catch (error) {
    console.log("Image upload error:",error);
    
};

}