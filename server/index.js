import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import authRouter from './routes/auth.js'
import departmentRouter from './routes/department.js'
import employeeRouter from './routes/employee.js'
import salaryRouter from './routes/salary.js'
import leaveRouter from './routes/leave.js' 
import settingRouter from './routes/setting.js'
import attendanceRouter from './routes/attendance.js'
import dashboardRouter from './routes/dashboard.js'
import connectToDatabase from './db/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, 'public/uploads')
const frontendDistPath = path.resolve(__dirname, '../frontend/dist')
const isProduction = process.env.NODE_ENV === 'production'

connectToDatabase() 
const app = express() 
app.use(cors())
app.use(express.json())
app.use(express.static(uploadsDir))
app.use('/api/auth', authRouter)
app.use('/api/department', departmentRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/salary', salaryRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/setting', settingRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/dashboard', dashboardRouter)

if (isProduction && fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath))
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            return next()
        }
        res.sendFile(path.join(frontendDistPath, 'index.html'))
    })
}

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`)
})
