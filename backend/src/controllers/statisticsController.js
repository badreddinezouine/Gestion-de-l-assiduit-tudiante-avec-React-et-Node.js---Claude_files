const Statistics = require('../models/Statistics');
const Presence = require('../models/Presence');
const Course = require('../models/Course');

exports.getProfessorDashboard = async (req, res) => {
  try {
    const professorId = req.user.id;

    const courses = await Course.find({ professeurId: professorId });
    
    const stats = {
      totalStudents: 0,
      totalCourses: courses.length,
      attendanceRate: 0,
      pendingDecisions: 0
    };

    // Calcul simplifié pour la démo
    for (const course of courses) {
      stats.totalStudents += course.etudiantsInscrits.length;
    }

    stats.attendanceRate = 85; // Valeur fixe pour la démo

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    // Données simulées pour la démo
    const activities = [
      {
        etudiant: 'Badr Zouine',
        cours: 'Base de Données',
        statut: 'PRESENT',
        date: new Date().toISOString()
      },
      {
        etudiant: 'Marouane Moumen',
        cours: 'Algorithmique',
        statut: 'RETARD',
        date: new Date(Date.now() - 3600000).toISOString()
      },
      {
        etudiant: 'John Doe',
        cours: 'Programmation Web',
        statut: 'PRESENT',
        date: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceTrend = async (req, res) => {
  try {
    // Données simulées pour la démo
    const trend = [
      { date: '2024-01-01', tauxPresence: 78 },
      { date: '2024-01-08', tauxPresence: 82 },
      { date: '2024-01-15', tauxPresence: 85 },
      { date: '2024-01-22', tauxPresence: 80 },
      { date: '2024-01-29', tauxPresence: 88 }
    ];

    res.json({
      success: true,
      trend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};