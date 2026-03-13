const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendanceController');
const { protect, checkRole } = require('../middleware/auth');

// ETUDIANT : mon historique
router.get('/my-attendance', protect, checkRole('ETUDIANT'), attendanceController.getMyAttendance);

// PROFESSEUR : présences d’un cours
router.get('/course/:courseId', protect, checkRole('PROFESSEUR'), attendanceController.getCourseAttendance);

// PROFESSEUR : ajout manuel
router.post('/manual', protect, checkRole('PROFESSEUR'), attendanceController.addManualAttendance);

module.exports = router;