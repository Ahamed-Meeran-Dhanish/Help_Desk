import express from 'express';
import { getNotes, addNote, deleteNote } from './note.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .get(getNotes)
    .post(addNote);

// Add delete route
router
    .route('/:noteId')
    .delete(deleteNote);

export default router;
