const ChatBotDecision = require('../models/ChatBotDecision');
const Statistics = require('../models/Statistics');
const Absence = require('../models/Absence');
const Adaptation = require('../models/Adaptation');
const Student = require('../models/Student');
const Course = require('../models/Course');

// Analyser un étudiant pour une décision
exports.analyzeStudent = async (req, res) => {
  try {
    const { etudiantId, coursId } = req.body;

    // Récupérer les statistiques
    const stats = await Statistics.findOne({ 
      etudiantId, 
      coursId 
    });

    if (!stats) {
      return res.status(404).json({ error: 'Statistiques non trouvées' });
    }

    // Récupérer les absences
    const absences = await Absence.find({ etudiantId });
    const absencesJustifiees = absences.filter(a => a.justifiee).length;

    // Algorithme de décision
    let typeDecision, recommandation, justification, scoreConfiance;

    if (stats.tauxPresence >= 75 && 
        stats.scoreAdaptation >= 3.0 &&
        (absencesJustifiees / (absences.length || 1)) >= 0.7) {
      
      typeDecision = 'RATTRAPAGE';
      recommandation = 'Autoriser le rattrapage';
      justification = `Taux de présence: ${stats.tauxPresence}%, ` +
                     `Score adaptation: ${stats.scoreAdaptation}/4, ` +
                     `Absences justifiées: ${absencesJustifiees}/${absences.length}`;
      scoreConfiance = 85;
      
    } else if (stats.tauxPresence < 50 || stats.moyenneNotes < 8) {
      
      typeDecision = 'REFUS';
      recommandation = 'Refuser le rattrapage';
      justification = `Assiduité insuffisante (${stats.tauxPresence}%) ` +
                     `et/ou notes faibles (${stats.moyenneNotes}/20)`;
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
        scoreAdaptation: stats.scoreAdaptation,
        nombreAbsences: absences.length,
        nombreAbsencesJustifiees: absencesJustifiees
      },
      statut: 'EN_ATTENTE'
    });

    res.json({
      success: true,
      decision
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approuver/Rejeter une décision
exports.reviewDecision = async (req, res) => {
  try {
    const { decisionId } = req.params;
    const { action } = req.body; // 'APPROUVE' ou 'REJETE'

    const decision = await ChatBotDecision.findById(decisionId);
    
    if (!decision) {
      return res.status(404).json({ error: 'Décision non trouvée' });
    }

    // Vérifier que l'utilisateur est un professeur
    if (req.user.role !== 'PROFESSEUR') {
      return res.status(403).json({ error: 'Seuls les professeurs peuvent approuver les décisions' });
    }

    decision.statut = action;
    decision.approuvePar = req.user.id;
    decision.dateDecision = new Date();

    await decision.save();

    res.json({
      success: true,
      message: `Décision ${action.toLowerCase()} avec succès`,
      decision
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir l'historique des décisions
exports.getDecisionHistory = async (req, res) => {
  try {
    const { etudiantId, coursId } = req.query;

    let query = {};
    if (etudiantId) query.etudiantId = etudiantId;
    if (coursId) query.coursId = coursId;

    const decisions = await ChatBotDecision.find(query)
      .populate('etudiantId', 'nom prenom')
      .populate('coursId', 'intitule code')
      .populate('approuvePar', 'nom prenom')
      .sort({ dateDecision: -1 });

    res.json({
      success: true,
      decisions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les recommandations pour un cours
exports.getCourseRecommendations = async (req, res) => {
  try {
    const { coursId } = req.params;

    // Récupérer tous les étudiants du cours
    const cours = await Course.findById(coursId).populate('etudiantsInscrits');
    
    const recommendations = [];

    for (const etudiant of cours.etudiantsInscrits) {
      const stats = await Statistics.findOne({ 
        etudiantId: etudiant._id, 
        coursId 
      });

      if (stats) {
        let recommandation = '';
        
        if (stats.tauxPresence < 60) {
          recommandation = 'Attention: Taux de présence critique';
        } else if (stats.moyenneNotes < 10) {
          recommandation = 'Consolider les connaissances';
        } else if (stats.scoreAdaptation < 2.5) {
          recommandation = 'Encourager la participation';
        } else {
          recommandation = 'Bon parcours';
        }

        recommendations.push({
          etudiant: {
            id: etudiant._id,
            nom: etudiant.nom,
            prenom: etudiant.prenom
          },
          stats,
          recommandation
        });
      }
    }

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};