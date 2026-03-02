import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

// make sure necessary environment variables are available
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your .env file');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uplodaded successfully
        // console.log("file has been uploaded",response.url)
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file
        return response

    } catch(error){
        // log detailed error for debugging
        console.error('Cloudinary upload error:', error.message || error);
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath); // remove the locally saved temporary file
            }
        } catch (unlinkErr) {
            console.warn('Failed to delete temp file:', unlinkErr.message);
        }
        return null
    }
}

export default uploadOnCloudinary;