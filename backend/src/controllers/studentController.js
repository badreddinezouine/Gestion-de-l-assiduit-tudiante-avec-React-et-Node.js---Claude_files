const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const QRCode = require('../models/QRCode');

// ─────────────────────────────────────────────────────────────
//  GET /api/students/my-grades
//  → Toutes les notes de l'étudiant connecté
// ─────────────────────────────────────────────────────────────
exports.getMyGrades = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver les notes de cet étudiant (etudiantId = User._id)
    const grades = await Grade.find({ etudiantId: userId })
      .populate('coursId', 'intitule code')
      .populate('professeurId', 'nom prenom')
      .sort({ createdAt: -1 });

    // Formater pour le frontend
    const formatted = grades.map(g => ({
      id: g._id,
      courseId: g.coursId?._id,
      courseName: g.coursId ? `${g.coursId.intitule} (${g.coursId.code})` : 'Cours',
      typeEvaluation: g.typeEvaluation,
      note: g.note,
      typeParticipation: g.typeParticipation,
      commentaire: g.commentaire,
      createdAt: g.createdAt,
    }));

    console.log(`📚 Étudiant ${userId} - ${formatted.length} notes`);

    return res.json({ success: true, grades: formatted });

  } catch (err) {
    console.error('getMyGrades error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/students/my-calendar
//  → Sessions des cours auxquels l'étudiant est inscrit
// ─────────────────────────────────────────────────────────────
exports.getMyCalendar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver le profil Student
    const student = await Student.findOne({ utilisateurId: userId });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Profil étudiant non trouvé' 
      });
    }

    // Trouver les cours où cet étudiant est inscrit
    const courses = await Course.find({ 
      etudiantsInscrits: student._id 
    }).select('intitule code sessions');

    // Extraire toutes les sessions
    const sessions = [];
    courses.forEach(course => {
      if (course.sessions && Array.isArray(course.sessions)) {
        course.sessions.forEach(session => {
          sessions.push({
            sessionId: session._id || session.id,
            courseId: course._id,
            courseName: course.intitule,
            courseCode: course.code,
            dateDebut: session.dateDebut,
            duree: session.duree,
            salle: session.salle,
          });
        });
      }
    });

    // Trier par date
    sessions.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));

    console.log(`📅 Étudiant ${userId} - ${sessions.length} sessions`);

    return res.json({ success: true, sessions });

  } catch (err) {
    console.error('getMyCalendar error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/students/my-attendance
//  → Historique des présences de l'étudiant (QR codes scannés)
// ─────────────────────────────────────────────────────────────
exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer les présences depuis la collection Attendance
    const attendances = await Attendance.find({ studentId: userId })
      .populate('courseId', 'intitule code')
      .populate('qrCodeId')
      .sort({ scanTime: -1 })
      .limit(200);

    // Formater pour le frontend
    const formatted = attendances.map(att => ({
      id: att._id,
      cours: att.courseName || (att.courseId ? `${att.courseId.intitule} (${att.courseId.code})` : 'Cours'),
      date: att.scanTime || att.date,
      statut: att.present ? 'PRESENT' : 'ABSENT',
    }));

    console.log(`✅ Étudiant ${userId} - ${formatted.length} présences`);

    return res.json({ success: true, attendance: formatted });

  } catch (err) {
    console.error('getMyAttendance error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};