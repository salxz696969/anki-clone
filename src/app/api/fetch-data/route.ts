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
		// Step 1: Connect to MongoDB
		await connectToDatabase();

		// Step 2: Parse request body and get desired amount of words to study today
		const body = await req.json();
		const desiredAmount = parseInt(body.desiredAmount);

		// Step 3: Get and verify user token from request headers
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

		// Step 4: Decode token to get user id
		const decode = await adminAuth.verifyIdToken(token);
		const uid = decode.uid;

		// Step 5: Fetch user's learnt words for today (up to desiredAmount)
		// These are words the user should review today, based on their spaced repetition schedule
		const userInfo = await fetchUserInfo(uid, desiredAmount);

		// Step 6: Try to fetch word details from Redis for each learnt word
		// This is a performance optimization to avoid hitting MongoDB for every word
		let pastLearntWords = [];
		const redisCalls = userInfo.map((word) =>
			redis.hgetall(`word:${word.wordId}`).then((obj) => ({
				...obj,
				_id: word.wordId, // Add _id key from wordId for frontend compatibility
			}))
		);
		const pastLearntWordsRaw = await Promise.all(redisCalls);
		// Only keep words that exist in Redis (i.e., have been cached)
		pastLearntWords = pastLearntWordsRaw.filter((obj) => obj && Object.keys(obj).length > 0);

		// Step 7: If Redis didn't have any words, fallback to MongoDB
		// Also, cache these words in Redis for future requests
		if (pastLearntWords.length === 0) {
			pastLearntWords = await Words.find({ _id: { $in: userInfo.map((word) => word.wordId) } });
			pastLearntWords.forEach(async (word) => {
				await redis.hset(`word:${word._id}`, {
					kanji: word.kanji,
					kana: word.kana,
					english: word.english,
					sentence: word.sentence,
					translation: word.translation,
				});
			});
		}

		// Step 8: If user has not learnt enough words, sample new words from MongoDB
		// This ensures the user gets a full set of words to study today
		// Get all words the user has already learnt
		const pastWordsForUser = await LearntWords.find({ userId: uid });
		// Convert learnt word ids to ObjectId for MongoDB query
		const learntWordIds = pastWordsForUser.map((word) => new mongoose.Types.ObjectId(word.wordId));
		// Take a portion of learnt words (e.g., 40%) and fill the rest with new words
		const pastLearntWordsTrimmed = pastLearntWords.slice(0, desiredAmount * 0.4);
		// Sample new words the user hasn't seen yet
		const excessWords = await Words.aggregate([
			{
				$match: {
					_id: { $nin: learntWordIds },
				},
			},
			{ $sample: { size: desiredAmount - pastLearntWordsTrimmed.length } },
		]);

		// Step 9: If not enough new words, fill with more learnt words
		if (excessWords.length + pastLearntWordsTrimmed.length < desiredAmount) {
			const addMoreLearntWords = pastLearntWords.slice(0, desiredAmount - excessWords.length);
			const allWords = [...addMoreLearntWords, ...excessWords];
			// Shuffle the final list for randomness
			const shuffledWords = allWords.sort(() => Math.random() - 0.5);
			return NextResponse.json({ wordsForToday: shuffledWords });
		}

		// Step 10: Return a shuffled list of words (learnt + new)
		const allWords = [...pastLearntWords, ...excessWords];
		const shuffledWords = allWords.sort(() => Math.random() - 0.5);
		return NextResponse.json({ wordsForToday: shuffledWords });
	} catch (error) {
		// Error handling: return error message and status
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
};

/**
 * Fetch user's learnt words for today, up to the desired amount
 * @param uid - User ID
 * @param desiredAmount - Number of words to fetch
 * @returns Array of learnt word documents
 */
const fetchUserInfo = async (uid: string, desiredAmount: number) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const limit = Math.ceil(desiredAmount);
		// Find words the user should study today (those scheduled for review)
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
