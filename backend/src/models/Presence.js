const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema(
  {
    etudiantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    sessionCoursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SessionCours',
      default: null,
      index: true,
    },
    statut: {
      type: String,
      enum: ['PRESENT', 'RETARD', 'ABSENT'],
      required: true,
      default: 'PRESENT',
    },
    dateScan: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ['QR', 'MANUAL'],
      default: 'QR',
    },
  },
  {
    timestamps: true,
  }
);

// Empêche un étudiant d'avoir 2 présences pour la même séance
presenceSchema.index(
  { etudiantId: 1, sessionCoursId: 1 },
  {
    unique: true,
    partialFilterExpression: { sessionCoursId: { $type: 'objectId' } },
  }
);

module.exports = mongoose.model('Presence', presenceSchema);