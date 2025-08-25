import { Router } from 'express';
import { getLogin, postLogin, logout } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/logout', authRequired, logout);

export default router;
