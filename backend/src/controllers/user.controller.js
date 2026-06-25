import {asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import {v2 as cloudinary} from "cloudinary"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const userinfo = await User.findById(userId);
        // console.log(userinfo);
        const accessToken = userinfo.generateAccessToken();
        const refreshToken = userinfo.generateRefreshToken();
        userinfo.refreshToken = refreshToken;
        await userinfo.save({validateBeforeSave:false}); // then ensure that not go throw DB again just add the data that has been given 
        return{accessToken,refreshToken}; 
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}
// User Register
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
    // console.log(req.files);
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if((req.files) && (Array.isArray(req.files.coverImage) )&& (req.files.coverImage.length > 0)){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    // console.log(res.files);
    const avatar =  await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is required");
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


// Logged in user
const loginUser = asyncHandler(async (req,res) => {
    // take username and pass as details 
    // check validation 
    // check user exists or not 
    // if not ,throw error 
    // passwod check bhi krna h 
    // generate access token and referesh token 
    // DB mein refresh token ko update krna user ka 
    // send back the credials required 

    const {email,username,password} = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const userinfo = await User.findOne({ // by this we are checking either from username or email 
        $or:[{username},{email}]
    });

    if(!userinfo){
        throw new ApiError(404,"User does not exists");
    }
    
    const comparision = await userinfo.isPasswordCorrect(password);
    if(!comparision){
        throw new ApiError(401,"Password Incorrect");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(userinfo._id);

    // it is made so that user can't modify the cookie only user can
    const options = {
        httpOnly : true,
        secure:true
    }

    const loggedInUser = await User.findById(userinfo._id).select("-password -refreshToken");

    return res.status(200)   
    .cookie("accessToken",accessToken,options) // cookies setup 
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user : loggedInUser,
                accessToken, // these are used to 
                refreshToken
            },
            "User Logged in Successfully"
        )
    )


});


// Logout User 
const logoutUser = asyncHandler(async(req,res) => {
    // remove cookies of the user 
    // remove refreshToken from DB
    console.log(req.user);
    
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset:{ // unset kr doo yee yee cheeze 
                refreshToken : 1
            }
        },
        {
            new : true // jo updated value h user ki wo bhej do 
        }
    )  

    const options = {
        httpOnly : true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"));
});

// RefreshToken
const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request");
    }

    try {
        const decodedIncomingRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedIncomingRefreshToken?._id);
        if(!user){
            throw new ApiError(401,"Unauthorized Request");
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh token is expired ");
        }
        
        const {accessToken,refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
         const options = {
            httpOnly : true,
            secure:true
        }
    
        // const loggedInUser = await User.findById(userinfo._id).select("-password -refreshToken");
        return res.status(200)   
        .cookie("accessToken",accessToken,options) // cookies setup 
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    // user : loggedInUser,
                    accessToken, // these are used to 
                    refreshToken : newRefreshToken,
                },
                "Access Token refreshed Successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token");
    }

});

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldpassword,newpassword} = req.body;
    if(
        [oldpassword,newpassword].some((field) => !field || field.trim() === "")
    ){
        throw new ApiError(400,"Empty Feild");
    }
    const userinfo = await User.findById(req.user?._id);   // as we are now passing through protected route only 
    const compare =await userinfo.isPasswordCorrect(oldpassword);
    if(!compare){
        throw new ApiError(400,"Incorrect old Password");
    }
    userinfo.password = newpassword // ab apne app bcrypt wala function chal jaayega 
    await userinfo.save({
        validateBeforeSave:false
    });
    return res.status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"));



});

const getCurrentUser = asyncHandler(async(req,res) => {
    res.status(200)
    .json(new ApiResponse(200,req.user,"Current User Fetched Succesfully"));
});

const updateAccountDetails = asyncHandler(async(req, res) => {
   
    const {fullName, email} = req.body
    
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarloclapath = req.file?.path;
    if(!avatarloclapath){
        throw new ApiError(400,"Avatar File is Missing");
    }
    const avatar = await uploadOnCloudinary(avatarloclapath);
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on Avatar");
    }   
    // delete from cloudinary 
    const userinfo = await User.findById(req.user?._id);
    const url = userinfo.avatar;
    const publicId = url
    .split("/")
    .pop()
    .split(".")[0];
    await cloudinary.uploader.destroy(publicId);


    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar : avatar.secure_url
            }
        },{
            new : true
        }
    ).select("-password ");
    return res.status(200).
    json(new ApiResponse(200,user,"Avatar updated successfully"));
});


const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image is Missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on Cover Image");
    }
    // delete from cloudinary 
    const userinfo = await User.findById(req.user?._id);
    const url = userinfo.avatar;
    const publicId = url
    .split("/")
    .pop()
    .split(".")[0];
    
    await cloudinary.uploader.destroy(publicId);
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },{
            new : true
        }
    ).select("-password ");
    return res.status(200).
    json(new ApiResponse(200,user,"Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async(req,res) => { // yaha do user h ek toh khud tum and ek dusra jiska channel serach kia h 
    const {username} = req.params 
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing");
    }
    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase(),

            }
        },// first pipeline
        {
            $lookup : { // left join jese sql 
                from : "subscriptions",
                localField : "_id",// current jis model mein h 
                foreignField : "channel",//from wale mein jaake 
                as : "subscriber"
            }
        }, // second stage
        {
            $lookup:{
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields:{ // ye apne second user model mein fields add ho gai 
                subscriberCount : {
                    $size : "$subscriber"
                },
                channelsSubscribedToCount :{
                    $size : "$subscribedTo"  
                },
                isSubcribed : {
                    $cond : {
                        if : {
                            $in : [req.user?._id , "$subscriber.subscriber"]
                        },
                        then : true,
                        else : false

                    }
                }
            }
        },{
            $project:{ // what i have give to the frontedn to show 
                fullName : 1,
                username : 1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                isSubcribed:1,
                avatar : 1,
                coverImage : 1,
                email:1,



            }
        }
    ]);
    console.log(channel);

    if(!channel?.length){
        throw new ApiError(404,"Channel Does Not Exists");
    }
    return res.status(200)
    .json(new ApiResponse(200,channel[0],"User channel Fetched Successfully !!"))
    
});

const getWatchHistory = asyncHandler(async (req,res) => {
    const user = await User.aggregate([ // here mongoose can't act so directly string should not be given 
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField:"_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,

                                    }
                                }
                            ]
                        }
                    },
                    { // it is generally done to make easy for frontend developer other it will be an array which have location stored at index 0 
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch History Fetched Successfully"))
});
export {registerUser,loginUser,logoutUser , 
    refreshAccessToken,changeCurrentPassword,getCurrentUser,
    updateAccountDetails
    ,updateUserAvatar,updateUserCoverImage,
    getUserChannelProfile,getWatchHistory
};