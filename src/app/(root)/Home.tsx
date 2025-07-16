"use client";
import React, { useEffect } from "react";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
const Home = () => {
	const router = useRouter();
	useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push("/data");
            }
        });
        return () => unsubscribe();
    }, [router]);
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
			<div className="bg-slate-800 shadow-2xl rounded-lg p-12 w-full max-w-2xl border border-slate-600 text-center">
				<h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text">
					Welcome to Anki-Clone
				</h1>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<button
						onClick={() => {
							router.push("/auth/signUp");
						}}
						className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-4 px-8 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
					>
						Sign Up
					</button>
					<span className="text-slate-400 hidden sm:block">or</span>
					<span className="text-slate-400 sm:hidden">or</span>

					<button
						onClick={() => {
							router.push("/auth/signIn");
						}}
						className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 px-8 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
					>
						Sign In
					</button>
				</div>
			</div>
		</div>
	);
};

export default Home;


