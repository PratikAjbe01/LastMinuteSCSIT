import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: String,
            enum: ['Good', 'Outstanding'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        username: {
            type: String,
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        isUserAdmin: {
            type: Boolean,
            default: false,
        },
        course:{
            type: String,
        },
        semester: {
            type: Number,
        },
        show: {
            type: String,
            enum: ['yes', 'no'],
            default: "no",
        },
        userProfile:{
            type: String
        }
    },
    { timestamps: true }
);

export const Testimonials = mongoose.model("Testimonials", testimonialSchema);