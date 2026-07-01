import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


const registerUser = asyncHandler(async(req, res)=>{
    // res.status(200).json({
    //     message: "OK"
    // })


    // if(fullName===""){
    //     throw new ApiError(400,"Name is required")
    // }

    if([fullName, email, username, password]
        .some((field)=>field?.trim()==="")
    ){
         throw new ApiError(400,"All is required")
    }
    const existedUser= User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"user with email or username already existed")
        
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;

     const coverImageLocalPath=req.files?.coverImage[0]?.path;

     if(!avatarLocalPath){
        throw new ApiError (400,"Required");
     }
     const avatar= await uploadOnCloudinary(avatarLocalPath)

     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if(!avatar){
       throw new ApiError (400,"Required");
     }

     const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
     })

     const createdUser= await User.findById(user._id).select(
        "-password  -refreshToken"
     )

     if(!createdUser){
        throw new ApiError(500,"Something went wrong")
     }
     return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
     )




})
export {
    registerUser,
}