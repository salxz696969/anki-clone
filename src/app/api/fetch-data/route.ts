import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { connectToDatabase } from "../mongoose/mongoose";
import { NextRequest } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import LearntWords from "../mongoose/model/learntWordsModel";
import Words from "../mongoose/model/wordsModel";
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
        const uid=decode.uid;
        const userInfo= await fetchUserInfo(uid);
        if(userInfo.length<desiredAmount){
            const pastLearntWords=await LearntWords.find()
            const excessWords=await Words.aggregate([
                {
                    $match: {
                        _id: { $nin: pastLearntWords.map(word => word._id) }
                    }
                },
                { $sample: { size: desiredAmount - userInfo.length } }
            ]);
            return NextResponse.json({wordsForToday:[...userInfo,...excessWords]});
        }
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
        return userData
	} catch (error) {
		console.error("Error fetching user info:", error);
		throw error;
	}
};
