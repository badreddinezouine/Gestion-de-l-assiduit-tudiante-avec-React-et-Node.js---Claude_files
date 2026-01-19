const mongoose = require('mongoose');

const adaptationSchema = new mongoose.Schema({
  etudiantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  coursId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sessionCoursId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCours'
  },
  note: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'C-'],
    required: true
  },
  commentaire: String,
  dateEvaluation: {
    type: Date,
    default: Date.now
  },
  typeParticipation: {
    type: String,
    enum: ['QUESTION', 'REPONSE', 'PRESENTATION', 'EXERCICE', 'DEVOIR'],
    default: 'REPONSE'
  },
  points: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Calculer le score numérique
adaptationSchema.methods.getScore = function() {
  const scores = {
    'A+': 4.0, 'A': 3.7,
    'B+': 3.3, 'B': 3.0,
    'C+': 2.7, 'C': 2.3, 'C-': 2.0
  };
  return scores[this.note] || 0;
};

module.exports = mongoose.model('Adaptation', adaptationSchema);