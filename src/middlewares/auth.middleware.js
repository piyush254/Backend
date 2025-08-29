import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandlerHelper.js"
import { User } from "../models/user.models.js"

export const verifyJwt = asyncHandler((req ,_ ,next) => {
  console.log("req.cookies::",req.cookies)
try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token) throw new ApiError(401 ,"Unauthorised user");
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) 
    const user = User.findById(decodeToken?._id).select("-password -refreshToken");
    if(!user) throw new ApiError (401 , "Invalid User");
    req.user = user;
    next();
} catch (error) {
  throw new ApiError(401 , error?.message || "Unauthorised Access"); 
}
})
