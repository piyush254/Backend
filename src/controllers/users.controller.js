import { asyncHandler } from "../utils/asyncHandlerHelper.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const gernateAccessAndRefreshToken = async (userID) => {
  console.log("userID  :::", userID);
  try {
    const user = await User.findOne(userID);
    const accessToken = user.gernateAccessToken();
    const refreshToken = user.gernateRefreshToken();
    console.log("🔑 Tokens Generated:", {
      accessToken,
      refreshToken,
    });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    return new ApiError(
      500,
      "Something went wrong while gernating access and refresh token"
    );
  }
};
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
  // console.log("Email ::", email);

  // if(!fullName){
  //   throw new ApiError(400 , "fullName is required");
  // }

  if (
    [fullName, email, userName, password].some((field) => field?.trim == "")
  ) {
    throw new ApiError(
      400,
      "All Fields are required check fieldsFullName , Email , userName , password"
    );
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User already exist with this userName or email try another useName or email"
    );
  }

  const AvatarLocalPath = req.files?.avatar[0]?.path;
  const CoverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!AvatarLocalPath) throw new ApiError(400, "Avtar file  is required");
  const avtarPath = await uploadCloudinary(AvatarLocalPath);
  const coverImagePath = await uploadCloudinary(CoverImageLocalPath);

  console.log("avatar path", avtarPath.url);

  if (!avtarPath) throw new ApiError(400, "Avtar file  is required");

  const user = await User.create({
    fullName,
    avatar: avtarPath.url,
    coverImage: coverImagePath?.url || "",
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

const loginUser = asyncHandler(async (req, resp) => {
  const { email, userName, password } = req.body;
  if (!(userName || email)) {
    return new ApiError(400, "Email or username is required");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    return new ApiError(404, "Profile doesnot exists");
  }
  // console.log("user ::" , user);
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return new ApiError(404, "Password is incorrect");
  }
  const { accessToken, refreshToken } = await gernateAccessAndRefreshToken(
    user._id
  );

  const logginedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  // console.log("logginedUser   ::::" , logginedUser);
  return resp
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logginedUser,
          accessToken,
          refreshToken,
        },
        "User loggined Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, resp) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return resp
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logout Successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookie.refreshToken || req.body.refreshToken;
  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorised Access");
  }
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (incommingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used");
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken } = await gernateAccessAndRefreshToken(
      user._id
    );
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
