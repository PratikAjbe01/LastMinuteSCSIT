import express from "express";
import {
	login,
	logout,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	verifyAdminOtp,
	updateProfile,
	fetchUser,
	fetchAllUser,
	updateUser,
	deleteUser,
	sendVerifyEmail,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", checkAuth);
router.get("/fetchuser/:userId", fetchUser);
router.get("/fetchallusers", fetchAllUser);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/verify-admin-otp", verifyAdminOtp);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/update-profile", updateProfile);
router.post("/delete-user", deleteUser);
router.post("/update-user", updateUser);
router.post("/sendverifyemail", sendVerifyEmail);

export default router;