// Very useful code can be reused again
import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localfilepath) => { // localfilepath -> means server pe file aa gai ..ab server to cloudinary karna h 
    try{
        if(!localfilepath) return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        });
        //file has been uploaded
        console.log("file is uploaded ",response.url);
        fs.unlinkSync(localfilepath);
        return response;
        
    }
    catch(error){
        // remove the locally saved temporarily file as upload operation got failed
         if(localfilepath && fs.existsSync(localfilepath)){
        fs.unlinkSync(localfilepath);
    }
    console.log(error);
    return null;
    }
};
export {uploadOnCloudinary}
