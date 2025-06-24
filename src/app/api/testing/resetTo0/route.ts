import { adminDB } from "@/firebase/firebaseAdmin";
import { NextResponse } from "next/server";
export const PATCH = async () => {
	try {
		const idAndDifficultyArr = [
			{ id: "kMEgfioTSIDUn3bevA2K", difficulty: "easy" },
			{ id: "kXt7en3nHAQ5Mq4dN1XD", difficulty: "hard" },
			{ id: "kdoovyapzE5rX0kSrlPL", difficulty: "hard" },
			{ id: "ksbOIzhUg0K6JLqUpgno", difficulty: "hard" },
			{ id: "kzONobkHbprqzn2wI5uB", difficulty: "hard" },
			{ id: "l4J1rBD4y5s9npNicSbh", difficulty: "hard" },
			{ id: "l4NLraygDd5SmGMHYvdA", difficulty: "hard" },
			{ id: "l6toTvFe7Vh0EuGTImvs", difficulty: "hard" },
			{ id: "l7SgIjO1us5A1pEsIotC", difficulty: "easy" },
			{ id: "l7y3JiAybV9KJFAmR41G", difficulty: "hard" },
		];
		// const idAndDifficultyArr = [
		// 	{ id: "kMEgfioTSIDUn3bevA2K", difficulty: "easy" },
		// 	{ id: "l7SgIjO1us5A1pEsIotC", difficulty: "easy" },
		// 	{ id: "kzONobkHbprqzn2wI5uB", difficulty: "hard" },
		// 	{ id: "l4J1rBD4y5s9npNicSbh", difficulty: "hard" },
		// 	{ id: "l4NLraygDd5SmGMHYvdA", difficulty: "hard" },
		// 	{ id: "l6toTvFe7Vh0EuGTImvs", difficulty: "hard" },
		// 	{ id: "l7y3JiAybV9KJFAmR41G", difficulty: "hard" },
		// 	{ id: "kdoovyapzE5rX0kSrlPL", difficulty: "hard" },
		// 	{ id: "ksbOIzhUg0K6JLqUpgno", difficulty: "hard" },
		// 	{ id: "kXt7en3nHAQ5Mq4dN1XD", difficulty: "hard" },
		// ];
		const batch = adminDB.batch();
		for (const idAndDifficulty of idAndDifficultyArr) {
			const ref = adminDB
				.collection("users")
				.doc("N8Xr64TZ4GbNqDvevdT7mPQY0N52")
				.collection("learntWords")
				.doc(idAndDifficulty.id);
			const snap = await ref.get();
			if (!snap.exists) {
				console.error(
					`Document not found for id: ${idAndDifficulty.id}`
				);
				continue; // Skip if document doesn't exist
			}
			const today = new Date();	
			batch.update(ref, {
				dayIndicator: 0,
				studyLater: today,
			});
		}
        await batch.commit();
        NextResponse.json({ status: 200, message: "Batch update successful" });
	} catch (error) {
		console.error("Error in PATCH request:", error);
	}
};
