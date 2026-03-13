const express = require('express');
const router = express.Router();

const statisticsController = require('../controllers/statisticsController');
const { protect, checkRole } = require('../middleware/auth');

router.get('/dashboard/professor', protect, checkRole('PROFESSEUR'), statisticsController.dashboardProfessor);
router.get('/recent-activity', protect, checkRole('PROFESSEUR'), statisticsController.recentActivity);
router.get('/attendance-trend', protect, checkRole('PROFESSEUR'), statisticsController.attendanceTrend);

module.exports = router;