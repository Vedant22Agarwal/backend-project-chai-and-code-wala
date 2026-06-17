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



export {app}