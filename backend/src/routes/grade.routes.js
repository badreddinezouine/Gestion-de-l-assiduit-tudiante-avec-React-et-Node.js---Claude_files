const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/gradeController');
const { protect, checkRole } = require('../middleware/auth');

const prof = [protect, checkRole('PROFESSEUR')];

router.get   ('/my',                              ...prof, ctrl.getMyGrades);
router.get   ('/students-for-course/:courseId',   ...prof, ctrl.getStudentsForCourse);
router.post  ('/',                                ...prof, ctrl.createGrade);
router.delete('/:id',                             ...prof, ctrl.deleteGrade);

module.exports = router;