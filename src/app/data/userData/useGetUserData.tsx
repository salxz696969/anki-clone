"use client";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	where,
	query,
	documentId,
	Timestamp,
} from "firebase/firestore";

type UserDoc = {
	wordId: string;
	studyLater: Timestamp;
	dayIndicator: number;
};

type UserWordList = {
	word_list: UserDoc[];
};

type Words = {
	english: string;
	kana: string;
	kanji: string;
	wordId: string;
};

type DocToSend = {
	dayIndicator: number;
	wordId: string;
};

const useGetUserData = () => {
	const [user, setUser] = useState<User | null>(null);
	const [wordList, setWordList] = useState<Words[] | null>(null);
	const [docToSend, setDocToSend] = useState<DocToSend[]>([]);
	const router = useRouter();
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				return router.push("/auth/signIn");
			}
			try {
				setUser(user);
				const userRef = doc(db, "users", user.uid);
				const userSnap = await getDoc(userRef);
				if (!userSnap.exists()) return;
				const data = userSnap.data() as UserWordList;
				const studyLaterId = data.word_list.map((item: UserDoc) => ({
					wordId: item.wordId,
					dayIndicator: item.dayIndicator,
				}));
				setDocToSend(studyLaterId);

				const docsList = data.word_list
					.map((item: UserDoc) => {
						const today = new Date();
						const studyLaterDate = item.studyLater.toDate();
						if (
							studyLaterDate.getFullYear() <
								today.getFullYear() ||
							(studyLaterDate.getFullYear() ===
								today.getFullYear() &&
								(studyLaterDate.getMonth() < today.getMonth() ||
									(studyLaterDate.getMonth() ===
										today.getMonth() &&
										studyLaterDate.getDate() <=
											today.getDate())))
						) {
							return item.wordId;
						}
						return null;
					})
					.filter((id) => id !== null);
				if (docsList.length === 0) return;
				const wordsQuery = query(
					collection(db, "words"),
					where(documentId(), "in", docsList)
				);
				const wordsList = await getDocs(wordsQuery);
				const list: Words[] = wordsList.docs.map((doc) => {
					const data = doc.data();
					return {
						wordId: doc.id,
						english: data.english,
						kana: data.kana,
						kanji: data.kanji,
					};
				});
				setWordList(list);
			} catch (error) {
				console.error(error);
			}
		});
		return () => unsubscribe();
	}, [router]);

	return { user, wordList, docToSend };
};

export default useGetUserData;
