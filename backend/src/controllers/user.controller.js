import {asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res) => {
    // get user detail from frontend 
    // validation - not empty
    // check if user is already is exist : username or email se 
    // check images ,check for avatar :compulsory
    // upload thrm to cloudinary ,avatar
    // create user object - create entry in DB 
    // remove and refreshToken field from response 
    // check for user creation 
    // return response else error

    const {username,email,fullName,password} = req.body // data is coming from form or json body 

    // console.log(req.body);
    // if(fullName === ""){
    //     throw new ApiError(400,"Full name is required");
    // }

    // validation - not empty
    if(
        [fullName,email,username,password].some((field) => !field || field.trim() === "")
    ){
        throw new ApiError(400,"Empty Feild");
    }

    // check if user is already is exist : username or email se 
    const existing_User = await User.findOne({
        $or:[{username},{email}]
    });
    if(existing_User){
        throw new ApiError(409,"User with email or username already exists.")
    }
    console.log(req.files);
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if((req.files) && (Array.isArray(req.files.coverImage) )&& (req.files.coverImage.length > 0)){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is applied");
    }

    // console.log(res.files);
    const avatar =  await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is applied");
    }
    
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )

});
// same code h niche dekh lena agr asyncHandler samjh naa aaye toh 
// const registerUser = async (req, res, next) => {
//     try {
//         res.status(200).json({
//             message: "ok"
//         });
//     } catch (error) {
//         next(error);
//     }
// };

export {registerUser};