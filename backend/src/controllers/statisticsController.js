const Presence = require('../models/Presence');
const Course   = require('../models/Course');
const Student  = require('../models/Student');

const toDayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

exports.dashboardProfessor = async (req, res) => {
  try {
    const totalCourses  = await Course.countDocuments({ actif: true });
    const totalStudents = await Student.countDocuments();

    const totalRecords  = await Presence.countDocuments();
    const totalPresent  = await Presence.countDocuments({ statut: 'PRESENT' });
    const totalRetard   = await Presence.countDocuments({ statut: 'RETARD'  });
    const totalAbsent   = await Presence.countDocuments({ statut: 'ABSENT'  });

    const attendanceRate = totalRecords > 0
      ? Math.round((totalPresent / totalRecords) * 100)
      : 0;

    return res.json({
      totalStudents,
      totalCourses,
      attendanceRate,
      pendingDecisions: 0,
      // ✅ Pour le graphique répartition
      totalPresent,
      totalRetard,
      totalAbsent,
    });
  } catch (err) {
    console.error('dashboardProfessor error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.recentActivity = async (req, res) => {
  try {
    const rows = await Presence.find({})
      .populate('etudiantId', 'nom prenom')
      .populate('coursId',    'intitule code')
      .sort({ dateScan: -1 })
      .limit(15);

    const out = rows.map((r) => ({
      etudiant: r.etudiantId
        ? `${r.etudiantId.prenom} ${r.etudiantId.nom}`
        : 'Étudiant',
      cours:   r.coursId?.intitule || 'Cours',
      statut:  r.statut,
      date:    r.dateScan,
    }));

    return res.json(out);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.attendanceTrend = async (req, res) => {
  try {
    const days  = 14;
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const agg = await Presence.aggregate([
      { $match: { dateScan: { $gte: start } } },
      {
        $group: {
          _id: {
            y: { $year:       '$dateScan' },
            m: { $month:      '$dateScan' },
            d: { $dayOfMonth: '$dateScan' },
          },
          total:   { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$statut', 'PRESENT'] }, 1, 0] }
          },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);

    const byDay = new Map();
    for (const r of agg) {
      const key = `${r._id.y}-${String(r._id.m).padStart(2,'0')}-${String(r._id.d).padStart(2,'0')}`;
      byDay.set(key, { total: r.total, present: r.present });
    }

    const out = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDayKey(d);
      const v   = byDay.get(key) || { total: 0, present: 0 };
      out.push({
        date:         key,
        tauxPresence: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
      });
    }

    return res.json(out);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
