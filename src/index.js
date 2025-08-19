// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import express from 'express'
// import dotenv from 'dotenv'
// dotenv.config({
//   path:  "./env"
// })
// const app = express();
// console.log("envs", process.env.MONGOBD_URL);

// ;( async ()=>{ 

//   try{
//     await mongoose.connect(`${process.env.MONGOBD_URL}/${DB_NAME}`)
//     app.on("error" , (error)=>{
//       console.log("bd name :::::::" , DB_NAME)
//       console.log("Error", error);
//       throw error
//     })
//     app.listen(process.env.PORT , ()=>{
//       console.log(`App is listen on ${process.env.PORT} `);
//     })
//   }
//   catch(error){
//     console.error("Error  :::::::::", error);
//   }

// })()

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from 'express'
import dotenv from 'dotenv'
dotenv.config({
  path:  "./env"
})
import DBCONNECT from "./db/index.js"
DBCONNECT();
console.log("index page");
console.log(`on index page :::  ${process.env.MONGODB_URL}/${DB_NAME}`)
