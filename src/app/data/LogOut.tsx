"use client";
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const LogOut = () => {
	const logOut = async () => {
		await signOut(auth);
	};
	return (
		<div className="fixed top-4 right-4 z-50">
			<button
				onClick={logOut}
				className="bg-white text-[14px] hover:bg-gray-100 active:bg-gray-200 text-slate-800 font-semibold py-2 px-6 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
			>
				Log Out
			</button>
		</div>
	);
};

export default LogOut;
