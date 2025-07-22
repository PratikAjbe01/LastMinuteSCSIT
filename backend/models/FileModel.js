import mongoose from "mongoose";
import { type } from "os";

const fileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['image', 'document'],
        },
        course: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },
        isFree: {
            type: String,
            enum: ['free', 'paid'],
            default: 'free'
        },
        fileUrl: {
            type: String,
            required: true,
        },
        contentType: {
            type: String,
        },
        category: {
            type: String,
            required: true,
            enum: ['notes', 'paper', 'syllabus'],
        },
    },
    { timestamps: true }
);

export const File = mongoose.model("files", fileSchema);
