const User = require('../models/User');
const Professor = require('../models/Professor');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Générer un token JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Inscription
exports.register = async (req, res) => {
  try {
    const { email, motDePasse, nom, prenom, role, telephone, ...additionalData } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      motDePasse,
      nom,
      prenom,
      role,
      telephone
    });

    // Créer le profil spécifique selon le rôle
    if (role === 'PROFESSEUR') {
      await Professor.create({
        utilisateurId: user._id,
        specialite: additionalData.specialite || 'Non spécifiée',
        departement: additionalData.departement || 'Non spécifié',
        grade: additionalData.grade || 'MAITRE_ASSISTANT'
      });
    } else if (role === 'ETUDIANT') {
      await Student.create({
        utilisateurId: user._id,
        numeroEtudiant: additionalData.numeroEtudiant,
        niveau: additionalData.niveau,
        filiere: additionalData.filiere,
        dateNaissance: additionalData.dateNaissance
      });
    }

    // Générer le token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérifier si le compte est actif
    if (!user.actif) {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    // Générer le token
    const token = generateToken(user._id, user.role);

    // Récupérer les données supplémentaires selon le rôle
    let additionalData = {};
    if (user.role === 'PROFESSEUR') {
      const professor = await Professor.findOne({ utilisateurId: user._id });
      additionalData = professor;
    } else if (user.role === 'ETUDIANT') {
      const student = await Student.findOne({ utilisateurId: user._id });
      additionalData = student;
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        ...additionalData
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-motDePasse');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    let profileData = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      telephone: user.telephone
    };

    // Ajouter les données spécifiques au rôle
    if (user.role === 'PROFESSEUR') {
      const professor = await Professor.findOne({ utilisateurId: user._id });
      profileData = { ...profileData, ...professor.toObject() };
    } else if (user.role === 'ETUDIANT') {
      const student = await Student.findOne({ utilisateurId: user._id });
      profileData = { ...profileData, ...student.toObject() };
    }

    res.json({
      success: true,
      user: profileData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Supprimer les champs non modifiables
    delete updates.email;
    delete updates.role;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-motDePasse');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};