import express from "express";
import { deleteAttendance, getAttendance, resetSubjectAttendance, updateAttendance, validateData } from "../controllers/AttendanceController.js";

const router = express.Router();

router.get("/:course/:semester", getAttendance);
router.post("/:course/:semester", updateAttendance);
router.delete("/:course/:semester", deleteAttendance);
router.post("/validate", validateData);
router.delete("/:course/:semester/subject/:subjectName", resetSubjectAttendance);

export default router;