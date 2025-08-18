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
            enum: ['image', 'document', 'text'],
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
        uploadedBy: {
            type: String,
            ref: "users",
        },
        resourceType: {
            type: String,
            enum: ['endsem', 'test1', 'test2', 'test3', 'practical', 'quiz', 'written', 'sourced', 'teacher'],
        },
        views: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
            default: 0,
        },
        text: {
            type: String,
        }
    },
    { timestamps: true }
);

export const File = mongoose.model("files", fileSchema);