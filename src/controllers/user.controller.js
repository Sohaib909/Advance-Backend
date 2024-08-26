import{asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudnary} from "../utils/cloudinary.js"
import {ApiResponce} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
         const {fullName,email,username,password} = req.body
         console.log("email",email);

         if ( 
            [fullName,email,username,password].some((field)=>
        
            field?.trim()==="")
    ){
            throw new ApiError(400,"All fields are  required")
         }

        const existedUer = await  User.findOne({
            $or:[{username},{email}]
        })

        if(existedUer){
            throw new ApiError(409,"user with email or username already exists")
        }
         const avatarLocalPath = req.files?.avatar[0]?.path;
        //  const coverImageLocalPath = req.files?.coverImage[0]?.path;
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght>0){
            coverImageLocalPath = req.files.coverImage[0].path
        }
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar is required")
        }
        
      const avatar = await uploadOnCloudnary(avatarLocalPath);
      const coverImage = await uploadOnCloudnary(coverImageLocalPath);
      if(!avatar){
        throw new ApiError(400,"Avatar is required");
      }
      const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase( )
      })
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      ) 
      if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
      } 
      return res.status(201).json(
        new ApiResponce(200,createdUser,"user registered successfuly")     
      )  
})

export{
    registerUser,
}   