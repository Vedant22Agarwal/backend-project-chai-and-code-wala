import {Router} from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
const router = Router();

router.route("/register").post( // added multer as middleware so files can be uploaded 
    upload.fields([
        {
            name : "avatar",
            maxCount:1
        },
        {
            name : "coverImage",
            maxCount:1
        }
    ]),
    registerUser);

// Making login user 

router.route("/login").post(
    // upload.none(), // means for form submission we have to use muter 
    loginUser
);

// Protected route
router.route("/logout").post(
    verifyJWT,logoutUser
);

router.route("/refresh-token").post(refreshAccessToken);


export default router;