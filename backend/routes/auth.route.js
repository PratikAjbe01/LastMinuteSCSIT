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
    addOpenedFile,
    autoRelogin,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/verify-admin-otp", verifyAdminOtp);
router.post("/sendverifyemail", sendVerifyEmail);
router.get("/fetchuser/:userId", fetchUser);

router.get("/check-auth", verifyToken, checkAuth);
router.post("/logout", verifyToken, logout);
router.post("/update-profile", verifyToken, updateProfile);
router.put("/add-opened-file", addOpenedFile);
router.get("/fetchallusers", fetchAllUser);
router.post("/delete-user", deleteUser);
router.post("/update-user", updateUser);

router.post("/auto-relogin", autoRelogin);

export default router;