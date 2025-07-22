import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, Eye, ShieldHalf } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import { Helmet } from "react-helmet-async";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);
	const [lockPass, SetLockPass] = useState(true);

	const { login, isLoading, error } = useAuthStore();

	const handleLogin = async (e) => {
		e.preventDefault();
		await login(email, password, isAdmin ? 'admin' : 'user');


	};
	const flag = true;

	return (
		<div
			className={`min-h-screen max-h-full flex items-center justify-center relative overflow-hidden py-10 ${flag
				? "bg-gradient-to-br from-gray-900 via-blue-900 to-black-900"
				: "bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900"
				}`}
		>
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
				<div className='p-8'>
					<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
						Welcome Back
					</h2>

					<form onSubmit={handleLogin}>
						<Input
							icon={Mail}
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<div className='relative mb-6'>
							<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
								<Lock className='size-5 text-green-500' />
							</div>
							<input
								type={(lockPass) ? 'password' : 'text'}
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className='w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200'
							/>
							<div className='absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer'>
								{lockPass ? (
									<Eye className='size-5 text-green-500' onClick={() => SetLockPass(false)} />
								) : (
									<ShieldHalf className='size-5 text-green-500' onClick={() => SetLockPass(true)} />
								)}
							</div>
						</div>

						<div className='flex items-center mb-6'>
							<Link to='/forgot-password' className='text-sm text-green-400 hover:underline'>
								Forgot password?
							</Link>
						</div>
						{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
						<div className='flex items-center mb-4'>
							<input
								type='checkbox'
								id='isAdmin'
								checked={isAdmin}
								onChange={(e) => setIsAdmin(e.target.checked)}
								className='mr-2'
							/>
							<label htmlFor='isAdmin' className='text-sm text-gray-300'>
								Login as Admin
							</label>
						</div>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? <Loader className='w-6 h-6 animate-spin  mx-auto' /> : "Login"}
						</motion.button>
					</form>
				</div>
				<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
					<p className='text-sm text-gray-400'>
						Don't have an account?{" "}
						<Link to='/signup' className='text-green-400 hover:underline'>
							Sign up
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default LoginPage;
