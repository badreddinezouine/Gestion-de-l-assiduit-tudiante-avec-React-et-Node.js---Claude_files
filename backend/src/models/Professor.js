const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialite: {
    type: String,
    required: true
  },
  departement: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    enum: ['MAITRE_ASSISTANT', 'PROFESSEUR', 'PROFESSEUR_AGRÉGÉ', 'PROFESSEUR_CERTIFIÉ'],
    default: 'MAITRE_ASSISTANT'
  },
  coursEnseignes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Professor', professorSchema);