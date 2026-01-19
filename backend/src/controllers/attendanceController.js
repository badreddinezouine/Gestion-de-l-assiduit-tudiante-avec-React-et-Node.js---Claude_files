const Attendance = require('../models/Attendance');
const Presence = require('../models/Presence');
const Absence = require('../models/Absence');
const SessionCours = require('../models/SessionCours');

exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.id;
    
    const attendance = await Presence.find({ etudiantId: studentId })
      .populate('sessionCoursId', 'dateDebut coursId')
      .populate({
        path: 'sessionCoursId',
        populate: { path: 'coursId', select: 'intitule code' }
      })
      .sort({ dateScan: -1 });

    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reportAbsence = async (req, res) => {
  try {
    const { sessionCoursId, motif, document } = req.body;
    const studentId = req.user.studentId || req.user.id;

    const absence = await Absence.create({
      etudiantId: studentId,
      sessionCoursId,
      motif,
      documentJustificatif: document,
      justifiee: false
    });

    res.json({
      success: true,
      message: 'Absence signalée',
      absence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;

    const attendance = await Presence.find()
      .populate({
        path: 'sessionCoursId',
        match: { coursId: courseId },
        populate: { path: 'coursId', select: 'intitule' }
      })
      .populate('etudiantId', 'nom prenom');

    res.json({
      success: true,
      attendance: attendance.filter(a => a.sessionCoursId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Logique simplifiée pour les statistiques
    const stats = {
      totalSessions: 10,
      averageAttendance: 85,
      topStudents: [
        { name: 'Badr Zouine', attendance: 95 },
        { name: 'Marouane Moumen', attendance: 90 },
        { name: 'John Doe', attendance: 87 }
      ]
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};