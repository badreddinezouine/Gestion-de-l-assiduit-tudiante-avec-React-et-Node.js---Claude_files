const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cne: {
    type: String,
    unique: true,
    sparse: true
  },
  filiere: {
    type: String,
    required: true
  },
  niveau: {
    type: String,
    required: true
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);