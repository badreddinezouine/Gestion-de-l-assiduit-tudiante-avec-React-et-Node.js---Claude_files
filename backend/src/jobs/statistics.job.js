const cron = require('node-cron');
const Statistics = require('../models/Statistics');
const Presence = require('../models/Presence');
const Absence = require('../models/Absence');
const Course = require('../models/Course');
const Student = require('../models/Student');

// Mettre à jour les statistiques tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Début de la mise à jour des statistiques...');

    // Récupérer tous les cours
    const courses = await Course.find();

    for (const course of courses) {
      // Récupérer tous les étudiants du cours
      for (const studentId of course.etudiantsInscrits) {
        const student = await Student.findById(studentId);
        if (!student) continue;

        // Calculer les statistiques
        const presences = await Presence.countDocuments({ 
          etudiantId: student._id 
        });

        const absences = await Absence.countDocuments({ 
          etudiantId: student._id 
        });

        const totalSessions = presences + absences;
        const tauxPresence = totalSessions > 0 ? (presences / totalSessions) * 100 : 0;

        // Mettre à jour les statistiques
        await Statistics.findOneAndUpdate(
          { etudiantId: student._id, coursId: course._id },
          {
            tauxPresence,
            nombreAbsences: absences,
            nombreRetards: await Presence.countDocuments({ 
              etudiantId: student._id, 
              statut: 'RETARD' 
            }),
            dernierCalcul: new Date()
          },
          { upsert: true, new: true }
        );
      }
    }

    console.log('Mise à jour des statistiques terminée');

  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
  }
});

console.log('Job de statistiques démarré');