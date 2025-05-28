"use client";
import { useEffect, useState } from "react";
import useGetUserData from "../userData/useGetUserData";
import {
	collection,
	query,
	limit,
	getDocs,
	doc,
	getDoc,
	updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Timestamp } from "firebase/firestore";

type Doc = {
	english: string;
	kana: string;
	kanji: string;
	wordId: string;
};

type UserDoc = {
	wordId: string;
	studyLater: Timestamp;
	dayIndicator: number;
};

type UserWordList = {
	word_list: UserDoc[];
};

const useAnkiFunc = (desiredAmount: number) => {
	const { wordList, docToSend, user } = useGetUserData();
	const [wordForToday, setWordForToday] = useState<Doc[] | null>(null);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const wordsLimit = desiredAmount - (wordList?.length ?? 0) ;
				const wordsQuery = query(
					collection(db, "words"),
					limit(wordsLimit+docToSend.length)
				);
				const snapShot = await getDocs(wordsQuery);
				if (!docToSend) return;
				const docsToUse = snapShot.docs
					.filter(
						(doc) => !docToSend?.some((d) => d.wordId === doc.id)
					)
					.slice(0, wordsLimit);
				const data: Doc[] = docsToUse.map((doc) => {
					const data = doc.data();
					return {
						wordId: doc.id,
						english: data.english,
						kana: data.kana,
						kanji: data.kanji,
					};
				});
				const wordToStudyForToday = [...data, ...(wordList ?? [])];
				setWordForToday(wordToStudyForToday);
			} catch (error) {
				console.error(error);
			}
		};
		fetchData();
	}, [desiredAmount, wordList, docToSend]);

	const removeWord = (index: number) => {
		if (!wordForToday) return;
		const words = wordForToday?.filter((_, id) => id != index);
		setWordForToday(words);
	};

	const studyAgainForThisSession = (index: number) => {
		if (!wordForToday) return;
		const words = wordForToday.filter((_, id) => id !== index);
		const wordToStudyAgainThisSession = wordForToday[index];
		setWordForToday([...words, wordToStudyAgainThisSession]);
	};

	const dayRepetition = async (id: string, difficulty: string) => {
		const TIME_FORMULA = 60 * 60 * 24;
		if (!user) return;
		try {
			const userRef = doc(db, "users", user.uid);
			const userSnap = await getDoc(userRef);
			if (!userSnap.exists()) return;
			const data = userSnap.data() as UserWordList;
			const checkIfTheIdIsInUser = data.word_list.find(
				(word) => word.wordId === id
			);
			if (checkIfTheIdIsInUser) {
				if (checkIfTheIdIsInUser.dayIndicator === 0) {
					const updatedDate = new Timestamp(
						checkIfTheIdIsInUser.studyLater.seconds + TIME_FORMULA,
						checkIfTheIdIsInUser.studyLater.nanoseconds
					);
					const updatedData = data.word_list.map((data) =>
						data.wordId === checkIfTheIdIsInUser.wordId
							? {
									...data,
									dayIndicator: 1,
									studyLater: updatedDate,
							  }
							: data
					);
					await updateDoc(userRef, {
						word_list: updatedData,
					});
				} else {
					let updateDate: Timestamp;
					switch (difficulty) {
						case "easy":
							updateDate = new Timestamp(
								checkIfTheIdIsInUser.studyLater.seconds +
									TIME_FORMULA *
										checkIfTheIdIsInUser.dayIndicator *
										2,
								checkIfTheIdIsInUser.studyLater.nanoseconds
							);
							break;
						case "medium":
							updateDate = new Timestamp(
								checkIfTheIdIsInUser.studyLater.seconds +
									TIME_FORMULA *
										checkIfTheIdIsInUser.dayIndicator,
								checkIfTheIdIsInUser.studyLater.nanoseconds
							);
							break;
						case "hard":
							updateDate = new Timestamp(
								checkIfTheIdIsInUser.studyLater.seconds +
									TIME_FORMULA,
								checkIfTheIdIsInUser.studyLater.nanoseconds
							);
							break;

						default:
							break;
					}
					const updatedData = data.word_list.map((data) =>
						data.wordId === checkIfTheIdIsInUser.wordId
							? {
									...data,
									dayIndicator:
										checkIfTheIdIsInUser.dayIndicator + 1,
									studyLater: updateDate,
							  }
							: data
					);
					await updateDoc(userRef, {
						word_list: updatedData,
					});
				}
			} else {
				const tomorrow = new Date();
				tomorrow.setDate(tomorrow.getDate() + 1);
				const newWord = {
					wordId: id,
					studyLater: Timestamp.fromDate(tomorrow),
					dayIndicator: 0,
				};
				await updateDoc(userRef, {
					word_list: [...data.word_list, newWord],
				});
			}
		} catch (error) {
			console.error(error);
		}
	};

	return {
		wordForToday,
		removeWord,
		studyAgainForThisSession,
		dayRepetition,
	};
};

export default useAnkiFunc;
