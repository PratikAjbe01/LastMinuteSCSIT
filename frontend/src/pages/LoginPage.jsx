"use client"

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, Eye, ShieldHalf, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [lockPass, setLockPass] = useState(true);

    const [loginStep, setLoginStep] = useState('credentials');
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);

    const { login, verifyAdminOtp, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        clearError();
    }, [loginStep, clearError]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const role = isAdmin ? 'admin' : 'user';
            const response = await login(email, password, role);

            if (isAdmin && response?.data?.user?.isAdmin === 'admin') {
                setLoginStep('otp');
            }
            if (response?.data?.user?.isAdmin !== 'admin') {
                toast.success("User Login successfully!");
            }
        } catch (err) {
            // Error is handled by the store and displayed via the `error` state
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newCode = [...code];
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            pastedCode.forEach((char, i) => {
                if (index + i < 6) newCode[index + i] = char;
            });
            const focusIndex = Math.min(index + pastedCode.length, 5);
            inputRefs.current[focusIndex]?.focus();
        } else {
            newCode[index] = value;
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
        setCode(newCode);
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        if (verificationCode.length !== 6) return;

        try {
            await verifyAdminOtp(email, verificationCode);
            toast.success("Admin Login successfully!");
        } catch (err) {
            // Error is handled by the store
        }
    };

    useEffect(() => {
        if (loginStep === 'otp' && code.every((digit) => digit !== "")) {
            handleOtpSubmit(new Event("submit"));
        }
    }, [code, loginStep]);

    const maskEmail = (email) => {
        const [user, domain] = email.split('@');
        if (!user || !domain) return email;
        if (user.length <= 3) return `${user.substring(0, 1)}***@${domain}`;
        return `${user.substring(0, 3)}***@${domain}`;
    };

    return (
        <div className="min-h-screen max-h-full flex items-center justify-center relative overflow-hidden py-10 bg-gradient-to-br from-gray-900 via-blue-900 to-black-900">
            <Helmet>
                <title>Login - LastMinute SCSIT</title>
                <meta name="description" content="Login to access your account at the School of Computer Science and Information Technology, Indore." />
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mt-16'
            >
                {loginStep === 'credentials' ? (
                    <>
                        <div className='p-8'>
                            <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
                                Welcome Back
                            </h2>
                            <form onSubmit={handleLogin}>
                                <Input icon={Mail} type='email' placeholder='Email Address' value={email} onChange={(e) => setEmail(e.target.value)} />
                                <div className='relative mb-6'>
                                    <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'><Lock className='size-5 text-green-500' /></div>
                                    <input type={lockPass ? 'password' : 'text'} placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full pl-10 pr-10 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200' />
                                    <div className='absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer'>
                                        {lockPass ? <Eye className='size-5 text-green-500' onClick={() => setLockPass(false)} /> : <ShieldHalf className='size-5 text-green-500' onClick={() => setLockPass(true)} />}
                                    </div>
                                </div>
                                <div className='flex items-center justify-between mb-6'>
                                    <label htmlFor='isAdmin' className='relative inline-flex items-center cursor-pointer group'>
                                        <input
                                            type='checkbox'
                                            id='isAdmin'
                                            checked={isAdmin}
                                            onChange={(e) => setIsAdmin(e.target.checked)}
                                            className='sr-only peer'
                                        />
                                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 peer-checked:bg-green-600 transition-colors duration-300"></div>
                                        <div className="absolute top-0.5 left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out peer-checked:translate-x-5"></div>
                                        <span className="ml-3 text-sm font-[550] text-gray-300 group-hover:text-white transition-colors">
                                            Login as Admin
                                        </span>
                                    </label>
                                    <Link to='/forgot-password' className='text-sm text-green-400 hover:underline'>Forgot password?</Link>
                                </div>
                                {error && <p className='text-red-400 text-sm text-center font-semibold mb-4'>{error}</p>}
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200' type='submit' disabled={isLoading}>
                                    {isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Login"}
                                </motion.button>
                            </form>
                        </div>
                        <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
                            <p className='text-sm text-gray-400'>Don't have an account? <Link to='/signup' className='text-green-400 hover:underline'>Sign up</Link></p>
                        </div>
                    </>
                ) : (
                    <div className='p-8'>
                        <button onClick={() => { setLoginStep('credentials'); clearError(); }} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft />
                        </button>
                        <h2 className='text-3xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
                            Admin Verification
                        </h2>
                        <p className='text-center text-gray-300 mb-6'>A 6-digit code has been sent to <br /> <span className="font-semibold text-white">{maskEmail(email)}</span></p>
                        <form onSubmit={handleOtpSubmit}>
                            <div className='flex justify-center gap-2 mb-6'>
                                {code.map((digit, index) => (
                                    <input key={index} ref={(el) => (inputRefs.current[index] = el)} type='text' inputMode="numeric" pattern="[0-9]*" maxLength='1' value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className='w-12 h-14 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none transition' />
                                ))}
                            </div>
                            {error && <p className='text-red-400 text-sm text-center font-semibold mb-4'>{error}</p>}
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50' type='submit' disabled={isLoading || code.join('').length < 6}>
                                {isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Verify"}
                            </motion.button>
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
export default LoginPage;
