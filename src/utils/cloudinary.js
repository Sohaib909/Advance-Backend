import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET  
});
const uploadOnCloudnary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // console.log("file is uploaded on cloudinary",response.url)
        // return response;
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch(err){
    fs.unlinkSync(localFilePath)
    return null;
    }
}

export{uploadOnCloudnary}