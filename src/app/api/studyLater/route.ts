	import { FieldPath, Timestamp } from "firebase-admin/firestore";

	import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
	import { NextRequest, NextResponse } from "next/server";

	type UserDoc = {
		wordId: string;
		studyLater: Timestamp;
		dayIndicator: number;
	};

	type Words = {
		english: string;
		kana: string;
		kanji: string;
		wordId: string;
	};

	export const POST = async (req: NextRequest) => {
		const body = await req.json();
		const desiredAmount = parseInt(body.desiredAmount);
		const token = req.headers.get("authorization")?.split("Bearer ")[1];
		if (!token)
			return NextResponse.json(
				{
					message: "missing token",
				},
				{
					status: 401,
				}
			);
		const decode = await adminAuth.verifyIdToken(token);
		const uid = decode.uid;
		const wordIdAndDayIndicator = await fetchWordIdAndDayIndicator(uid);
		const studiedWordList = await fetchWordList(wordIdAndDayIndicator);
		if (
			studiedWordList !== undefined &&
			studiedWordList.length >= desiredAmount
		) {
			return NextResponse.json({
				wordsForToday: studiedWordList?.slice(0, desiredAmount),
			});
		}
		const wordsForToday = await formWordsForTheDay(
			desiredAmount - (studiedWordList?.length || 0)
		);
		return NextResponse.json({
			wordsForToday: wordsForToday,
		});
	};

	const fetchWordIdAndDayIndicator = async (uid: string) => {
		try {
			const userRef = adminDB.collection("users").doc(uid);
			const userSnap = await userRef.get();
			if (!userSnap.exists)
				return NextResponse.json(
					{ message: "user not found" },
					{ status: 404 }
				);
			const data = userSnap.data();
			if (!data) return NextResponse.json({ error: "error" });
			const studyLaterId = data.word_list.map((item: UserDoc) => ({
				wordId: item.wordId,
				dayIndicator: item.dayIndicator,
				studyLater: item.studyLater,
			}));
			return studyLaterId;
		} catch (error) {
			console.error("Token verification or Firestore error:", error);
			return NextResponse.json(
				{ message: "Internal Server Error", error: String(error) },
				{ status: 500 }
			);
		}
	};

	const fetchWordList = async (data: UserDoc[]) => {
		try {
			const docsList = data
				.map((item: UserDoc) => {
					const today = new Date();
					const studyLaterDate = item.studyLater.toDate();
					if (
						studyLaterDate.getFullYear() < today.getFullYear() ||
						(studyLaterDate.getFullYear() === today.getFullYear() &&
							(studyLaterDate.getMonth() < today.getMonth() ||
								(studyLaterDate.getMonth() === today.getMonth() &&
									studyLaterDate.getDate() <= today.getDate())))
					) {
						return item.wordId;
					}
					return null;
				})
				.filter((id) => id !== null);
			if (docsList.length === 0) return;
			const wordsRef = adminDB.collection("words");
			if (docsList.length > 30) {
				const amount=docsList.slice(0, 30)
				const wordsQuery = wordsRef
					.where(FieldPath.documentId(), "in", amount)
					.limit(30);
				const wordsSnap = await wordsQuery.get();
				const list: Words[] = wordsSnap.docs.map((doc) => {
					const data = doc.data();
					return {
						wordId: doc.id,
						english: data.english,
						kana: data.kana,
						kanji: data.kanji,
					};
				});
				return list;
			}
			const wordsQuery = wordsRef
				.where(FieldPath.documentId(), "in", docsList)
				.limit(10);
			const wordsSnap = await wordsQuery.get();
			const list: Words[] = wordsSnap.docs.map((doc) => {
				const data = doc.data();
				return {
					wordId: doc.id,
					english: data.english,
					kana: data.kana,
					kanji: data.kanji,
				};
			});
			return list;
		} catch (error) {
			console.error(error);
		}
	};

	const formWordsForTheDay = async (desiredAmount: number) => {
		try {
			const wordsRef = adminDB.collection("words");
			const wordsQuery = wordsRef.limit(desiredAmount);
			const wordsSnap = await wordsQuery.get();
			const list: Words[] = wordsSnap.docs.map((doc) => {
				const data = doc.data();
				return {
					wordId: doc.id,
					english: data.english,
					kana: data.kana,
					kanji: data.kanji,
				};
			});
			return list;
		} catch (error) {
			console.error(error);
		}
	};

	export const PATCH = async (req: NextRequest) => {
		const body = await req.json();
		const { id, difficulty } = body;
		console.log(id, difficulty);
		const token = req.headers.get("authorization")?.split("Bearer ")[1];
		if (!token)
			return NextResponse.json(
				{
					message: "missing token",
				},
				{
					status: 401,
				}
			);
		const decode = await adminAuth.verifyIdToken(token);
		const uid = decode.uid;
		try {
			await updateDayRepetition(uid, id, difficulty);
		} catch (error) {
			console.error(error);
			return NextResponse.json({ error: "failed to update" });
		}
		return NextResponse.json({ message: "update success" });
	};

	const updateDayRepetition = async (
		uid: string,
		id: string,
		difficulty: string
	) => {
		const userRef = adminDB.collection("users").doc(uid);
		const userSnap = await userRef.get();
		if (!userSnap.exists) {
			return;
		}
		const docData = userSnap.data();
		if (!docData) return;
		const data = docData.word_list as UserDoc[];
		const isWordExistInUserInfo = data.find((word) => word.wordId === id);
		if (isWordExistInUserInfo) {
			if (isWordExistInUserInfo.dayIndicator === 0) {
				const tmr = Timestamp.fromDate(new Date(Date.now() + 86400000));
				const updateData = data.map((data) =>
					data.wordId === isWordExistInUserInfo.wordId
						? {
								...data,
								dayIndicator: 1,
								studyLater: tmr,
						}
						: data
				);
				await userRef.update({
					word_list: updateData,
				});
			} else {
				let updateDate: Timestamp;
				const tomorrow = Timestamp.fromDate(
					new Date(Date.now() + 86400000)
				);
				switch (difficulty) {
					case "easy":
						updateDate = Timestamp.fromDate(
							new Date(
								Date.now() +
									2 *
										isWordExistInUserInfo.dayIndicator *
										86400000
							)
						);
						break;
					case "medium":
						updateDate = Timestamp.fromDate(
							new Date(Date.now() + 2 * 86400000)
						);
						break;
					case "hard":
						updateDate = tomorrow;
						break;

					default:
						break;
				}
				const updatedData = data.map((data) =>
					data.wordId === isWordExistInUserInfo.wordId
						? {
								...data,
								dayIndicator:
									isWordExistInUserInfo.dayIndicator + 1,
								studyLater: updateDate,
						}
						: data
				);
				await userRef.update({
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
			await userRef.update({
				word_list: [...data, newWord],
			});
		}
	};
