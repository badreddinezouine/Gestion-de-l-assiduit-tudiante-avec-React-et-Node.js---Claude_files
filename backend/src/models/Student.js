const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  numeroEtudiant: {
    type: String,
    required: true,
    unique: true
  },
  niveau: {
    type: String,
    required: true,
    enum: ['LICENCE1', 'LICENCE2', 'LICENCE3', 'MASTER1', 'MASTER2']
  },
  filiere: {
    type: String,
    required: true
  },
  dateNaissance: Date,
  groupe: String,
  coursInscrits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);