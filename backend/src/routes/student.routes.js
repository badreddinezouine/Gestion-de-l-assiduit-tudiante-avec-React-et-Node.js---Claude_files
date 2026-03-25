const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, checkRole } = require('../middleware/auth');

// Middleware étudiant
const student = [protect, checkRole('ETUDIANT')];

// ✅ Mes notes
router.get('/my-grades', ...student, studentController.getMyGrades);

// ✅ Mon calendrier (sessions de mes cours)
router.get('/my-calendar', ...student, studentController.getMyCalendar);

// ✅ Mes absences/présences
router.get('/my-attendance', ...student, studentController.getMyAttendance);

module.exports = router;