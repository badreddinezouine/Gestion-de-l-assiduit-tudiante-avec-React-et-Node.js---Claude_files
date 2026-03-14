const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  professeurId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Professor',
    required: true,
    index:    true,
  },
  coursId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Course',
    required: true,
    index:    true,
  },
  etudiantId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  typeEvaluation: {
    type:    String,
    enum:    ['EXAMEN', 'TP', 'PARTICIPATION'],
    default: 'EXAMEN',
  },
  note: {
    type: Number,
    min:  0,
    max:  20,
    default: null,
  },
  typeParticipation: {
    type:    String,
    enum:    ['ACTIVE', 'MOYENNE', 'FAIBLE'],
    default: 'ACTIVE',
  },
  commentaire: {
    type:    String,
    default: '',
    trim:    true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Grade', gradeSchema);