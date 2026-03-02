import asyncHanler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

const registerUser = asyncHanler(async (req,res)=>{
    const {fullName,email,username,password}=req.body
    console.log("email: ",email)

    if(
        [fullName,email,username,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const excidetUser = await User.findOne({
        $or:[{email},{username}]
    })

    if(excidetUser){
        throw new ApiError(409,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    // avatar is mandatory, cover is optional
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar")
    }

    // only upload cover if a file was provided
    let coverImage = null
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if (!coverImage) {
            // we don't block registration, just log and continue
            console.warn('cover image upload failed for', email || username)
        }
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        email,
        username:username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while creating user")
    }

    return res.status(201).json(new ApiResponse(200,createdUser,"User created successfully"))   

})

export default registerUser;