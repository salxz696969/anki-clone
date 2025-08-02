import mongoose, { Schema, Document, Model } from "mongoose";

// Define a TypeScript interface for the document
export interface ILearntWord extends Document {
	userId: string;
	wordId: string;
	dayIndicator: number;
	studyLater: Date;
}

// Define the schema
const learntWordsSchema: Schema<ILearntWord> = new Schema({
	userId: { type: String, required: true },
	wordId: { type: String, required: true },
	dayIndicator: { type: Number, required: true },
	studyLater: { type: Date, required: true },
});

// Create the typed model
const LearntWords: Model<ILearntWord> =
	mongoose.models.LearntWords || mongoose.model<ILearntWord>("LearntWords", learntWordsSchema);

export default LearntWords;
