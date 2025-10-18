import express from 'express'
import { login, verify, updateProfile } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddlware.js'

const router = express.Router()

router.post('/login', login)
router.get('/verify', authMiddleware, verify)
router.put('/profile', authMiddleware, updateProfile)

export default router;
