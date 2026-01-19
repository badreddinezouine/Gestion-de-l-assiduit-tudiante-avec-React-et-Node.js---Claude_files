const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const statisticsController = require('../controllers/statisticsController');

// Routes pour les professeurs
router.get('/dashboard/professor', protect, authorize('PROFESSEUR'), statisticsController.getProfessorDashboard);
router.get('/course/:courseId', protect, authorize('PROFESSEUR'), statisticsController.getCourseStatistics);

// Routes pour les étudiants
router.get('/my-stats', protect, authorize('ETUDIANT'), statisticsController.getMyStatistics);

// Routes publiques (pour tests)
router.get('/recent-activity', statisticsController.getRecentActivity);
router.get('/attendance-trend', statisticsController.getAttendanceTrend);

module.exports = router;