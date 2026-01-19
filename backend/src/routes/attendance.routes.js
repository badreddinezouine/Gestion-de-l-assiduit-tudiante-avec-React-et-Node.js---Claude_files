const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const attendanceController = require('../controllers/attendanceController');

// Routes pour les étudiants
router.get('/my-attendance', protect, authorize('ETUDIANT'), attendanceController.getMyAttendance);
router.post('/absence', protect, authorize('ETUDIANT'), attendanceController.reportAbsence);

// Routes pour les professeurs
router.get('/course/:courseId', protect, authorize('PROFESSEUR'), attendanceController.getCourseAttendance);
router.get('/stats/:courseId', protect, authorize('PROFESSEUR'), attendanceController.getAttendanceStats);

module.exports = router;