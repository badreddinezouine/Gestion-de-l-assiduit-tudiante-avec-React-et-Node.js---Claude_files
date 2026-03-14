const User      = require('../models/User');
const Professor = require('../models/Professor');
const Student   = require('../models/Student');
const jwt       = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const generateNumeroEtudiant = () => {
  const year   = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `ETU${year}${random}`;
};

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/register
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      email, motDePasse, nom, prenom, role, telephone,
      // Champs étudiant
      filiere, niveau, numeroEtudiant, dateNaissance,
      // Champs professeur
      specialite, departement, grade
    } = req.body;

    // Vérifier champs obligatoires communs
    if (!email || !motDePasse || !nom || !prenom || !role) {
      return res.status(400).json({
        success: false,
        error: 'Champs obligatoires manquants : email, motDePasse, nom, prenom, role'
      });
    }

    // ✅ Vérifier champs obligatoires étudiant
    if (role === 'ETUDIANT') {
      if (!filiere || !filiere.trim()) {
        return res.status(400).json({
          success: false,
          error: 'La filière est obligatoire pour un étudiant'
        });
      }
      if (!niveau) {
        return res.status(400).json({
          success: false,
          error: 'Le niveau est obligatoire pour un étudiant'
        });
      }
    }

    // Vérifier si email déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Créer l'utilisateur de base
    const user = await User.create({
      email,
      motDePasse,
      nom,
      prenom,
      role,
      telephone: telephone || ''
    });

    // Créer le profil selon le rôle
    if (role === 'PROFESSEUR') {
      await Professor.create({
        utilisateurId: user._id,
        specialite:    specialite  || 'Non spécifiée',
        departement:   departement || 'Non spécifié',
        grade:         grade       || 'MAITRE_ASSISTANT'
      });

    } else if (role === 'ETUDIANT') {
      await Student.create({
        utilisateurId:  user._id,
        numeroEtudiant: numeroEtudiant || generateNumeroEtudiant(),
        filiere:        filiere.trim(), // ✅ obligatoire
        niveau,                         // ✅ obligatoire
        dateNaissance:  dateNaissance || null
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id:     user._id,
        email:  user.email,
        nom:    user.nom,
        prenom: user.prenom,
        role:   user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    if (!user.actif) {
      return res.status(403).json({
        success: false,
        error: 'Compte désactivé'
      });
    }

    const token = generateToken(user._id, user.role);

    let additionalData = {};
    if (user.role === 'PROFESSEUR') {
      const professor = await Professor.findOne({ utilisateurId: user._id });
      if (professor) additionalData = professor.toObject();
    } else if (user.role === 'ETUDIANT') {
      const student = await Student.findOne({ utilisateurId: user._id });
      if (student) additionalData = student.toObject();
    }

    return res.json({
      success: true,
      token,
      user: {
        id:     user._id,
        email:  user.email,
        nom:    user.nom,
        prenom: user.prenom,
        role:   user.role,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/auth/profile
// ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-motDePasse');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    let profileData = {
      id:        user._id,
      email:     user.email,
      nom:       user.nom,
      prenom:    user.prenom,
      role:      user.role,
      telephone: user.telephone
    };

    if (user.role === 'PROFESSEUR') {
      const professor = await Professor.findOne({ utilisateurId: user._id });
      if (professor) profileData = { ...profileData, ...professor.toObject() };
    } else if (user.role === 'ETUDIANT') {
      const student = await Student.findOne({ utilisateurId: user._id });
      if (student) profileData = { ...profileData, ...student.toObject() };
    }

    return res.json({ success: true, user: profileData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  PUT /api/auth/profile
// ─────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.email;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-motDePasse');

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};