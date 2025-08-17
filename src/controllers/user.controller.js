import { asyncHandler } from '../middlewares/async.middleware.js';

import { ApiError } from "../utils/ApiError.js"

import { User } from '../models/User.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


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

export { registerUser };