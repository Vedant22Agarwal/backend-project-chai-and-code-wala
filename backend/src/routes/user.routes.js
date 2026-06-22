import {Router} from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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
    loginUser
);

// Protected route
router.route("/logout").post(
    verifyJWT,logoutUser
);

export default router;