import mongoose, { Schema, Document, Model } from "mongoose";

// Define a TypeScript interface for the document
export interface IWord extends Document {
	kanji: string;
	kana: string;
	english: string;
	sentence: string;
	translation: string;
}

// Define the schema
const wordsSchema: Schema<IWord> = new Schema({
	kanji: { type: String, required: true },
	kana: { type: String, required: true },
	english: { type: String, required: true },
	sentence: { type: String, required: true },
	translation: { type: String, required: true },
});

// Create the typed model
const Words: Model<IWord> = mongoose.models.Words || mongoose.model<IWord>("Words", wordsSchema);

export default Words;
