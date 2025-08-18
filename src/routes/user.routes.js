import { Router } from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/user.controller.js';

import { upload } from '../middlewares/upload.js';
import { verifyJWT } from '../middlewares/verifyJWT.js';


import { getUserProfile, getWatchHistory } from '../controllers/user.controller.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "CoverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/getUserProfile").get(verifyJWT, getUserProfile);

router.route("/getWatchHistory").get(verifyJWT, getWatchHistory);

router.route("/getUserProfile").get(verifyJWT, getUserProfile);

router.route("/c/:username").get(verifyJWT, getUserProfile);

export default router;