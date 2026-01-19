const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
  etudiantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  coursId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  typeDecision: {
    type: String,
    enum: ['RATTRAPAGE', 'REFUS', 'REVUE_MANUELLE', 'ALERTE', 'CONSEIL'],
    required: true
  },
  recommandation: {
    type: String,
    required: true
  },
  justification: {
    type: String,
    required: true
  },
  scoreConfiance: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  donneesAnalysees: {
    tauxPresence: Number,
    moyenneNotes: Number,
    scoreAdaptation: Number,
    nombreAbsences: Number,
    nombreAbsencesJustifiees: Number,
    nombreRetards: Number
  },
  approuvePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  },
  statut: {
    type: String,
    enum: ['EN_ATTENTE', 'APPROUVE', 'REJETE', 'APPLIQUÉ'],
    default: 'EN_ATTENTE'
  },
  dateDecision: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatBotDecision', decisionSchema);