"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

const LogOut = () => {
	const [user, setUser] = useState<User>();
	const router = useRouter();
	const logOut = async () => {
		await signOut(auth);
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				return router.push("/auth/signIn");
			}
			console.log(await user.getIdToken())
			setUser(user);
		});
		return () => unsubscribe();
	}, [router]);

	return (
		<div className="flex fixed w-full top-0 justify-between items-center px-6 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg">
			{/* User Info Section */}
			<div className="flex items-center gap-3">
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-75"></div>
					<div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="w-5 h-5 text-white"
						>
							<path
								fillRule="evenodd"
								d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>

				<div className="flex flex-col">
					<span className="text-xs text-slate-400 font-medium">
						Welcome back
					</span>
					<span className="text-white font-semibold text-lg leading-tight">
						{user?.displayName || (
							<span className="inline-block">
								<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-[fade_1s_ease-in-out_infinite]"></span>
								<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.2s]"></span>
								<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.4s]"></span>
								<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.6s]"></span>
								<span className="inline-block w-1 h-1 mx-[1px] bg-white rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.8s]"></span>
							</span>
						)}
					</span>
				</div>
			</div>

			{/* Logout Button */}
			<button
				onClick={logOut}
				className="group border-slate-50/30 border-2 relative overflow-hidden bg-gradient-to-r bg-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-red-500/25 active:scale-95 active:translate-y-0"
			>
				{/* Button shine effect */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

				{/* Button content */}
				<div className="relative flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
					>
						<path
							fillRule="evenodd"
							d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
							clipRule="evenodd"
						/>
					</svg>
					<span className="text-sm font-medium">Log Out</span>
				</div>
			</button>
		</div>
	);
};

export default LogOut;
