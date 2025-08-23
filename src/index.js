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

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import express from "express";

import DBCONNECT from "./db/index.js";
import { app } from "./app.js";
// const app = express();
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

DBCONNECT()
  .then(
    app.listen(process.env.PORT || 8000, () => {
      console.log(`✅ App is listening on port ${process.env.PORT}`);
    }),
    app.on("error", (error) => {
      console.error("❌ Server error:", error);
      throw error;
    })
  )
  .catch((error) => {
    console.error("MONGODB connection Error", error);
  });
