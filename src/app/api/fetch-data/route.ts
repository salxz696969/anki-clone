import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { connectToDatabase } from "../mongoose/mongoose";
import { NextRequest } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import LearntWords from "../mongoose/model/learntWordsModel";
import Words from "../mongoose/model/wordsModel";
import { Redis } from "@upstash/redis";
import mongoose from "mongoose";

const redis = Redis.fromEnv();

// ✅ Fisher–Yates shuffle (uniform random)
function shuffle<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export const POST = async (req: NextRequest) => {
	try {
		await connectToDatabase();
		const body = await req.json();
		const desiredAmount = parseInt(body.desiredAmount);

		// 🔑 Verify token
		const token = req.headers.get("authorization")?.split("Bearer ")[1];
		if (!token)
			return NextResponse.json({ message: "missing token" }, { status: 401 });

		const decode = await adminAuth.verifyIdToken(token);
		const uid = decode.uid;

		// Get user info
		const userInfo = await fetchUserInfo(uid, desiredAmount);

		// Redis lookup
		const redisCalls = userInfo.map((word) =>
			redis.hgetall(`word:${word.wordId}`).then((obj) => ({
				...obj,
				_id: word.wordId,
			}))
		);

		const pastLearntWordsRaw = await Promise.all(redisCalls);
		let pastLearntWords = pastLearntWordsRaw.filter(
			(obj) => obj && Object.keys(obj).length > 0
		);

		// If Redis empty → pull from DB and cache
		if (pastLearntWords.length === 0) {
			pastLearntWords = await Words.find({
				_id: { $in: userInfo.map((word) => word.wordId) },
			});
			await Promise.all(
				pastLearntWords.map((word: any) =>
					redis.hset(`word:${word._id}`, {
						kanji: word.kanji,
						kana: word.kana,
						english: word.english,
						sentence: word.sentence,
						translation: word.translation,
					})
				)
			);
		}

		// Already learnt word ids
		const pastWordsForUser = await LearntWords.find({ userId: uid });
		const learntWordIds = pastWordsForUser.map(
			(word) => new mongoose.Types.ObjectId(word.wordId)
		);

		// Take a portion of past learnt words
		const pastLearntWordsTrimmed = pastLearntWords.slice(
			0,
			desiredAmount * 0.4
		);

		// Grab new random words
		const excessWords = await Words.aggregate([
			{
				$match: {
					_id: { $nin: learntWordIds },
				},
			},
			{ $sample: { size: desiredAmount - pastLearntWordsTrimmed.length } },
		]);

		let allWords: any[] = [];

		if (excessWords.length + pastLearntWordsTrimmed.length < desiredAmount) {
			const addMoreLearntWords = pastLearntWords.slice(
				0,
				desiredAmount - excessWords.length
			);
			allWords = [...addMoreLearntWords, ...excessWords];
		} else {
			allWords = [...pastLearntWordsTrimmed, ...excessWords];
		}

		// ✅ Proper shuffle before sending
		const shuffledWords = shuffle(allWords);

		return NextResponse.json({ wordsForToday: shuffledWords });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
};

const fetchUserInfo = async (uid: string, desiredAmount: number) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const limit = Math.ceil(desiredAmount);
		const userData = await LearntWords.find({
			userId: uid,
			studyLater: { $lt: today },
		}).limit(limit);
		return userData;
	} catch (error) {
		console.error("Error fetching user info:", error);
		throw error;
	}
};