import { Todo } from "../models/TodoModel.js";
import mongoose from 'mongoose';

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json({ success: true, todos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { user, title, description, category, priority, dueDate, time, recurrence, notes } = req.body;

    if (!title?.trim() || !category?.trim() || !recurrence) {
        return res.status(400).json({ success: false, message: "Missing required fields: title, category, recurrence." });
    }
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ success: false, message: "Invalid dueDate format." });
    }

    const newTodo = new Todo({
      user: user || null,
      title,
      description: description || "",
      category,
      priority: priority || "Medium",
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      time: time || "",
      recurrence,
      notes: notes || "",
      completedDates: [],
    });

    await newTodo.save();
    res.status(201).json({ success: true, todo: newTodo });
  } catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.status(200).json({ success: true, todo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, time, recurrence, notes, completedDates } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (time !== undefined) updateData.time = time;
    if (recurrence) updateData.recurrence = recurrence;
    if (notes !== undefined) updateData.notes = notes;
    if (Array.isArray(completedDates)) {
        updateData.completedDates = completedDates.map(date => new Date(date).toISOString().split('T')[0]);
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    res.status(200).json({ success: true, todo: updatedTodo });
  } catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.status(200).json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing user ID' });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date); 

    if (targetDate.getTime() > startOfToday.getTime()) {
      return res.status(400).json({ success: false, message: "Cannot modify a task for a future date." });
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    if (todo.user && todo.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this task' });
    }

    const dateToToggle = new Date(date).toISOString().split('T')[0];
    const completedDatesSet = new Set(todo.completedDates || []);

    let action;
    if (completedDatesSet.has(dateToToggle)) {
      completedDatesSet.delete(dateToToggle);
      action = 'unmarked';
    } else {
      completedDatesSet.add(dateToToggle);
      action = 'marked';
    }

    todo.completedDates = Array.from(completedDatesSet);

    await todo.save();
    res.status(200).json({ success: true, todo, action });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};