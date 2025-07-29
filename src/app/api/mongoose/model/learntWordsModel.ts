import { Schema } from "mongoose";
import mongoose from "mongoose";
const learntWordsModel = new Schema({
	userId: String,
	wordId: String,
	dayIndicator: Number,
	studyLater: Date,
});
const LearntWords = mongoose.models.LearntWords || mongoose.model("LearntWords", learntWordsModel);

export default LearntWords;
