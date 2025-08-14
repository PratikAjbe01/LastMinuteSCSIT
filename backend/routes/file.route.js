import express from 'express'
import { deleteFile, fetchAdminFiles, fetchAdminsFiles, fetchAllFiles, fetchfileById, fetchFilesCourseAndSemester, proxyPdf, updateFile, uploadFile } from '../controllers/file.controller.js';

const router = express.Router();

router.post('/upload', uploadFile);
router.post('/fetchCourseAndSemester', fetchFilesCourseAndSemester);
router.get('/proxy', proxyPdf);
router.get('/allfiles', fetchAllFiles);
router.post('/adminfiles', fetchAdminFiles);
router.post('/getadminsfiles', fetchAdminsFiles);
router.post('/getfilebyid', fetchfileById)
router.put('/update', updateFile);
router.post('/delete', deleteFile);

export default router;
