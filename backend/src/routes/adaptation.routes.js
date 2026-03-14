const express = require('express');
const router  = express.Router();
const adaptationController = require('../controllers/adaptationController');
const { protect, checkRole } = require('../middleware/auth');

// PROFESSEUR
router.post('/create',
  protect, checkRole('PROFESSEUR'),
  adaptationController.createAdaptation
);
router.get('/student/:studentId',
  protect, checkRole('PROFESSEUR'),
  adaptationController.getStudentAdaptations
);

// ETUDIANT
router.get('/my',
  protect, checkRole('ETUDIANT'),
  adaptationController.getMyAdaptations
);

module.exports = router;