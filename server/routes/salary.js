import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import {
  addSalary,
  getSalary,
  getPayrollSummary,
} from "../controllers/salaryController.js";

const router = express.Router();

router.post("/add", authMiddleware, addSalary);
router.get("/payroll/summary", authMiddleware, getPayrollSummary);
router.get("/:id/:role", authMiddleware, getSalary);

export default router;
