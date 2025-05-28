"use client";
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firebaseConfig";
import { Timestamp } from "firebase-admin/firestore";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
	const [password, setPassword] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const router = useRouter();
	const [user, setUser] = useState<import("firebase/auth").User | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (user) {
			router.push("/data");
		}
	});

	const handleInputEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handleInputPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const signUpWithEmailAndPassword = async () => {
		try {
			const currentUser = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			if (currentUser.user) {
				const userDocRef = doc(db, "users", currentUser.user.uid);
				const userDocSnap = await getDoc(userDocRef);

				if (!userDocSnap.exists()) {
					await setDoc(userDocRef, {
						word_list: [] as {
							wordId: string;
							studyLater: Timestamp;
							dayIndicator: number;
						}[],
					});
				}
			}
		} catch (error) {
			console.error(error);
		}
	};

	const signUpWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		provider.setCustomParameters({
			prompt: "select_account",
		});
		try {
			const currentUser = await signInWithPopup(auth, provider);
			if (currentUser.user) {
				const userDocRef = doc(db, "users", currentUser.user.uid);
				const userDocSnap = await getDoc(userDocRef);

				if (!userDocSnap.exists()) {
					await setDoc(userDocRef, {
						word_list: [] as {
							wordId: string;
							studyLater: Timestamp;
							dayIndicator: number;
						}[],
					});
				}
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
			<div className="bg-slate-800 shadow-2xl rounded-lg p-8 w-full max-w-md border border-slate-600">
				<h1 className="text-3xl font-bold text-white text-center mb-8">
					Sign Up
				</h1>

				<div className="space-y-6">
					<div>
						<label className="block text-white font-medium mb-2">
							Email
						</label>
						<input
							type="email"
							className="w-full px-4 py-3 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-200"
							placeholder="Enter your email..."
							value={email}
							onChange={handleInputEmail}
						/>
					</div>

					<div>
						<label className="block text-white font-medium mb-2">
							Password
						</label>
						<input
							type="password"
							className="w-full px-4 py-3 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-200"
							placeholder="Create a password..."
							value={password}
							onChange={handleInputPassword}
						/>
					</div>

					<button
						onClick={signUpWithEmailAndPassword}
						className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
					>
						Sign Up
					</button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-white/20"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-slate-800 text-slate-400">
								Or
							</span>
						</div>
					</div>

					<button
						onClick={signUpWithGoogle}
						className="w-full bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
					>
						<svg
							className="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Sign Up With Google
					</button>
				</div>

				<div className="mt-8 text-center">
					<p className="text-slate-400 text-sm">
						Already have an account?{" "}
						<span
							className="text-blue-400 hover:text-blue-300 cursor-pointer underline"
							onClick={() => {
								router.push("/auth/signIn");
							}}
						>
							Sign In
						</span>
					</p>
				</div>
			</div>
		</div>
	);
};

export default SignUpForm;
