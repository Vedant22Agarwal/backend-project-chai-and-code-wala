import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN, // which frontend url are allowed for accessing the server 
        credentials : true, // allow browser to send cookie and authentication 

    }
));

app.use(express.json({
    limit: "16kb"
})); //. allow all json file coming from frontend

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
 })); // This middleware is used to parse form data sent from the client
app.use(express.static("public"));
app.use(cookieParser()); // allow server to use the cookies of broswer

// route import 
import userRouter from "./routes/user.routes.js" // router default h naa toh kuch bhi naam de sakte h 

// routes declaration 
app.use("/api/v1/users",userRouter)
// https://localhost:3000/api/v1/users/register
// https://localhost:3000/users/login
export {app}