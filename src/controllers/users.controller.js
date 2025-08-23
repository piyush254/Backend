import { asyncHandler } from "../utils/asyncHandlerHelper.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, resp) => {
  // getting user details from users
  // Validation - nor empty
  // Check if user already exists : Via username and email
  // check for images and check for avtar
  // Upload them to cloudinary , check for avtar
  // create User object - Create entry in db
  // remove passwword and refresh token from response
  // return response

  const { fullName, email, userName, password } = req.body;
  console.log("Email ::", email);

  // if(!fullName){
  //   throw new ApiError(400 , "fullName is required");
  // }

  if ([fullName, email, userName, password].some(() => field?.trim == "")) {
    throw new ApiError(
      400,
      "All Fields are required check fieldsFullName , Email , userName , password"
    );
  }

  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User already exist with this userName or email try another useName or email"
    );
  }

  const AvtarLocalPath = req.files?.avtar[0]?.path;
  const CoverImageLocalPath = req.files?.CoverImage[0]?.path;

  if (!AvtarLocalPath) throw new ApiError(400, "Avtar file  is required");
  const avtarPath = await uploadCloudinary(AvtarLocalPath);
  const coverImagePath = await uploadCloudinary(CoverImageLocalPath);
  if (!avtarPath) throw new ApiError(400, "Avtar file  is required");

  const user = User.create({
    fullName,
    avtar: avtarPath.url,
    CoverImage: coverImagePath?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "Something went wrong");

  return resp
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registed Successfully"));
});

export { registerUser };
