const Adaptation = require('../models/Adaptation');
const Student = require('../models/Student');

exports.createAdaptation = async (req, res) => {
  try {
    const { etudiantId, coursId, note, commentaire, typeParticipation } = req.body;

    const adaptation = await Adaptation.create({
      etudiantId,
      coursId,
      note,
      commentaire,
      typeParticipation
    });

    res.json({
      success: true,
      message: 'Adaptation évaluée',
      adaptation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentAdaptations = async (req, res) => {
  try {
    const { studentId } = req.params;

    const adaptations = await Adaptation.find({ etudiantId: studentId })
      .populate('coursId', 'intitule code')
      .sort({ dateEvaluation: -1 });

    res.json({
      success: true,
      adaptations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyAdaptations = async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.id;

    const adaptations = await Adaptation.find({ etudiantId: studentId })
      .populate('coursId', 'intitule code professeurId')
      .populate({
        path: 'coursId',
        populate: { path: 'professeurId', select: 'nom prenom' }
      })
      .sort({ dateEvaluation: -1 });

    res.json({
      success: true,
      adaptations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};