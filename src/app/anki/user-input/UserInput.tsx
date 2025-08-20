"use client";
import React, { useEffect, useState } from "react";

type Word = {
	english: string;
	kana: string;
	kanji?: string;
	sentence?: string;
	translation?: string;
};

type UserInputProps = {
	english: string;
	kana: string;
	kanji?: string;
	sentence?: string;
	translation?: string;
};

const SimpleJapaneseStudy = () => {
	const [words, setWords] = useState<Word[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [inputAnswer, setInputAnswer] = useState("");
	const [mode, setMode] = useState<"study" | "result">("study");
	const [showAddWord, setShowAddWord] = useState(false);
	const [showClearModal, setShowClearModal] = useState(false);
	const [userInput, setUserInput] = useState<UserInputProps>({
		english: "",
		kana: "",
		kanji: "",
		sentence: "",
		translation: ""
	});

	// Load words from localStorage on component mount
	useEffect(() => {
		const savedWords = localStorage.getItem('japaneseWords');
		if (savedWords) {
			try {
				const parsedWords = JSON.parse(savedWords);
				setWords(parsedWords);
			} catch (error) {
				console.error('Error parsing saved words:', error);
				setWords([]);
			}
		}
	}, []);

	// Save words to localStorage whenever words array changes
	useEffect(() => {
		localStorage.setItem('japaneseWords', JSON.stringify(words));
	}, [words]);

	const addWordModal = () => {
		return (
			<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
				<div className="bg-slate-800/95 shadow-2xl rounded-xl p-6 w-full max-w-md border-2 border-slate-50/30 backdrop-blur-sm">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-xl font-semibold text-white tracking-wide">Add New Word</h3>
						<button 
							onClick={() => {
								setShowAddWord(false);
								setUserInput({ english: "", kana: "", kanji: "", sentence: "", translation: "" });
							}}
							className="text-slate-400 hover:text-white transition-colors text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700/50"
						>
							×
						</button>
					</div>
					<div className="flex flex-col gap-4">
						<input
							type="text"
							value={userInput.english}
							onChange={(e) => setUserInput(prev => ({ ...prev, english: e.target.value }))}
							placeholder="English"
							className="w-full px-4 py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-300 shadow-lg"
						/>
						<input
							type="text"
							value={userInput.kana}
							onChange={(e) => setUserInput(prev => ({ ...prev, kana: e.target.value }))}
							placeholder="Kana (Required)"
							className="w-full px-4 py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-300 shadow-lg"
						/>
						<input
							type="text"
							value={userInput.kanji || ""}
							onChange={(e) => setUserInput(prev => ({ ...prev, kanji: e.target.value }))}
							placeholder="Kanji (optional)"
							className="w-full px-4 py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-300 shadow-lg"
						/>
						<input
							type="text"
							value={userInput.sentence || ""}
							onChange={(e) => setUserInput(prev => ({ ...prev, sentence: e.target.value }))}
							placeholder="Example sentence (optional)"
							className="w-full px-4 py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-300 shadow-lg"
						/>
						<input
							type="text"
							value={userInput.translation || ""}
							onChange={(e) => setUserInput(prev => ({ ...prev, translation: e.target.value }))}
							placeholder="Translation (optional)"
							className="w-full px-4 py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-300 shadow-lg"
						/>
						<div className="flex gap-3 mt-2">
							<button 
								onClick={() => {
									setShowAddWord(false);
									setUserInput({ english: "", kana: "", kanji: "", sentence: "", translation: "" });
								}}
								className="flex-1 border-slate-50/30 border-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
							>
								Cancel
							</button>
							<button 
								onClick={addWord} 
								disabled={!userInput.english || !userInput.kana}
								className="flex-1 border-slate-50/30 border-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Add Word
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const clearModal = () => {
		return (
			<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
				<div className="bg-slate-800/95 shadow-2xl rounded-xl p-6 w-full max-w-sm border-2 border-slate-50/30 backdrop-blur-sm">
					<div className="text-center">
						<h3 className="text-xl font-semibold text-white mb-4">Clear All Words?</h3>
						<p className="text-slate-300 mb-6">This will remove all your saved words. This action cannot be undone.</p>
						<div className="flex gap-3">
							<button 
								onClick={() => setShowClearModal(false)}
								className="flex-1 border-slate-50/30 border-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
							>
								Cancel
							</button>
							<button 
								onClick={clearAllWords} 
								className="flex-1 border-slate-50/30 border-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
							>
								Clear All
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const addWord = () => {
		if (!userInput.english || !userInput.kana) return;

		const newWord: Word = {
			english: userInput.english.trim(),
			kana: userInput.kana.trim(),
			kanji: userInput.kanji?.trim(),
			sentence: userInput.sentence?.trim(),
			translation: userInput.translation?.trim()
		};

		// Check if word already exists
		const exists = words.some(word => 
			word.english.toLowerCase() === newWord.english.toLowerCase() && 
			word.kana === newWord.kana
		);

		if (!exists) {
			setWords(prev => [...prev, newWord]);
		}

		setUserInput({ english: "", kana: "", kanji: "", sentence: "", translation: "" });
		setShowAddWord(false);
	};

	const clearAllWords = () => {
		setWords([]);
		setCurrentIndex(0);
		setMode("study");
		setInputAnswer("");
		setShowClearModal(false);
	};

	const checkAnswer = () => {
		if (words.length === 0) return;
		setMode("result");
	};

	const nextWord = () => {
		setMode("study");
		setInputAnswer("");
		setCurrentIndex((prev) => (prev + 1) % words.length);
	};

	const checkIfCorrect = () => {
		if (words.length === 0) return false;
		const currentWord = words[currentIndex];
		const correctAnswers = currentWord.kana
			.split(";")
			.map(ans => ans.trim().toLowerCase());
		return correctAnswers.includes(inputAnswer.trim().toLowerCase());
	};

	if (words.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
				{showAddWord && addWordModal()}
				
				<div className="bg-slate-800 shadow-2xl rounded-xl p-8 max-w-md border-2 border-slate-50/30 text-center">
					<h1 className="text-3xl font-bold text-white mb-6">Japanese Study App</h1>
					<p className="text-slate-300 mb-6">No words added yet. Start by adding your first word!</p>
					<button
						onClick={() => setShowAddWord(true)}
						className="border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
					>
						+ Add First Word
					</button>
				</div>
			</div>
		);
	}

	const currentWord = words[currentIndex];

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
			{/* Modals */}
			{showAddWord && addWordModal()}
			{showClearModal && clearModal()}

			{/* Top Buttons */}
			<div className="flex gap-4 mb-6">
				<button
					onClick={() => setShowAddWord(true)}
					className="border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
				>
					+ Add Word
				</button>
				
				<button
					onClick={() => setShowClearModal(true)}
					className="border-slate-50/30 border-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
				>
					Clear All
				</button>
			</div>

			<div className="bg-slate-800 shadow-2xl rounded-xl p-8 w-full max-w-lg border-2 border-slate-50/30">
				{/* Progress */}
				<div className="text-center mb-6">
					<span className="text-slate-300">Word {currentIndex + 1} of {words.length}</span>
				</div>

				{/* Main Display */}
				<div className="text-5xl text-center mb-8 text-slate-800 bg-white rounded-xl py-10 px-4 shadow-inner border-2 border-slate-50/50 min-h-[180px] flex items-center justify-center">
					{currentWord.kanji || currentWord.english}
				</div>

				{mode === "study" && (
					<div className="space-y-4">
						<input
							type="text"
							className="w-full px-4 py-3 border-2 border-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 text-white bg-slate-700 placeholder-slate-300 text-lg transition-all duration-300 shadow-lg"
							placeholder="Type the kana reading..."
							value={inputAnswer}
							onChange={(e) => setInputAnswer(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									checkAnswer();
								}
							}}
						/>
						<button
							onClick={checkAnswer}
							disabled={!inputAnswer.trim()}
							className="w-full border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Check Answer
						</button>
					</div>
				)}

				{mode === "result" && (
					<div className="space-y-4">
						{/* Result */}
						<div className={`text-center p-4 rounded-xl border-2 ${
							checkIfCorrect() 
								? 'bg-green-900/50 border-green-500/50 text-green-300' 
								: 'bg-red-900/50 border-red-500/50 text-red-300'
						}`}>
							<div className="text-xl font-semibold mb-2">
								{checkIfCorrect() ? '✓ Correct!' : '✗ Incorrect'}
							</div>
							<div className="text-lg">
								Answer: <span className="font-bold">{currentWord.kana}</span>
							</div>
						</div>

						{/* English Translation */}
						<div className="text-center p-4 bg-slate-700/50 rounded-xl border-2 border-slate-50/30">
							<div className="text-emerald-300 text-xl font-semibold">
								{currentWord.english}
							</div>
						</div>

						{/* Example Sentence */}
						{(currentWord.sentence || currentWord.translation) && (
							<div className="p-4 bg-slate-700/50 rounded-xl border-2 border-slate-50/30">
								<div className="text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
									Example
								</div>
								{currentWord.sentence && (
									<div className="text-sky-300 mb-2">{currentWord.sentence}</div>
								)}
								{currentWord.translation && (
									<div className="text-slate-200">{currentWord.translation}</div>
								)}
							</div>
						)}

						<button
							onClick={nextWord}
							className="w-full border-slate-50/30 border-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
						>
							Next Word
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SimpleJapaneseStudy;