"use client";
import React, { useState } from "react";
import useAnkiFunc from "./useAnkiFunc";

const Ankifunctionality = () => {
	const [desiredAmount, setDesiredAmount] = useState(10);
	const [inputAnswer, setInputAnswer] = useState("");
	const [counter, setCounter] = useState(0);
	const {
		wordForToday,
		removeWord,
		dayRepetition,
		studyAgainForThisSession,
	} = useAnkiFunc(desiredAmount);
	const [componentMode, setComponentMode] = useState("normal");

	const submit = () => {
		if (!wordForToday) return;
		if (inputAnswer === wordForToday[counter].kana) {
			setComponentMode("studyAgain");
		}
	};

	const normalComponent = () => (
		<>
			<input
				type="text"
				className="w-full mb-6 px-4 py-3 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-200"
				placeholder="Type your answer here..."
				value={inputAnswer}
				onChange={(e) => setInputAnswer(String(e.target.value))}
			/>
			<div className="flex gap-3">
				<button
					className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
					onClick={submit}
				>
					Submit
				</button>
				<button
					className="flex-1 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
					onClick={() => setComponentMode("skip")}
				>
					Skip
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
			<div className="text-xl text-emerald-300 text-center mb-3 font-semibold tracking-wide bg-white/10 py-2 px-4 rounded-lg border border-white/20">
				{wordForToday?.[counter].english}
			</div>
			<div className="text-2xl text-blue-300 text-center mb-6 font-mono bg-white/5 py-3 px-4 rounded-lg border border-white/20">
				{wordForToday?.[counter].kana}
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
		const wordId = wordForToday?.[counter].wordId;
		if (wordId !== undefined) {
			dayRepetition(wordId, difficulty);
		}
		if (!wordForToday) return;
		if (counter === wordForToday?.length - 1) {
			setCounter((counter) => counter - 1);
		}
		removeWord(counter);
	};

	const studyAgain = () => {
		setComponentMode("normal");
		setInputAnswer("");
		studyAgainForThisSession(counter);
	};

	const studyAgainComponent = () => (
		<div className="flex flex-col gap-4">
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
		</div>
	);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
			<div className="bg-slate-800 shadow-2xl rounded-lg p-8 w-full max-w-lg border border-slate-600">
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
					</select>
				</div>

				<div className="text-4xl text-center mb-8 text-slate-800 bg-white rounded-lg py-8 px-4 shadow-inner border-2 border-white/50 min-h-[120px] flex items-center justify-center">
					{wordForToday?.[counter]?.kanji || (
						<span className="text-slate-500 text-2xl">
							No word available
						</span>
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
