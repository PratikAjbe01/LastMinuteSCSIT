import express from 'express'
import multer from 'multer';
import { deleteFile, fetchAdminFiles, fetchAllFiles, fetchFilesCourseAndSemester, proxyPdf, updateFile, uploadFile } from '../controllers/file.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadFile);
router.post('/fetchCourseAndSemester', fetchFilesCourseAndSemester);
router.get('/proxy', proxyPdf);
router.get('/allfiles', fetchAllFiles);
router.post('/adminfiles', fetchAdminFiles);
router.put('/update', updateFile);
router.post('/delete', deleteFile);

export default router;
