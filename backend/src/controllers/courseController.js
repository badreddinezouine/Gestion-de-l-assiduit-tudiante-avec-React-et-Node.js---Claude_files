const User         = require('../models/User');
const Course       = require('../models/Course');
const SessionCours = require('../models/SessionCours');
const Professor    = require('../models/Professor');
const Student      = require('../models/Student');

// ─── COURS ───────────────────────────────────────────────────

exports.getMyCourses = async (req, res) => {
  try {
    const professor = await Professor.findOne({ utilisateurId: req.user.id });
    if (!professor) {
      return res.status(404).json({ success: false, error: 'Profil professeur non trouvé' });
    }

    const courses = await Course.find({ professeurId: professor._id, actif: true })
      .populate({
        path:     'etudiantsInscrits',   // Student docs
        populate: {
          path:   'utilisateurId',       // ✅ populate User dans Student
          select: 'nom prenom email'
        }
      })
      .lean();

    const withSessions = await Promise.all(
      courses.map(async (c) => {
        const sessions = await SessionCours.find({ coursId: c._id })
          .sort({ dateDebut: -1 })
          .lean();
        return { ...c, sessions };
      })
    );

    return res.json({ success: true, courses: withSessions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const professor = await Professor.findOne({ utilisateurId: req.user.id });
    if (!professor) {
      return res.status(404).json({ success: false, error: 'Profil professeur non trouvé' });
    }

    const { intitule, code, description, credits, niveau, filiere } = req.body;

    const course = await Course.create({
      professeurId: professor._id,
      intitule,
      code:         code.toUpperCase(),
      description,
      credits:      credits || 3,
      niveau,
      filiere,
    });

    return res.status(201).json({ success: true, course });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Ce code cours existe déjà' });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { actif: false });
    return res.json({ success: true, message: 'Cours supprimé' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── SÉANCES ─────────────────────────────────────────────────

exports.addSession = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    }

    const { dateDebut, duree, salle, description } = req.body;

    const session = await SessionCours.create({
      coursId:   course._id,
      dateDebut: new Date(dateDebut),
      duree:     duree || 120,
      salle:     salle || '—',
      description,
      estActive: true,
    });

    await Course.findByIdAndUpdate(course._id, { $inc: { nombreSessions: 1 } });

    return res.status(201).json({ success: true, session });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    await SessionCours.findByIdAndDelete(req.params.sessionId);
    await Course.findByIdAndUpdate(req.params.id, { $inc: { nombreSessions: -1 } });
    return res.json({ success: true, message: 'Séance supprimée' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── INSCRIPTIONS ─────────────────────────────────────────────

exports.enrollStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { etudiantsInscrits: studentIds } },
      { new: true }
    ).populate({
      path:     'etudiantsInscrits',
      populate: { path: 'utilisateurId', select: 'nom prenom email' }
    });

    return res.json({ success: true, course });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ CORRIGÉ — Inscrire par filière avec les bons IDs (Student._id)
exports.enrollByFiliere = async (req, res) => {
  try {
    const { filiere, niveau } = req.body;

    if (!filiere) {
      return res.status(400).json({ success: false, error: 'filiere requise' });
    }

    // Construire le filtre
    const filter = { filiere };
    if (niveau && niveau !== 'Tous') filter.niveau = niveau;

    // Chercher les profils Student de cette filière
    const students = await Student.find(filter).lean();

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error:   `Aucun étudiant trouvé pour la filière "${filiere}"`,
      });
    }

    // ✅ CORRIGÉ : utiliser s._id (Student ObjectId) et NON s.utilisateurId
    // Car Course.etudiantsInscrits référence le modèle Student
    const studentObjectIds = students.map((s) => s._id);

    // Ajouter sans écraser les étudiants déjà inscrits
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { etudiantsInscrits: { $each: studentObjectIds } } },
      { new: true }
    ).populate({
      path:     'etudiantsInscrits',
      populate: { path: 'utilisateurId', select: 'nom prenom email' }
    });

    return res.json({
      success: true,
      message: `${students.length} étudiant(s) inscrit(s) depuis la filière "${filiere}"`,
      count:   students.length,
      course,
    });
  } catch (err) {
    console.error('enrollByFiliere error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── ÉTUDIANTS ────────────────────────────────────────────────

exports.getAllStudents = async (req, res) => {
  try {
    const users = await User.find({ role: 'ETUDIANT', actif: true })
      .select('nom prenom email telephone')
      .lean();

    const studentProfiles = await Student.find({
      utilisateurId: { $in: users.map((u) => u._id) },
    }).lean();

    const formatted = users.map((u) => {
      const profile = studentProfiles.find(
        (s) => String(s.utilisateurId) === String(u._id)
      );
      return {
        id:             String(u._id),
        nom:            u.nom,
        prenom:         u.prenom,
        email:          u.email,
        numeroEtudiant: profile?.numeroEtudiant || 'Non assigné',
        niveau:         profile?.niveau         || 'Non spécifié',
        filiere:        profile?.filiere        || 'Non spécifiée',
      };
    });

    return res.json({ success: true, students: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFilieres = async (req, res) => {
  try {
    const filieres = await Student.distinct('filiere');
    const niveaux  = await Student.distinct('niveau');

    const cleanFilieres = filieres.filter((f) => f && f !== 'Non spécifiée');
    const cleanNiveaux  = niveaux.filter((n)  => n && n !== 'Non spécifié');

    const filieresWithCount = await Promise.all(
      cleanFilieres.map(async (f) => {
        const count = await Student.countDocuments({ filiere: f });
        return { filiere: f, count };
      })
    );

    return res.json({
      success:  true,
      filieres: filieresWithCount,
      niveaux:  cleanNiveaux,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};