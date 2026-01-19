const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  professeurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true
  },
  intitule: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  niveau: {
    type: String,
    required: true
  },
  filiere: {
    type: String,
    required: true
  },
  etudiantsInscrits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  nombreSessions: {
    type: Number,
    default: 0
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);