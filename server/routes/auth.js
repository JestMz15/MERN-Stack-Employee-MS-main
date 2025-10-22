import express from 'express'
import { login, verify, updateProfile } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddlware.js'
import upload from '../utils/multer.js'

const router = express.Router()

router.post('/login', login)
router.get('/verify', authMiddleware, verify)
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile)

export default router;
