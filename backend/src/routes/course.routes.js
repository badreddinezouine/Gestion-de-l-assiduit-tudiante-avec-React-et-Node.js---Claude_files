const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/courseController');
const { protect, checkRole } = require('../middleware/auth');

const prof = [protect, checkRole('PROFESSEUR')];

router.get   ('/my',                       ...prof, ctrl.getMyCourses);
router.get   ('/students',                 ...prof, ctrl.getAllStudents);
router.get   ('/filieres',                 ...prof, ctrl.getFilieres);         // ✅
router.post  ('/',                         ...prof, ctrl.createCourse);
router.delete('/:id',                      ...prof, ctrl.deleteCourse);
router.post  ('/:id/sessions',             ...prof, ctrl.addSession);
router.delete('/:id/sessions/:sessionId',  ...prof, ctrl.deleteSession);
router.put   ('/:id/enroll',               ...prof, ctrl.enrollStudents);
router.post  ('/:id/enroll-filiere',       ...prof, ctrl.enrollByFiliere);     // ✅

module.exports = router;