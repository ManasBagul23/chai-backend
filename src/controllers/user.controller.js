import { asyncHandler } from '../middlewares/async.middleware.js';

import { ApiError } from "../utils/ApiError.js"

import { User } from '../models/User.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

import { jwt } from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    }catch (error){
        throw new ApiError(500, "Internal Server Error");
    }

    return {accessToken, refreshToken}
}


const registerUser = asyncHandler( async (req, res) => {
    res.status(201).json({
        message: "ok"
    });


    const {fullname, email, username, password } = req.body

    if(fullname === '' || email === '' || username === '' || password === '') {
        throw new ApiError(400, 'Please fill in all fields')
    }

    const existedUser = User.findOne({
        $or : [{ username }, { email }]
    })

    if(existedUser) {
        throw new ApiError(409, 'Username or Email already exists')
    }

    const avatarlocalPath = req.files?.avatar[0]?.path;
    const coverImagelocalPath = req.files?.coverImage[0]?.key;


    if(!avatarlocalPath)
    {
        throw new ApiError(400, 'Please upload an avatar')
    }

    const avatar = await uploadOnCloudinary(avatarlocalPath)
    const coverImage = await uploadOnCloudinary(coverImagelocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await username.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase() 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(404, 'User not found')
    }
})


const loginUser = asyncHandler(async (req,res) => {
    const {email , username, password} = req.body

    if(!username || !email || !password){
        throw new ApiError(400, "Username is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}, {password}]
    })

    if(!user){
        throw new ApiError(404, 'User not found')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, 'Invalid password')
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is missing")
    }

    const decodedToken = await jwt.verify (
        incomingRefreshToken, 
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = User.findById(decodedToken?._id)

    if(!user) {
        throw new ApiError(400, "User not found")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(400, "Refresh token is invalid")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, NewrefreshToken} = await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", NewrefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: NewrefreshToken},
            "Access token generated"
        )
    )

})

export { registerUser , loginUser , logoutUser};