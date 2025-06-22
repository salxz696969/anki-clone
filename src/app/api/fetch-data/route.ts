import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

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
	const userLearntWordsAndCount: { userLearntIds: string[]; count: number } =
		await fetchUserInfo(uid);
	const userLearntWordIds = userLearntWordsAndCount.userLearntIds;

	const count = userLearntWordsAndCount.count;
	if (userLearntWordIds.length >= desiredAmount) {
		return NextResponse.json({
			wordsForToday: await fetchLearntWords(
				userLearntWordIds.slice(0, desiredAmount)
			),
		});
	}
	if (userLearntWordIds.length === 0) {
		return NextResponse.json({
			wordsForToday: await fetchExcessWords(count, desiredAmount, uid),
		});
	}
	if (userLearntWordIds.length < desiredAmount) {
		const learntWords = await fetchLearntWords(userLearntWordIds);
		const excessWords = await fetchExcessWords(
			count,
			desiredAmount - userLearntWordIds.length,
			uid
		);
		return NextResponse.json({
			wordsForToday: [...learntWords, ...excessWords],
		});
	}
};

const fetchUserInfo = async (
	uid: string
): Promise<{ userLearntIds: string[]; count: number }> => {
	try {
		const userRef = adminDB
			.collection("users")
			.doc(uid)
			.collection("learntWords");
		const today = new Date();
		const userQuery = userRef.where("studyLater", "<", today);
		const userSnapshot = await userQuery.get();
		const countSnapshot = await userRef.count().get();
		const count = countSnapshot.data().count || 0;
		const userLearntIds = userSnapshot.docs.map((doc) => doc.id);
		// console.log(
		// 	JSON.stringify(
		// 		userLearntIds.map((id) => ({ id, difficulty: "easy" })),
		// 		null,
		// 		1
		// 	)
		// );
		return { userLearntIds, count };
	} catch (error) {
		throw error;
	}
};

const fetchLearntWords = async (
	userLearntWordIds: string[]
): Promise<Words[]> => {
	try {
		const wordRef = adminDB.collection("n5-batch-1");
		if (userLearntWordIds.length > 30) {
			return [];
		}
		const wordQuery = wordRef.where(
			FieldPath.documentId(),
			"in",
			userLearntWordIds
		);
		const wordSnap = await wordQuery.get();
		const wordsForToday = wordSnap.docs.map((doc) => ({
			wordId: doc.id,
			english: doc.data().english,
			kana: doc.data().kana,
			kanji: doc.data().kanji,
		}));
		return wordsForToday;
		return []
	} catch (error) {
		console.error(error);
		return [];
	}
};

const fetchExcessWords = async (
	count: number,
	amountToSlice: number,
	uid: string
): Promise<Words[]> => {
	try {
		const wordRef = adminDB.collection("n5-batch-1");
		const wordQuery = wordRef.limit(count + amountToSlice);
		const wordSnapshot = await wordQuery.get();
		const excessWords = wordSnapshot.docs.map((doc) => ({
			wordId: doc.id,
			english: doc.data().english,
			kana: doc.data().kana,
			kanji: doc.data().kanji,
		}));
		if (excessWords) {
			const batch = adminDB.batch();
			const writeToUserRef = adminDB
				.collection("users")
				.doc(uid)
				.collection("learntWords");
			const appendWord = excessWords.slice(count, excessWords.length);
			appendWord.forEach((word) => {
				const wordRef = writeToUserRef.doc(word.wordId);
				batch.set(wordRef, {
					dayIndicator: 0,
					studyLater: new Date(),
				}, { merge: true });
			});

			await batch.commit();
		}
		return excessWords.slice(count, excessWords.length);
	} catch (error) {
		console.error(error);
		return [];
	}
};
