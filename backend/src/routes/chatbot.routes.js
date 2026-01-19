const express = require('express');
const router = express.Router();
const { 
  analyzeStudent, 
  reviewDecision, 
  getDecisionHistory,
  getCourseRecommendations 
} = require('../controllers/chatbotController');
const { protect, authorize } = require('../middleware/auth.middleware');

// Analyser un étudiant
router.post('/analyze', protect, authorize('PROFESSEUR'), analyzeStudent);

// Approuver/Rejeter une décision
router.put('/review/:decisionId', protect, authorize('PROFESSEUR'), reviewDecision);

// Historique des décisions
router.get('/history', protect, getDecisionHistory);

// Recommandations pour un cours
router.get('/recommendations/:coursId', protect, authorize('PROFESSEUR'), getCourseRecommendations);

module.exports = router;