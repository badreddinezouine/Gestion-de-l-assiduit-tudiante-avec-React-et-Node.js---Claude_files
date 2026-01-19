const cron = require('node-cron');
const SessionCours = require('../models/SessionCours');
const Notification = require('../models/Notification');
const Course = require('../models/Course');

// Vérifier toutes les heures les sessions à venir
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    // Trouver les sessions qui commencent dans l'heure
    const upcomingSessions = await SessionCours.find({
      dateDebut: { $gte: now, $lte: inOneHour },
      statut: 'PLANIFIÉ'
    }).populate('coursId');

    for (const session of upcomingSessions) {
      const course = await Course.findById(session.coursId);
      
      // Créer une notification pour le professeur
      await Notification.create({
        utilisateurId: course.professeurId,
        titre: 'Session à venir',
        message: `La session de ${course.intitule} commence à ${new Date(session.dateDebut).toLocaleTimeString('fr-FR')}`,
        type: 'RAPPEL',
        lien: `/professor/attendance`
      });

      // Créer des notifications pour les étudiants
      for (const studentId of course.etudiantsInscrits) {
        await Notification.create({
          utilisateurId: studentId,
          titre: 'Cours à venir',
          message: `Le cours ${course.intitule} commence bientôt`,
          type: 'RAPPEL',
          lien: `/student/scan`
        });
      }
    }

    console.log(`Notifications créées pour ${upcomingSessions.length} sessions à venir`);

  } catch (error) {
    console.error('Erreur lors de la création des notifications:', error);
  }
});

console.log('Job de notifications démarré');