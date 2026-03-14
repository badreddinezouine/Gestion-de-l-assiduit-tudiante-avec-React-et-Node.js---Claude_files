const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  utilisateurId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true
  },
  numeroEtudiant: {
    type:   String,
    unique: true,
    sparse: true  // ✅ unique mais pas required (généré auto)
  },
  niveau: {
    type:    String,
    enum:    ['LICENCE1', 'LICENCE2', 'LICENCE3', 'MASTER1', 'MASTER2'],
    required: [true, 'Le niveau est obligatoire'], // ✅ required
  },
  filiere: {
    type:     String,
    required: [true, 'La filière est obligatoire'], // ✅ required
    trim:     true
  },
  dateNaissance: {
    type:    Date,
    default: null
  },
  groupe: {
    type:    String,
    default: ''
  },
  coursInscrits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Course'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);