"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter, usePathname } from "next/navigation";

const LogOut = () => {
	const [user, setUser] = useState<User | null>(null);
	const [showConfirm, setShowConfirm] = useState(false);
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const logOut = async () => {
		try {
			await signOut(auth);
			setShowConfirm(false);
			setShowProfileMenu(false);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				return router.push("/auth/signIn");
			}
			setUser(user);
		});
		return () => unsubscribe();
	}, [router]);

	// Close profile menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.profile-container')) {
				setShowProfileMenu(false);
			}
		};

		if (showProfileMenu) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showProfileMenu]);

	return (
		<>
			<div className="flex flex-row fixed w-full top-0 justify-between items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg z-10">
				{/* User Profile Section with Dropdown */}
				<div className="relative profile-container">
					<button
						onClick={() => setShowProfileMenu(!showProfileMenu)}
						className={`flex items-center gap-3 text-white font-semibold py-2 px-2 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
							showProfileMenu 
								? 'bg-slate-700/70 shadow-lg border-slate-600' 
								: 'bg-transparent hover:bg-slate-800/30 hover:shadow-xl border-transparent hover:border-white/30'
						}`}
					>
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-75"></div>
							<div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="w-4 h-4 sm:w-5 sm:h-5 text-white"
								>
									<path
										fillRule="evenodd"
										d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>

						<div className="flex flex-col items-start">
							<span className="text-xs text-slate-400 font-medium">Welcome back</span>
							<span className="text-white font-semibold text-base sm:text-lg leading-tight">
								{user?.displayName || (
									<span className="inline-block">
										<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-pulse"></span>
										<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
										<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
										<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></span>
										<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></span>
									</span>
								)}
							</span>
						</div>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className={`w-3 h-3 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
						>
							<path
								fillRule="evenodd"
								d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
								clipRule="evenodd"
							/>
						</svg>
					</button>

					{/* Profile Dropdown */}
					{showProfileMenu && (
						<div className="absolute left-0 top-full mt-2 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl min-w-[250px] z-20">
							<div className="p-3 border-b border-slate-700/50">
								<p className="text-white font-medium text-sm">{user?.displayName || 'User'}</p>
								<p className="text-slate-400 text-xs">{user?.email}</p>
							</div>
							<div className="p-2">
								<button
									onClick={() => setShowConfirm(true)}
									className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-white/30 hover:border-white/50 font-semibold py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm min-w-[80px] sm:min-w-[100px] flex items-center justify-center gap-2"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="w-4 h-4"
									>
										<path
											fillRule="evenodd"
											d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
											clipRule="evenodd"
										/>
									</svg>
									Log Out
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Navigation Buttons - Right Side */}
				<div className="flex items-center gap-3">
					<button
						onClick={() => {
							router.push("/anki");
						}}
						disabled={pathname === "/anki"}
						className={`${
							pathname === "/anki"
								? "bg-gray-600 text-gray-300 cursor-not-allowed border-gray-400"
								: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-white/30 hover:border-white/50"
						} font-semibold py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm min-w-[80px] sm:min-w-[100px] disabled:transform-none disabled:hover:scale-100`}
					>
						Anki
					</button>
					<button
						onClick={() => {
							router.push("/anki/user-input");
						}}
						disabled={pathname === "/anki/user-input"}
						className={`${
							pathname === "/anki/user-input"
								? "bg-gray-600 text-gray-300 cursor-not-allowed border-gray-400"
								: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-white/30 hover:border-white/50"
						} font-semibold py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm min-w-[80px] sm:min-w-[100px] disabled:transform-none disabled:hover:scale-100`}
					>
						User Input
					</button>
				</div>
			</div>

			{/* Confirm Popup */}
			{showConfirm && (
				<div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50 p-4">
					<div className="bg-slate-800 shadow-2xl rounded-xl p-6 w-full max-w-sm sm:max-w-md border-2 border-slate-50/30 flex flex-col items-center">
						<p className="text-white text-base sm:text-lg mb-6 text-center">
							Are you sure you want to log out?
						</p>
						<div className="flex flex-row gap-3 w-full">
							<button
								onClick={() => setShowConfirm(false)}
								className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white border-white/30 hover:border-white/50 font-semibold py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm min-w-[80px] sm:min-w-[100px] flex-1"
							>
								Cancel
							</button>
							<button
								onClick={logOut}
								className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-white/30 hover:border-white/50 font-semibold py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm min-w-[80px] sm:min-w-[100px] flex-1"
							>
								Log Out
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default LogOut;