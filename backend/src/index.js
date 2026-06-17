import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
});
import connectDB from "./DB/index.js";
import { app } from './app.js';

connectDB()
.then(() => {
  app.on("error",(error) => {
    console.error("ERROR :", error);
  })
  app.listen(process.env.PORT || 3000,()=>{
    console.log(`Server is running at ${process.env.PORT}`);
    
  })
})
.catch((error) => {
  console.log("MONGO_DB connection failed !!!!",error );
})










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

