import express from 'express'
import { deleteAdminsFile, deleteFile, fetchAdminFiles, fetchAdminsFiles, fetchAllFiles, fetchAllFilesByViews, fetchfileById, fetchFilesCourseAndSemester, getLeaderboard, getLeaderboardUserStats, increaseFileShares, increaseFileViews, proxyPdf, updateAdminFile, updateFile, uploadFile } from '../controllers/file.controller.js';

const router = express.Router();

router.post('/upload', uploadFile);
router.post('/fetchCourseAndSemester', fetchFilesCourseAndSemester);
router.get('/proxy', proxyPdf);
router.get('/allfiles', fetchAllFiles);
router.get('/allfilesbyviews', fetchAllFilesByViews);
router.post('/adminfiles', fetchAdminFiles);
router.post('/getadminsfiles', fetchAdminsFiles);
router.post('/getfilebyid', fetchfileById)
router.put('/update', updateFile);
router.post('/delete', deleteFile);
router.post('/deleteadminsfile', deleteAdminsFile);
router.put('/updateAdminFile', updateAdminFile);
router.put('/increasefileviews', increaseFileViews);
router.put('/increasefileshares', increaseFileShares);
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/user-stats/:userId', getLeaderboardUserStats);

export default router;
