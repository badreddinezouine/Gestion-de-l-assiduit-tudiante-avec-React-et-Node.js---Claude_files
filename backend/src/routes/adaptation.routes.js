const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const adaptationController = require('../controllers/adaptationController');

// Routes pour les professeurs
router.post('/', protect, authorize('PROFESSEUR'), adaptationController.createAdaptation);
router.get('/student/:studentId', protect, authorize('PROFESSEUR'), adaptationController.getStudentAdaptations);
router.get('/course/:courseId', protect, authorize('PROFESSEUR'), adaptationController.getCourseAdaptations);

// Routes pour les étudiants
router.get('/my-adaptations', protect, authorize('ETUDIANT'), adaptationController.getMyAdaptations);

module.exports = router;