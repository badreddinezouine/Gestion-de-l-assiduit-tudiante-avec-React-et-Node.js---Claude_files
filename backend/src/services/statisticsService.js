const Statistics = require('../models/Statistics');
const Presence = require('../models/Presence');
const Absence = require('../models/Absence');
const Adaptation = require('../models/Adaptation');
const Course = require('../models/Course');

class StatisticsService {
  async updateStudentStatistics(studentId, courseId) {
    // Calculer le taux de présence
    const presences = await Presence.countDocuments({ etudiantId: studentId });
    const absences = await Absence.countDocuments({ etudiantId: studentId });
    const totalSessions = presences + absences;
    const tauxPresence = totalSessions > 0 ? (presences / totalSessions) * 100 : 0;

    // Calculer le score d'adaptation moyen
    const adaptations = await Adaptation.find({ etudiantId: studentId });
    const scoreAdaptation = adaptations.length > 0
      ? adaptations.reduce((sum, a) => sum + a.getScore(), 0) / adaptations.length
      : 0;

    // Mettre à jour ou créer les statistiques
    await Statistics.findOneAndUpdate(
      { etudiantId: studentId, coursId: courseId },
      {
        tauxPresence,
        scoreAdaptation,
        nombreAbsences: absences,
        nombreRetards: await Presence.countDocuments({ etudiantId: studentId, statut: 'RETARD' }),
        dernierCalcul: new Date()
      },
      { upsert: true, new: true }
    );
  }

  async getProfessorDashboard(professorId) {
    const courses = await Course.find({ professeurId: professorId });
    
    const stats = {
      totalStudents: 0,
      totalCourses: courses.length,
      attendanceRate: 0,
      pendingDecisions: 0
    };

    // Calculer le taux de présence moyen
    let totalAttendance = 0;
    let courseCount = 0;

    for (const course of courses) {
      const courseStats = await Statistics.find({ coursId: course._id });
      
      if (courseStats.length > 0) {
        const avgAttendance = courseStats.reduce((sum, s) => sum + s.tauxPresence, 0) / courseStats.length;
        totalAttendance += avgAttendance;
        courseCount++;
      }
    }

    stats.attendanceRate = courseCount > 0 ? Math.round(totalAttendance / courseCount) : 0;

    return stats;
  }
}

module.exports = new StatisticsService();