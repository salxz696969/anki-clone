import { Schema } from "mongoose";
import mongoose from "mongoose";
const wordsModel= new Schema({
    kanji: String,
    kana: String,
    english: String,
    sentence: String,
    translation: String,
})

const Words = mongoose.models.Words || mongoose.model("Words", wordsModel);

export default Words;