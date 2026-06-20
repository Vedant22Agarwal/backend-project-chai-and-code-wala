import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url --> means third party app se url lenge
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password:{// 
        type:String,
        required:[true,"Password is required"],
        
    },
    refreshToken:{
        type : String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function(){ // why not arrow function because this feature is not in arrow and generally these are time consuming so asyn fn is used
// next is used becuase pre is middleware so give it to next 

// now we have created a problem ,suppose user apdates it name so password will also update it self so to prevent this we use modified function
    if(!this.isModified("password")) return ;

    this.password = await bcrypt.hash(this.password, 10)
    // next(); // don't use next when async middleware is used
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id:this._id,
            email : this.email,
            username: this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema);