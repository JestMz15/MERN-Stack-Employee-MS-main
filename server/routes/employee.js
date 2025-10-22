import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import upload from "../utils/multer.js";
import {
  addEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  fetchEmployeesByDepId,
  uploadExpediente,
  addEmployeeDocument,
  deleteEmployeeDocument,
  updateEmployeeStatus,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", authMiddleware, getEmployees);
router.get("/department/:id", authMiddleware, fetchEmployeesByDepId);
router.post("/add", authMiddleware, upload.single("image"), addEmployee);
router.get("/:id", authMiddleware, getEmployee);
router.put("/:id", authMiddleware, updateEmployee);
router.patch("/:id/status", authMiddleware, updateEmployeeStatus);
router.post(
  "/:id/expediente",
  authMiddleware,
  upload.single("expediente"),
  uploadExpediente,
);
router.post(
  "/:id/documents",
  authMiddleware,
  upload.single("document"),
  addEmployeeDocument,
);
router.delete(
  "/:id/documents/:documentId",
  authMiddleware,
  deleteEmployeeDocument,
);

export default router;
