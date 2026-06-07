import express from 'express';
import { contactRules, createContactMessage } from '../controllers/contactController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', contactRules, validate, createContactMessage);

export default router;
