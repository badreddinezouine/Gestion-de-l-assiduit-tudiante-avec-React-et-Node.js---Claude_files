const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  sessionCoursId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCours',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  dateGeneration: {
    type: Date,
    default: Date.now
  },
  dateExpiration: {
    type: Date,
    required: true
  },
  dureeValidite: {
    type: Number,
    default: 10
  },
  actif: {
    type: Boolean,
    default: true
  },
  nombreScans: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index TTL pour expiration automatique
qrCodeSchema.index({ dateExpiration: 1 }, { expireAfterSeconds: 0 });

// Méthode pour vérifier la validité
qrCodeSchema.methods.isValide = function() {
  return this.actif && new Date() < this.dateExpiration;
};

// Méthode pour incrémenter les scans
qrCodeSchema.methods.incrementScans = function() {
  this.nombreScans += 1;
  return this.save();
};

module.exports = mongoose.model('QRCode', qrCodeSchema);