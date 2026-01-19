const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  motDePasse: {
    type: String,
    required: true,
    minlength: 8
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['PROFESSEUR', 'ETUDIANT', 'ADMIN'],
    required: true
  },
  telephone: String,
  actif: {
    type: Boolean,
    default: true
  },
  dateInscription: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

// Méthode pour obtenir le nom complet
userSchema.methods.getFullName = function() {
  return `${this.prenom} ${this.nom}`;
};

module.exports = mongoose.model('User', userSchema);