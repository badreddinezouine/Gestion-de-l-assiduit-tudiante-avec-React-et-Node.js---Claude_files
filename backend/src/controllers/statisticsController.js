const Presence = require('../models/Presence');
const Course = require('../models/Course');

const toDayKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

exports.dashboardProfessor = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();

    const totalRecords = await Presence.countDocuments();
    const presentRecords = await Presence.countDocuments({ statut: 'PRESENT' });

    const attendanceRate = totalRecords > 0
      ? Math.round((presentRecords / totalRecords) * 100)
      : 0;

    const studentsAgg = await Presence.aggregate([
      { $group: { _id: '$etudiantId' } },
      { $count: 'count' }
    ]);

    const totalStudents = studentsAgg[0]?.count || 0;

    return res.json({
      totalStudents,
      totalCourses,
      attendanceRate,
      pendingDecisions: 0
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
      .populate('coursId', 'intitule code')
      .sort({ dateScan: -1 })
      .limit(15);

    const out = rows.map((r) => ({
      etudiant: r.etudiantId ? `${r.etudiantId.prenom} ${r.etudiantId.nom}` : 'Etudiant',
      cours: r.coursId ? `${r.coursId.intitule}` : 'Cours',
      statut: r.statut,
      date: r.dateScan
    }));

    return res.json(out);
  } catch (err) {
    console.error('recentActivity error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.attendanceTrend = async (req, res) => {
  try {
    const days = 14;

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const agg = await Presence.aggregate([
      { $match: { dateScan: { $gte: start } } },
      {
        $group: {
          _id: {
            y: { $year: '$dateScan' },
            m: { $month: '$dateScan' },
            d: { $dayOfMonth: '$dateScan' }
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$statut', 'PRESENT'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } }
    ]);

    const byDay = new Map();
    for (const r of agg) {
      const key = `${r._id.y}-${String(r._id.m).padStart(2, '0')}-${String(r._id.d).padStart(2, '0')}`;
      byDay.set(key, { total: r.total, present: r.present });
    }

    const out = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDayKey(d);

      const v = byDay.get(key) || { total: 0, present: 0 };
      const tauxPresence = v.total > 0 ? Math.round((v.present / v.total) * 100) : 0;

      out.push({ date: key, tauxPresence });
    }

    return res.json(out);
  } catch (err) {
    console.error('attendanceTrend error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};