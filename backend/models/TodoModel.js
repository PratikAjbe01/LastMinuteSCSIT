import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100 
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    dueDate: {
        type: Date,
        required: true 
    },
    time: {
        type: String,
        trim: true
    },
    recurrence: {
        type: String,
        enum: ['None', 'Daily', 'Weekly', 'Monthly'],
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxLength: 1000 
    },
    completedDates: {
        type: [String],
        default: []
    }
}, { timestamps: true });

export const Todo = mongoose.model('Todo', todoSchema);