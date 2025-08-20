import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config({
  path:  "../env"
})
const DBCONNECT = async function () {
  // console.log(`${process.env.MONGODB_URL}/${DB_NAME}`)
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

    app.on("error", (error) => {
      console.log("DB name :::::::", DB_NAME);
      console.log("Error", error);
      throw error;
    });
  } catch (error) {
    console.error("❌ Error :::::::::", error);
    process.exit(1);
  }
};
export default DBCONNECT;