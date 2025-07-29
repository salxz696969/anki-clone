import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import LearntWords from "../mongoose/model/learntWordsModel";
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
		await updateStudyLater(uid, idAndDifficultyArr);
		return NextResponse.json({ status: 200 });
	} catch (error) {
		return NextResponse.json({ error: error, status: 400 });
	}
};

const updateStudyLater = async (uid: string, idAndDifficultyArr: IdAndDifficulty[]) => {
	for (const idAndDifficulty of idAndDifficultyArr) {
		const checkIfExist = await LearntWords.find({
			userId: uid,
			wordId: idAndDifficulty.id,
		});
		if (checkIfExist.length === 0) {
			await LearntWords.create({
				userId: uid,
				wordId: idAndDifficulty.id,
				studyLater: new Date(),
				dayIndicator: 0,
			});
			continue;
		}
		const today = new Date();
		const dayToUpdate = new Date(today);
		switch (idAndDifficulty.difficulty) {
			case "easy":
				dayToUpdate.setDate(today.getDate() + checkIfExist[0].dayIndicator * 2);
				break;
			case "medium":
				dayToUpdate.setDate(today.getDate() + checkIfExist[0].dayIndicator);
				break;
			case "hard":
				dayToUpdate.setDate(today.getDate() + 1);
				break;
			default:
				throw new Error("Invalid difficulty level");
		}
		await LearntWords.updateOne(
			{ userId: uid, wordId: idAndDifficulty.id },
			{
				$set: {
					studyLater: dayToUpdate,
					dayIndicator: checkIfExist[0].dayIndicator + 1,
				},
			}
		);
	}
};
