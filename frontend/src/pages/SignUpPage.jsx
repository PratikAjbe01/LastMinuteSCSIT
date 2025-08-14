import { motion } from "framer-motion";
import Input from "../components/Input";
import { Eye, Loader, Lock, Mail, ShieldHalf, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";
import { Helmet } from "react-helmet-async";

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [lockPass, setLockPass] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { signup, error, isLoading } = useAuthStore();

	const handleSignUp = async (e) => {
		e.preventDefault();

		try {
			await signup(email, password, name);
			navigate("/verify-email");
		} catch (error) {
			console.log(error);
		}
	};
	const flag = true;
	return (
		<div
			className={`min-h-full flex items-center justify-center relative overflow-hidden py-10 ${flag ? "bg-gradient-to-br from-gray-900 via-blue-900 to-black-900"
				: "bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900"
				}`}
		>
			<Helmet>
				<title>Sign Up - LastMinute SCSIT</title>
				<meta name="description" content="Create your account to access the School of Computer Science and Information Technology, Indore." />
			</Helmet>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
			overflow-hidden mt-16'
			>
				<div className='p-8'>
					<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
						Create Account
					</h2>

					<form onSubmit={handleSignUp}>
						<Input
							icon={User}
							type='text'
							placeholder='Full Name'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<Input
							icon={Mail}
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<div className='relative mb-6'>
							<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'><Lock className='size-5 text-green-500' /></div>
							<input type={lockPass ? 'password' : 'text'} placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full pl-10 pr-10 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200' />
							<div className='absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer'>
								{lockPass ? <Eye className='size-5 text-green-500' onClick={() => setLockPass(false)} /> : <ShieldHalf className='size-5 text-green-500' onClick={() => setLockPass(true)} />}
							</div>
						</div>
						{error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
						<PasswordStrengthMeter password={password} />

						<motion.button
							className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? <Loader className=' animate-spin mx-auto' size={24} /> : "Sign Up"}
						</motion.button>
					</form>
				</div>
				<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
					<p className='text-sm text-gray-400'>
						Already have an account?{" "}
						<Link to={"/login"} className='text-green-400 hover:underline'>
							Login
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default SignUpPage;