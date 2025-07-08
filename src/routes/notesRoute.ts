import express from 'express';
import { createNotes, deleteNote, getNotes, upNotes } from '../controllers/notesController';


const router = express.Router();

router.post('/create-notes/', createNotes);
router.get('/all-notes/', getNotes);
router.delete('/delete/:id', deleteNote);         // DELETE route to delete a note by ID
router.put('/notes/:id', upNotes); // Edit note by ID

export default router;
