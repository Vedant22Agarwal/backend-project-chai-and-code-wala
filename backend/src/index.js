import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
});
import connectDB from "./DB/index.js";

connectDB()







// function connectDB(){
// }
// connectDB()
// Instead of doing this , we can usee iffs

/*
import express from "express";
const app = express();
// Using IIFE 
;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.error("ERROR :", error);
      throw error;
    });
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running at ${process.env.PORT}`);
    })
  } catch (error) {
    console.error("ERROR :", error);
    throw error;
  }
})();
*/

