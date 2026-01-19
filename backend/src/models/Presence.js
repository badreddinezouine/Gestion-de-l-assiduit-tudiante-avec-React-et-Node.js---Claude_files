const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
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
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode'
  },
  dateScan: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['PRESENT', 'RETARD', 'ABSENT'],
    default: 'PRESENT'
  },
  latitude: Number,
  longitude: Number,
  heureScan: {
    type: String
  },
  ipAdresse: String
}, {
  timestamps: true
});

// Index composé pour éviter les doublons
presenceSchema.index({ etudiantId: 1, sessionCoursId: 1 }, { unique: true });

// Middleware pour définir l'heure du scan
presenceSchema.pre('save', function(next) {
  if (!this.heureScan) {
    this.heureScan = new Date().toLocaleTimeString('fr-FR');
  }
  next();
});

module.exports = mongoose.model('Presence', presenceSchema);