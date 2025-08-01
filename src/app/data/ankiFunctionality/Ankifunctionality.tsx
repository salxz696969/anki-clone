"use client";
import { auth } from "@/firebase/firebaseConfig";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import LogOut from "../LogOut";

type Doc = {
	english: string;
	kana: string;
	kanji: string;
	_id: string;
	sentence: string;
	translation: string;
	isSkipped: boolean;
};

const Ankifunctionality = () => {
	const [wordForToday, setWordForToday] = useState<Doc[]>([]);
	const [desiredAmount, setDesiredAmount] = useState(10);
	const [inputAnswer, setInputAnswer] = useState("");
	const [counter, setCounter] = useState(0);
	const [token, setToken] = useState("");
	const [componentMode, setComponentMode] = useState("normal");
	const [loading, setLoading] = useState(true);
	const [isFetched, setIsFetched] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) return;
			setToken(await user.getIdToken());
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!token) return;
		const updatePastData = async () => {
			const dataFromLocalStorage = localStorage.getItem("idAndDifficultyArray");
			if (dataFromLocalStorage) {
				try {
					await axios.patch(
						`${process.env.NEXT_PUBLIC_URL}/api/day-repetition`,
						{
							idAndDifficultyArray: JSON.parse(dataFromLocalStorage),
						},
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);
					localStorage.removeItem("idAndDifficultyArray");
				} catch (error) {
					console.error(error);
				}
			}
		};
		const fetchData = async () => {
			setIsFetched(true);
			try {
				const res = await axios.post(
					`${process.env.NEXT_PUBLIC_URL}/api/fetch-data`,
					{
						desiredAmount,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setWordForToday(res.data.wordsForToday.map((word: Doc) => ({ ...word, isSkipped: false })));
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
				setIsFetched(false);
			}
		};

		const run = async () => {
			await updatePastData();
			fetchData();
		};
		run();
	}, [token, desiredAmount]);

	const dayRepetition = (id: string, difficulty: string) => {
		try {
			const checkLocalStorage = localStorage.getItem("idAndDifficultyArray");
			const wordToAddToLocalStorage = { id, difficulty };

			let updatedArray = [];
			if (checkLocalStorage) {
				updatedArray = JSON.parse(checkLocalStorage);
				// Check if the id already exists
				if (!updatedArray.some((item: { id: string; difficulty: string }) => item.id === id)) {
					updatedArray.push(wordToAddToLocalStorage);
				}
			} else {
				updatedArray = [wordToAddToLocalStorage];
			}
			localStorage.setItem("idAndDifficultyArray", JSON.stringify(updatedArray));
		} catch (error) {
			console.error(error);
		}
	};

	const submit = () => {
		if (!wordForToday) return;
		const correctAnswers = wordForToday[counter].kana
			.split(";")
			.map((ans) => ans.replace(/\s+/g, "").normalize("NFKC"));

		const userAnswer = inputAnswer.replace(/\s+/g, "").normalize("NFKC");

		if (correctAnswers.some((ans) => userAnswer === ans)) {
			setComponentMode("studyAgain");
		}
	};

	const isDisabled = () => {
		if (wordForToday.length === 0 || loading || isFetched) {
			return true;
		}
	};

	const handleSkip = () => {
		const currentData = wordForToday.map((word, index) => {
			if (index === counter) {
				return { ...word, isSkipped: true };
			}
			return word;
		});
		setWordForToday(currentData);
		setComponentMode("skip");
	};

	const normalComponent = () => (
		<>
			<input
				disabled={isDisabled()}
				type="text"
				className="w-full mb-6 px-4 py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-300 shadow-lg"
				placeholder="Type your answer here..."
				value={inputAnswer}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						submit();
					}
				}}
				onChange={(e) => setInputAnswer(String(e.target.value))}
			/>
			<div className="flex gap-3">
				<button
					disabled={isDisabled()}
					className="flex-1 border-slate-50/30 border-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={handleSkip}
				>
					Skip
				</button>
				<button
					disabled={isDisabled()}
					className="flex-1 border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={submit}
				>
					Submit
				</button>
			</div>
		</>
	);

	const continueToTheNext = () => {
		setComponentMode("normal");
		if (!wordForToday) return;
		if (wordForToday.length - 1 === counter) {
			setCounter(0);
		} else {
			setCounter((counter) => counter + 1);
		}
		setInputAnswer("");
	};

	const skipComponent = () => (
		<>
			<div className="text-xl text-emerald-300 text-center mb-3 font-semibold tracking-wide bg-slate-800/50 py-3 px-4 rounded-xl border-2 border-slate-50/30 shadow-lg break-words">
				{wordForToday?.[counter].english}
			</div>
			<div className="text-2xl text-blue-300 text-center mb-6 font-mono bg-slate-800/50 py-4 px-4 rounded-xl border-2 border-slate-50/30 shadow-lg break-words">
				{wordForToday?.[counter].kana}
			</div>
			<div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border-2 border-slate-50/30 shadow-lg">
				<div className="text-sm font-medium text-slate-300 mb-3 text-center uppercase tracking-wider">
					Example Sentence
				</div>
				<div className="space-y-3">
					<div className="text-lg sm:text-xl text-sky-300 text-center font-bold leading-relaxed bg-slate-900/40 py-3 px-4 rounded-xl border border-slate-400/20 break-words">
						{wordForToday?.[counter].sentence}
					</div>
					<div className="text-lg sm:text-xl text-slate-200 text-center font-bold leading-relaxed bg-slate-900/30 py-2 px-4 rounded-xl border border-slate-400/20 break-words">
						{wordForToday?.[counter].translation}
					</div>
				</div>
			</div>

			<button
				className="w-full border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95 active:translate-y-0"
				onClick={continueToTheNext}
			>
				Continue
			</button>
		</>
	);

	const dayRep = (difficulty: string) => {
		setComponentMode("normal");
		setInputAnswer("");
		const wordId = wordForToday?.[counter]._id;
		if (wordId !== undefined) {
			dayRepetition(wordId, difficulty);
		}
		if (!wordForToday) return;
		if (counter === wordForToday?.length - 1) {
			setCounter((counter) => counter - 1);
		}
		removeWord();
	};

	const removeWord = () => {
		const tempWord = wordForToday.filter((_, index) => index !== counter);
		setWordForToday(tempWord);
	};

	const studyAgain = () => {
		setComponentMode("normal");
		setInputAnswer("");
		studyAgainForThisSession();
	};

	const studyAgainForThisSession = () => {
		const tempWord = wordForToday.filter((_, index) => index !== counter);
		setWordForToday([...tempWord, { ...wordForToday[counter], isSkipped: false }]);
	};

	const studyAgainComponent = () => (
		<form className="flex flex-col gap-4">
			<div className="text-xl text-emerald-300 text-center mb-3 font-semibold tracking-wide bg-slate-800/50 py-3 px-4 rounded-xl border-2 border-slate-50/30 shadow-lg break-words">
				{wordForToday?.[counter].english}
			</div>

			{/* Styled Example Sentence Section */}
			<div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border-2 border-slate-50/30 shadow-lg">
				<div className="text-sm font-medium text-slate-300 mb-3 text-center uppercase tracking-wider">
					Example Sentence
				</div>
				<div className="space-y-3">
					<div className="text-lg sm:text-xl text-sky-300 text-center font-bold leading-relaxed bg-slate-900/40 py-3 px-4 rounded-xl border border-slate-400/20 break-words">
						{wordForToday?.[counter].sentence}
					</div>
					<div className="text-lg sm:text-xl text-slate-200 text-center font-bold leading-relaxed bg-slate-900/30 py-2 px-4 rounded-xl border border-slate-400/20 break-words">
						{wordForToday?.[counter].translation}
					</div>
				</div>
			</div>

			{!wordForToday?.[counter].isSkipped && (
				<div className="grid grid-cols-3 gap-3">
					<button
						type="button"
						className="border-slate-50/30 border-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/25 active:scale-95 active:translate-y-0"
						onClick={() => dayRep("easy")}
					>
						Easy
					</button>
					<button
						type="button"
						className="border-slate-50/30 border-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-amber-500/25 active:scale-95 active:translate-y-0"
						onClick={() => dayRep("medium")}
					>
						Medium
					</button>
					<button
						type="button"
						className="border-slate-50/30 border-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-red-500/25 active:scale-95 active:translate-y-0"
						onClick={() => dayRep("hard")}
					>
						Hard
					</button>
					<button
						className="col-span-3 border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95 active:translate-y-0"
						onClick={() => studyAgain()}
					>
						Study Again
					</button>
				</div>
			)}
			{wordForToday?.[counter].isSkipped && (
				<div className="grid grid-cols-2 gap-3">
					<button
						className="border-slate-50/30 border-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-slate-500/25 active:scale-95 active:translate-y-0"
						onClick={() => studyAgain()}
					>
						Study Again
					</button>
					<button
						className="border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95 active:translate-y-0"
						onClick={() => dayRep("hard")}
					>
						Continue
					</button>
				</div>
			)}
		</form>
	);

	return (
		<>
			<LogOut />
			<div
				className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-2 pt-20"
				onKeyDown={(e) => {
					if (e.key === "1") {
						dayRep("easy");
					} else if (e.key === "2") {
						dayRep("medium");
					} else if (e.key === "3") {
						dayRep("hard");
					}
				}}
			>
				<div className="bg-slate-800 shadow-2xl rounded-xl p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl border-2 border-slate-50/30 mx-auto">
					<div className="mb-6 sm:mb-8">
						<label className="block text-white font-medium mb-2 text-sm sm:text-base">Select Amount</label>
						<select
							className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 text-base sm:text-lg transition-all duration-300 shadow-lg"
							value={desiredAmount}
							onChange={(e) => setDesiredAmount(Number(e.target.value))}
						>
							<option value={5}>5 words</option>
							<option value={10}>10 words</option>
							<option value={15}>15 words</option>
							<option value={20}>20 words</option>
							<option value={25}>25 words</option>
							<option value={30}>30 words</option>
						</select>
					</div>

					<div className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl text-center mb-6 sm:mb-8 text-slate-800 bg-white rounded-xl py-6 sm:py-8 md:py-10 px-4 shadow-inner border-2 border-slate-50/50 min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] flex items-center justify-center break-words">
						{loading ? (
							<span className="inline-block">
								<span className="inline-block w-2 h-2 mx-1 bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite]"></span>
								<span className="inline-block w-2 h-2 mx-1 bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.2s]"></span>
								<span className="inline-block w-2 h-2 mx-1 bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.4s]"></span>
								<span className="inline-block w-2 h-2 mx-1 bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.6s]"></span>
								<span className="inline-block w-2 h-2 mx-1 bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.8s]"></span>
							</span>
						) : (
							wordForToday?.[counter]?.kanji || (
								<span className="text-slate-500 text-xl sm:text-2xl md:text-3xl">No word available</span>
							)
						)}
					</div>

					<div className="space-y-3 sm:space-y-4">
						{componentMode === "normal" && normalComponent()}
						{componentMode === "skip" && skipComponent()}
						{componentMode === "studyAgain" && studyAgainComponent()}
					</div>
				</div>
			</div>
		</>
	);
};

export default Ankifunctionality;