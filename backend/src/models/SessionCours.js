const mongoose = require('mongoose');

const sessionCoursSchema = new mongoose.Schema(
  {
    // ✅ NOUVEAU : référence string pour les IDs venant du localStorage
    sessionRef: {
      type:    String,
      default: null,
      index:   true,   // index pour findOne({ sessionRef }) rapide
    },
    coursId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: false,  // ✅ optionnel car sessions localStorage sans coursId MongoDB
      index:    true,
    },
    dateDebut: {
      type:     Date,
      required: true,
      default:  Date.now,  // ✅ valeur par défaut pour sessions créées automatiquement
      index:    true,
    },
    duree: {
      type:    Number,
      default: 120,
    },
    salle: {
      type:    String,
      default: '—',
      trim:    true,
    },
    estActive: {
      type:    Boolean,
      default: true,
    },
    description: {
      type:    String,
      default: '',
      trim:    true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SessionCours', sessionCoursSchema);