"use client";
import { auth } from "@/firebase/firebaseConfig";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";

type Doc = {
	english: string;
	kana: string;
	kanji: string;
	_id: string;
	sentence: string;
	translation: string;
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
			const dataFromLocalStorage = localStorage.getItem(
				"idAndDifficultyArray"
			);
			if (dataFromLocalStorage) {
				try {
					await axios.patch(
						`${process.env.NEXT_PUBLIC_URL}/api/day-repetition`,
						{
							idAndDifficulty: JSON.parse(dataFromLocalStorage),
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
				setWordForToday(res.data.wordsForToday);
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
			const checkLocalStorage = localStorage.getItem(
				"idAndDifficultyArray"
			);
			const wordToAddToLocalStorage = {
				id: id,
				difficulty: difficulty,
			};
			if (
				!checkLocalStorage?.includes(
					JSON.stringify(wordToAddToLocalStorage)
				)
			) {
				const updatedArray = checkLocalStorage
					? [
							...JSON.parse(checkLocalStorage),
							wordToAddToLocalStorage,
					  ]
					: [wordToAddToLocalStorage];
				localStorage.setItem(
					"idAndDifficultyArray",
					JSON.stringify(updatedArray)
				);
			}
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

	const normalComponent = () => (
		<>
			<input
				disabled={isDisabled()}
				type="text"
				className="w-full mb-6 px-4 py-3 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-200"
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
					className="flex-1 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
					onClick={() => setComponentMode("skip")}
				>
					Skip
				</button>
				<button
					disabled={isDisabled()}
					className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
			<div className="text-xl text-emerald-300 text-center mb-3 font-semibold tracking-wide bg-white/10 py-2 px-4 rounded-lg border border-white/20 break-words">
				{wordForToday?.[counter].english}
			</div>
			<div className="text-2xl text-blue-300 text-center mb-6 font-mono bg-white/5 py-3 px-4 rounded-lg border border-white/20 break-words">
				{wordForToday?.[counter].kana}
			</div>
			<div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-white/10 shadow-lg">
				<div className="text-sm font-medium text-slate-300 mb-3 text-center uppercase tracking-wider">
					Example Sentence
				</div>
				<div className="space-y-3">
					<div className="text-lg sm:text-xl text-sky-300 text-center font-bold leading-relaxed bg-slate-900/40 py-3 px-4 rounded-lg border border-slate-400/20 break-words">
						{wordForToday?.[counter].sentence}
					</div>
					<div className="text-lg sm:text-xl text-slate-200 text-center font-bold leading-relaxed bg-slate-900/30 py-2 px-4 rounded-lg border border-slate-400/20 break-words">
						{wordForToday?.[counter].translation}
					</div>
				</div>
			</div>

			<button
				className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
		setWordForToday([...tempWord, wordForToday[counter]]);
	};

	const studyAgainComponent = () => (
		<form className="flex flex-col gap-4">
			<div className="text-xl text-emerald-300 text-center mb-3 font-semibold tracking-wide bg-white/10 py-2 px-4 rounded-lg border border-white/20 break-words">
				{wordForToday?.[counter].english}
			</div>

			{/* Styled Example Sentence Section */}
			<div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-white/10 shadow-lg">
				<div className="text-sm font-medium text-slate-300 mb-3 text-center uppercase tracking-wider">
					Example Sentence
				</div>
				<div className="space-y-3">
					<div className="text-lg sm:text-xl text-sky-300 text-center font-bold leading-relaxed bg-slate-900/40 py-3 px-4 rounded-lg border border-slate-400/20 break-words">
						{wordForToday?.[counter].sentence}
					</div>
					<div className="text-lg sm:text-xl text-slate-200 text-center font-bold leading-relaxed bg-slate-900/30 py-2 px-4 rounded-lg border border-slate-400/20 break-words">
						{wordForToday?.[counter].translation}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<button
					className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
					onClick={() => dayRep("easy")}
				>
					Easy
				</button>
				<button
					className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold py-3 px-4 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
					onClick={() => dayRep("medium")}
				>
					Medium
				</button>
				<button
					className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
					onClick={() => dayRep("hard")}
				>
					Hard
				</button>
			</div>
			<button
				className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
				onClick={() => studyAgain()}
			>
				Study Again
			</button>
		</form>
	);

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4"
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
			<div className="bg-slate-800 shadow-2xl rounded-lg p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl border border-slate-600 mx-auto">
				<div className="mb-8">
					<label className="block text-white font-medium mb-2">
						Select Amount
					</label>
					<select
						className="w-full px-4 py-3 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white bg-slate-700 text-lg transition-all duration-200"
						value={desiredAmount}
						onChange={(e) =>
							setDesiredAmount(Number(e.target.value))
						}
					>
						<option value={5}>5 words</option>
						<option value={10}>10 words</option>
						<option value={15}>15 words</option>
						<option value={20}>20 words</option>
						<option value={25}>25 words</option>
						<option value={30}>30 words</option>
					</select>
				</div>

				<div className="text-2xl sm:text-3xl md:text-4xl text-center mb-8 text-slate-800 bg-white rounded-lg py-6 sm:py-8 px-4 shadow-inner border-2 border-white/50 min-h-[100px] sm:min-h-[120px] flex items-center justify-center break-words">
					{loading ? (
						<span className="inline-block">
							<span className="inline-block w-1 h-1 mx-[1px] bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite]"></span>
							<span className="inline-block w-1 h-1 mx-[1px] bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.2s]"></span>
							<span className="inline-block w-1 h-1 mx-[1px] bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.4s]"></span>
							<span className="inline-block w-1 h-1 mx-[1px] bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.6s]"></span>
							<span className="inline-block w-1 h-1 mx-[1px] bg-slate-950 rounded-full animate-[fade_1s_ease-in-out_infinite] [animation-delay:0.8s]"></span>
						</span>
					) : (
						wordForToday?.[counter]?.kanji || (
							<span className="text-slate-500 text-xl sm:text-2xl">
								No word available
							</span>
						)
					)}
				</div>

				<div className="space-y-4">
					{componentMode === "normal" && normalComponent()}
					{componentMode === "skip" && skipComponent()}
					{componentMode === "studyAgain" && studyAgainComponent()}
				</div>
			</div>
		</div>
	);
};

export default Ankifunctionality;


