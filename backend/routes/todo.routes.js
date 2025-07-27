import express from 'express';
import { createTodo, deleteTodo, getTodo, getTodos, toggleTaskStatus, updateTodo } from '../controllers/TodoController.js';

const router = express.Router();

router.get('/', getTodos);
router.post('/', createTodo);
router.get('/:id', getTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);
router.patch('/:id/toggle', toggleTaskStatus);

export default router;