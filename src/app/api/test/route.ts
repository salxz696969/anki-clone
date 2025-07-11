import { adminDB } from "@/firebase/firebaseAdmin";
import {  NextResponse } from "next/server";

// Assuming adminDB is already imported and initialized
// import { adminDB } from "@/lib/firebase-admin"; 

const fetchUserInfo = async (
): Promise<{ userLearntIds: string[]; count: number }> => {
    try {
        const userRef =  adminDB
            .collection("users")
            .doc("N8Xr64TZ4GbNqDvevdT7mPQY0N52")
            .collection("learntWords");
        const today = new Date();
        const userQuery = userRef.where("studyLater", "<", today);
        const userSnapshot = await userQuery.get();
        const countSnapshot = await userRef.count().get();
        const count = countSnapshot.data().count || 0;
        const userLearntIds = userSnapshot.docs.map((doc) => doc.id);
        return { userLearntIds, count };
    } catch (error) {
        throw error;
    }
};

export async function GET() {
    try {
        const data = await fetchUserInfo();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

// export async function GET() {
//     try {
//         const userRef = adminDB
//             .collection("users")
//             .doc("N8Xr64TZ4GbNqDvevdT7mPQY0N52")
//             .collection("learntWords");
//         const snapshot = await userRef.get();
//         const docs = snapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//         }));
//         return NextResponse.json({ docs });
//     } catch (error) {
//         return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
//     }
// }