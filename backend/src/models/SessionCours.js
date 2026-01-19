const mongoose = require('mongoose');

const sessionCoursSchema = new mongoose.Schema({
  coursId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  salleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salle'
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['COURS', 'TD', 'TP', 'EXAMEN'],
    default: 'COURS'
  },
  statut: {
    type: String,
    enum: ['PLANIFIÉ', 'EN_COURS', 'TERMINÉ', 'ANNULÉ'],
    default: 'PLANIFIÉ'
  },
  theme: String,
  objectifs: [String],
  etudiantsPresents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  qrCodeGenere: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour les sessions à venir
sessionCoursSchema.index({ dateDebut: 1, statut: 1 });

module.exports = mongoose.model('SessionCours', sessionCoursSchema);