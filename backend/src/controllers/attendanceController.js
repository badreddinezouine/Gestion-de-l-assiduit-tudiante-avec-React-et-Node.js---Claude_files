const mongoose = require('mongoose');
const Presence = require('../models/Presence');

exports.getMyAttendance = async (req, res) => {
  try {
    const etudiantId = req.user?.id || req.query.etudiantId;

    if (!etudiantId) {
      return res.status(400).json({ success: false, error: 'etudiantId requis' });
    }

    const studentId = mongoose.Types.ObjectId.isValid(etudiantId)
      ? new mongoose.Types.ObjectId(etudiantId)
      : etudiantId;

    const rows = await Presence.find({ etudiantId: studentId })
      .populate('coursId', 'intitule code')
      .populate('sessionCoursId', 'dateDebut')
      .sort({ dateScan: -1 })
      .limit(200);

    return res.json(
      rows.map((r) => ({
        cours: r.coursId ? `${r.coursId.intitule} (${r.coursId.code})` : 'Cours',
        date: r.sessionCoursId?.dateDebut || r.dateScan,
        statut: r.statut,
      }))
    );
  } catch (err) {
    console.error('getMyAttendance error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ success: false, error: 'courseId requis' });
    }

    const cid = mongoose.Types.ObjectId.isValid(courseId)
      ? new mongoose.Types.ObjectId(courseId)
      : courseId;

    const rows = await Presence.find({ coursId: cid })
      .populate('coursId', 'intitule code')
      .populate('sessionCoursId', 'dateDebut salle')
      .populate('etudiantId', 'nom prenom email numeroEtudiant')
      .sort({ dateScan: -1 })
      .limit(500);

    return res.json({ success: true, rows });
  } catch (err) {
    console.error('getCourseAttendance error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.addManualAttendance = async (req, res) => {
  try {
    const { etudiantId, coursId, sessionCoursId, statut = 'PRESENT' } = req.body;

    if (!etudiantId || !coursId) {
      return res.status(400).json({ success: false, error: 'etudiantId et coursId requis' });
    }

    const doc = await Presence.create({
      etudiantId,
      coursId,
      sessionCoursId: sessionCoursId || null,
      statut,
      dateScan: new Date(),
      source: 'MANUAL',
    });

    return res.status(201).json({ success: true, presence: doc });
  } catch (err) {
    console.error('addManualAttendance error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};