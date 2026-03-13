const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    sessionCoursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SessionCours',
      required: true,
      index: true,
    },
    expiration: {
      type: Date,
      required: true,
      index: true,
    },
    scans: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Supprime automatiquement le QR après expiration
qrCodeSchema.index({ expiration: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('QRCode', qrCodeSchema);