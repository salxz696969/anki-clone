import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { connectToDatabase } from "../mongoose/mongoose";
import { NextRequest } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import LearntWords from "../mongoose/model/learntWordsModel";
import Words from "../mongoose/model/wordsModel";
import { Redis } from "@upstash/redis";
import mongoose from "mongoose";
const redis = Redis.fromEnv();
export const POST = async (req: NextRequest) => {
	try {
		await connectToDatabase();
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
		const userInfo = await fetchUserInfo(uid);
		let pastLearntWords = [];
		const redisCalls = userInfo.map((word) =>
			redis.hgetall(`word:${word.wordId}`).then((obj) => ({
				...obj,
				_id: word.wordId, // Add _id key from wordId
			}))
		);
		const pastLearntWordsRaw = await Promise.all(redisCalls);
		pastLearntWords = pastLearntWordsRaw.filter((obj) => obj && Object.keys(obj).length > 0);

		if (pastLearntWords.length === 0) {
			pastLearntWords = await Words.find({ _id: { $in: userInfo.map((word) => word.wordId) } });
		}
		if (userInfo.length < desiredAmount) {
			const pastWordsForUser = await LearntWords.find({ userId: uid });
			const learntWordIds = pastWordsForUser.map((word) => new mongoose.Types.ObjectId(word.wordId));
			const excessWords = await Words.aggregate([
				{
					$match: {
						_id: { $nin: learntWordIds },
					},
				},
				{ $sample: { size: desiredAmount - userInfo.length } },
			]);
			return NextResponse.json({ wordsForToday: [...pastLearntWords, ...excessWords] });
		}
		return NextResponse.json({ wordsForToday: pastLearntWords });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
};

const fetchUserInfo = async (uid: string) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const userData = await LearntWords.find({
			userId: uid,
			studyLater: { $lt: today },
		});
		return userData;
	} catch (error) {
		console.error("Error fetching user info:", error);
		throw error;
	}
};
