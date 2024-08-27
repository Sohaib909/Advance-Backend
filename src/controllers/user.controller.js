import{asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudnary} from "../utils/cloudinary.js"
import {ApiResponce} from "../utils/ApiResponse.js"

const generateAccessAndRefereshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while genereting refeesh and access token")
    }
}

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

const loginUser = asyncHandler(async(req,res)=>{
    const {email,username,password} = req.body
    if(!email || !username ) {
      throw new ApiError(400,"email or username is required")
    }
    const user = await findOne.User({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError("404","User does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError("401","Password Incorrect")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id)
})
   const loggedInUser = await User.findById(user._id).
   select("-password -refreshToken")
   const options ={
    httpOnly :true,
    secure: true
   }
  
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,
        {
         user:loggedInUser,accessToken,
         refreshToken
        },
       "user loggedIn Successfully"
    )
)

  const logoutUser = asyncHandler(
    async(req,res)=>{
   await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }

    )
    const options ={
        httpOnly :true,
        secure: true
       }
       return res
       .status
       .clearCookie("accessToken",options)
       .clearCookie("refreshToken",options)
       .json(new ApiResponce(200,{},"User loggedOut "))
    }
)
export{
    registerUser,
    loginUser,
    logoutUser
}   