const ChatBotDecision = require('../models/ChatBotDecision');
const Statistics = require('../models/Statistics');
const Absence = require('../models/Absence');
const Adaptation = require('../models/Adaptation');

class ChatBotService {
  async analyserEtudiant(etudiantId, coursId) {
    // Récupérer les statistiques
    const stats = await Statistics.findOne({ 
      etudiantId, 
      coursId 
    });

    if (!stats) {
      throw new Error('Statistiques non trouvées');
    }

    // Récupérer les absences
    const absences = await Absence.find({ etudiantId });
    const absencesJustifiees = absences.filter(a => a.justifiee).length;

    // Récupérer les adaptations
    const adaptations = await Adaptation.find({ etudiantId, coursId });
    const scoreAdaptation = adaptations.length > 0 
      ? adaptations.reduce((sum, a) => sum + a.getScore(), 0) / adaptations.length
      : 0;

    // Algorithme de décision
    let typeDecision, recommandation, justification, scoreConfiance;

    if (stats.tauxPresence >= 75 && 
        scoreAdaptation >= 3.0 &&
        (absencesJustifiees / Math.max(absences.length, 1)) >= 0.7) {
      
      typeDecision = 'RATTRAPAGE';
      recommandation = 'Autoriser le rattrapage';
      justification = `Taux de présence: ${stats.tauxPresence}%, ` +
                     `Score adaptation: ${scoreAdaptation.toFixed(1)}/4, ` +
                     `Absences justifiées: ${absencesJustifiees}/${absences.length}`;
      scoreConfiance = 85;
      
    } else if (stats.tauxPresence < 50 || stats.moyenneNotes < 8) {
      
      typeDecision = 'REFUS';
      recommandation = 'Refuser le rattrapage';
      justification = `Assiduité insuffisante (${stats.tauxPresence}%) ` +
                     `et/ou notes faibles (${stats.moyenneNotes.toFixed(1)}/20)`;
      scoreConfiance = 90;
      
    } else {
      typeDecision = 'REVUE_MANUELLE';
      recommandation = 'Révision manuelle nécessaire';
      justification = 'Profil mixte nécessitant une évaluation humaine';
      scoreConfiance = 60;
    }

    // Créer la décision
    const decision = await ChatBotDecision.create({
      etudiantId,
      coursId,
      typeDecision,
      recommandation,
      justification,
      scoreConfiance,
      donneesAnalysees: {
        tauxPresence: stats.tauxPresence,
        moyenneNotes: stats.moyenneNotes,
        scoreAdaptation: scoreAdaptation,
        nombreAbsences: absences.length,
        nombreAbsencesJustifiees: absencesJustifiees
      }
    });

    return decision;
  }
}

module.exports = new ChatBotService();