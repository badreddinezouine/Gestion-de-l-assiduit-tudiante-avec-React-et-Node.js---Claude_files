const mongoose = require('mongoose');

const sessionCoursSchema = new mongoose.Schema(
  {
    coursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    dateDebut: {
      type: Date,
      required: true,
      index: true,
    },
    duree: {
      type: Number,
      default: 120,
    },
    salle: {
      type: String,
      default: '—',
      trim: true,
    },
    estActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SessionCours', sessionCoursSchema);