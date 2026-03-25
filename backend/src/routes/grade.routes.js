const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { protect, checkRole } = require('../middleware/auth');

// Middleware professeur
const prof = [protect, checkRole('PROFESSEUR')];

// Routes
router.post('/', ...prof, gradeController.createGrade);
router.get('/my', ...prof, gradeController.getMyGrades);
router.delete('/:id', ...prof, gradeController.deleteGrade);
router.get('/students-for-course/:courseId', ...prof, gradeController.getStudentsForCourse);

module.exports = router;