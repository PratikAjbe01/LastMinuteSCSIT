import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { API_URL } from "../utils/urls";

const VerifyUserEmail = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const [isSendLoading, setIsSendLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const { error, isLoading, verifyEmail, user } = useAuthStore();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (isInitialLoad) {
            sendVerificationEmail();
            setIsInitialLoad(false);
        }
    }, [isInitialLoad]);

    useEffect(() => {
        let timer;
        if (resendDisabled && resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        } else if (resendTimer === 0) {
            setResendDisabled(false);
            setResendTimer(30);
        }
        return () => clearTimeout(timer);
    }, [resendDisabled, resendTimer]);

    const sendVerificationEmail = async () => {
        if (isSendLoading) return;
        setIsSendLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/sendverifyemail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({ userId: user._id })
            });

            const result = await response.json();

            if(result?.message==="User is already verified"){
                toast.success("User is already verified");
                navigate("/");
                return;
            }

            if (result.success) {
                toast.success("Verification email sent successfully");
                setResendDisabled(true);
            } else {
                throw new Error(result.message || 'Failed to send verification email');
            }
        } catch (err) {
            console.log(err.message || "Failed to send verification email");
        } finally {
            setIsSendLoading(false);
        }
    };

    const handleChange = (index, value) => {
        const newCode = [...code];
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);
            const lastFilledIndex = newCode.findLastIndex(digit => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex]?.focus();
        } else {
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        if (verificationCode.length !== 6) return;
        
        try {
            await verifyEmail(verificationCode);
            toast.success("Email verified successfully");
            navigate("/");
        } catch (error) {
            toast.error(error.message || "Verification failed");
        }
    };

    useEffect(() => {
        if (code.every(digit => digit !== "") && code.join("").length === 6) {
            handleSubmit(new Event("submit"));
        }
    }, [code]);

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
            <Helmet>
                <title>Email Verification - LastMinute SCSIT</title>
                <meta name="description" content="Verify your email address to complete the registration process at LastMinute SCSIT." />
            </Helmet>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md mt-10"
            >
                <div className="bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <motion.div 
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="mx-auto bg-gradient-to-br from-blue-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </motion.div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                                Verify Your Email
                            </h2>
                            <p className="text-gray-400 mt-2">
                                Enter the 6-digit code sent to <span className="text-white font-medium">{user?.email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-between space-x-2">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-full h-14 text-center text-2xl font-bold bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-center py-2 px-4 bg-red-900/20 rounded-lg"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading || code.some(digit => !digit)}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </div>
                                ) : "Verify Email"}
                            </motion.button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Didn't receive the code?
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={sendVerificationEmail}
                                disabled={resendDisabled || isSendLoading}
                                className="mt-2 text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSendLoading ? "Sending..." : resendDisabled ? `Resend in ${resendTimer}s` : "Resend Code"}
                            </motion.button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            className="w-full mt-6 py-3 px-4 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-xl border border-gray-600 transition-all duration-300"
                        >
                            Skip for Now
                        </motion.button>
                    </div>
                </div>
                
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Need help? <a href="mailto:support@lastminutecsit.com" className="text-blue-400 hover:underline">Contact Support</a></p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyUserEmail;