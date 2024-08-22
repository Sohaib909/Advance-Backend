// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDb from "./db/index.js";

dotenv.config({
    path:'./env'
})
connectDb()

.then(()=>{
    app.listen(process.env.PORT||8000, () =>{
        console.log(`sERVER running at port: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDb connection failed!!",err);
})