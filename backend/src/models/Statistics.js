const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  etudiantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  coursId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  tauxPresence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  moyenneNotes: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  scoreAdaptation: {
    type: Number,
    min: 0,
    max: 4,
    default: 0
  },
  nombreAbsences: {
    type: Number,
    default: 0
  },
  nombreRetards: {
    type: Number,
    default: 0
  },
  nombreAbsencesJustifiees: {
    type: Number,
    default: 0
  },
  dernierCalcul: {
    type: Date,
    default: Date.now
  },
  tendance: {
    type: String,
    enum: ['AMÉLIORATION', 'STABLE', 'DÉGRADATION'],
    default: 'STABLE'
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
statisticsSchema.index({ etudiantId: 1, coursId: 1 }, { unique: true });

module.exports = mongoose.model('Statistics', statisticsSchema);