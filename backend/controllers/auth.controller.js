import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendAdminLoginOtpEmail,
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password, role } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		if(user?.isAdmin === 'admin' && role !== 'admin') {
			return res.status(403).json({ success: false, message: "Admins are required to check the box!" });
		}

		if(user?.isAdmin !== 'admin' && role === 'admin') {
			return res.status(403).json({ success: false, message: "You are not authorized to access this admin resource." });
		}
		
		if (user?.isAdmin === 'admin' && user?.isAdmin) {
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			user.verificationToken = otp;
			user.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
			await user.save();

			await sendAdminLoginOtpEmail(user?.email, otp);
			
			return res.status(200).json({
				success: true,
				message: "OTP sent to your email.",
				user: user
			});
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		const userResponse = { ...user._doc };
        delete userResponse.password;

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: userResponse,
		});
	} catch (error) {
		console.log("Error in login controller: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const verifyAdminOtp = async (req, res) => {
	const { email, code } = req.body;
	try {
		const user = await User.findOne({
			email: email,
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user || !user.isAdmin) {
			return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
		}

		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		user.lastLogin = new Date();
		await user.save();

		generateTokenAndSetCookie(res, user._id);

        const userResponse = { ...user._doc };
        delete userResponse.password;

		res.status(200).json({
			success: true,
			message: "Admin verified successfully",
			user: userResponse,
		});
	} catch (error) {
		console.log("Error in verifyAdminOtp controller: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { username, course, semester } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. User ID is missing." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        user.name = username ?? user.name;
        user.course = course ?? user.course;
        user.semester = semester ?? user.semester;

        await user.save({ validateModifiedOnly: true });

        const savedUser = await User.findById(userId).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: savedUser,
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        
        console.log("Error in updateProfile controller: ", error);
        return res.status(500).json({ success: false, message: "Server error while updating profile." });
    }
};
