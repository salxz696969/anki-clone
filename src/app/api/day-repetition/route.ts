import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

type UserDoc = {
	studyLater: Timestamp;
	dayIndicator: number;
};

type IdAndDifficulty = {
	id: string;
	difficulty: string;
};

export const PATCH = async (req: NextRequest) => {
	const token = req.headers.get("authorization")?.split("Bearer ")[1];
	const body = await req.json();
	const { idAndDifficulty } = body;
	const idAndDifficultyArr: IdAndDifficulty[] = idAndDifficulty;
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
		await batchUpdate(uid, idAndDifficultyArr);
	} catch (error) {
		return NextResponse.json({ error: error, status: 400 });
	}
	return NextResponse.json({ status: 200 });
};

const batchUpdate = async (
	uid: string,
	idAndDifficultyArr: IdAndDifficulty[]
) => {
	const batch = adminDB.batch();
	// console.log(idAndDifficultyArr)
	for (const idAndDifficulty of idAndDifficultyArr) {
		const ref = adminDB
			.collection("users2")
			.doc(uid)
			.collection("learntWords")
			.doc(idAndDifficulty.id);
		const snap = await ref.get();
		if (!snap.exists) {
			console.error(`Document not found for id: ${idAndDifficulty.id}`);
			continue; // Skip if document doesn't exist
		}
		const data = snap.data() as UserDoc;
		if (data.dayIndicator === 0) {
			const today = new Date();	
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			batch.update(ref, {
				dayIndicator: FieldValue.increment(1),
				studyLater: tomorrow,
			});
		} else {
			const today = new Date();
			const dayToUpdate = new Date(today);
			switch (idAndDifficulty.difficulty) {
				case "easy":
					dayToUpdate.setDate(
						dayToUpdate.getDate() + 2 * data.dayIndicator
					);
					batch.update(ref, {
						dayIndicator: FieldValue.increment(1),
						studyLater: dayToUpdate,
					});
					break;
				case "medium":
					dayToUpdate.setDate(
						dayToUpdate.getDate() + data.dayIndicator
					);
					batch.update(ref, {
						dayIndicator: FieldValue.increment(1),
						studyLater: dayToUpdate,
					});
					break;
				case "hard":
					dayToUpdate.setDate(dayToUpdate.getDate() + 1);
					batch.update(ref, {
						dayIndicator: FieldValue.increment(1),
						studyLater: dayToUpdate,
					});
					break;
				default:
					break;
			}
		}
	}
	await batch.commit();
};