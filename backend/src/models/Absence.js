const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
  etudiantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  sessionCoursId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCours',
    required: true
  },
  motif: {
    type: String,
    required: true
  },
  justifiee: {
    type: Boolean,
    default: false
  },
  documentJustificatif: {
    type: String,
    default: null
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  valideePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  },
  dateValidation: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Absence', absenceSchema);