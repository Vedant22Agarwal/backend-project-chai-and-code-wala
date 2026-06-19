import {asyncHandler } from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req,res) => {
    res.status(200).json({
        message:"ok"
    })
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