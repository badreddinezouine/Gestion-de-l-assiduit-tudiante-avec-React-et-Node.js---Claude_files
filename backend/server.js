const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ====================
// ROUTES AUTHENTIFICATION
// ====================

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API backend fonctionnelle!' });
});

// Vérifier si un email existe
app.get('/api/auth/check-email/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  
  // Liste des emails déjà utilisés (simulé)
  const existingEmails = [
    'admin@univ.fr',
    'prof.badr@univ.fr', 
    'badr.zouine@univ.fr',
    'marouane.moumen@univ.fr',
    'john.doe@univ.fr'
  ];
  
  const exists = existingEmails.includes(email);
  
  res.json({
    exists: exists,
    message: exists ? 'Email déjà utilisé' : 'Email disponible'
  });
});

// Connexion utilisateur
app.post('/api/auth/login', (req, res) => {
  const { email, motDePasse } = req.body;
  
  console.log('🔐 Tentative de connexion :', email);
  
  // Détection du rôle par email (simulation)
  let userData = {
    id: Date.now().toString(),
    email: email,
    nom: 'Utilisateur',
    prenom: 'Test',
    role: 'ETUDIANT'
  };
  
  if (email.includes('prof') || email === 'prof.badr@univ.fr') {
    userData = {
      id: '1',
      email: email,
      nom: 'BENBOUKER',
      prenom: 'Mohamed Badr',
      role: 'PROFESSEUR',
      specialite: 'Informatique',
      departement: 'Département Informatique'
    };
  } else if (email === 'admin@univ.fr') {
    userData = {
      id: '0',
      email: email,
      nom: 'Admin',
      prenom: 'System',
      role: 'ADMIN'
    };
  } else if (email === 'badr.zouine@univ.fr') {
    userData = {
      id: '2',
      email: email,
      nom: 'Zouine',
      prenom: 'Badr eddine',
      role: 'ETUDIANT',
      numeroEtudiant: 'ETU2024001',
      niveau: 'LICENCE3',
      filiere: 'Informatique'
    };
  } else if (email === 'marouane.moumen@univ.fr') {
    userData = {
      id: '3',
      email: email,
      nom: 'Moumen',
      prenom: 'Marouane',
      role: 'ETUDIANT',
      numeroEtudiant: 'ETU2024002',
      niveau: 'LICENCE3',
      filiere: 'Informatique'
    };
  }
  
  res.json({
    success: true,
    token: 'jwt_token_' + Date.now(),
    user: userData
  });
});

// Inscription utilisateur
app.post('/api/auth/register', (req, res) => {
  const { email, motDePasse, nom, prenom, role } = req.body;
  
  console.log('📝 Nouvelle inscription :', email);
  
  // Simuler la création d'un utilisateur
  const newUser = {
    id: Date.now().toString(),
    email: email,
    nom: nom,
    prenom: prenom,
    role: role || 'ETUDIANT',
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Inscription réussie',
    token: 'new_token_' + Date.now(),
    user: newUser
  });
});

// Profil utilisateur
app.get('/api/auth/profile', (req, res) => {
  // Simulation - normalement vérifier le token JWT
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'test@example.com',
      nom: 'Utilisateur',
      prenom: 'Test',
      role: 'ETUDIANT'
    }
  });
});

// ====================
// ROUTES QR CODE
// ====================

// Générer un QR Code
app.post('/api/qr/generate', (req, res) => {
  const { sessionCoursId, dureeValidite } = req.body;
  
  res.json({
    success: true,
    qrCode: {
      id: Date.now().toString(),
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RUkNvZGUgRGVtbyAxMjM0NTwvdGV4dD48L3N2Zz4=',
      code: 'qr_demo_' + Date.now(),
      expiration: new Date(Date.now() + 600000).toISOString(), // 10 minutes
      dureeValidite: dureeValidite || 10
    }
  });
});

// Scanner un QR Code
app.post('/api/qr/scan', (req, res) => {
  const { code } = req.body;
  
  console.log('📱 QR Code scanné :', code);
  
  res.json({
    success: true,
    message: 'Présence enregistrée avec succès',
    statut: 'PRESENT',
    session: {
      id: 'session_123',
      cours: 'Base de Données Avancées',
      date: new Date().toISOString()
    }
  });
});

// ====================
// ROUTES CHATBOT IA
// ====================

// Analyser un étudiant
app.post('/api/chatbot/analyze', (req, res) => {
  const { etudiantId, coursId } = req.body;
  
  res.json({
    success: true,
    decision: {
      id: Date.now().toString(),
      etudiantId: etudiantId,
      coursId: coursId,
      typeDecision: 'RATTRAPAGE',
      recommandation: 'Autoriser le rattrapage',
      justification: 'Taux de présence: 85%, Score adaptation: 3.5/4, Absences justifiées: 2/3',
      scoreConfiance: 85,
      statut: 'EN_ATTENTE',
      dateDecision: new Date().toISOString()
    }
  });
});

// Historique des décisions
app.get('/api/chatbot/history', (req, res) => {
  const decisions = [
    {
      _id: '1',
      typeDecision: 'RATTRAPAGE',
      recommandation: 'Autoriser le rattrapage',
      scoreConfiance: 85,
      statut: 'APPROUVE',
      createdAt: '2024-01-10T10:00:00Z',
      etudiantId: { nom: 'Zouine', prenom: 'Badr eddine' },
      coursId: { intitule: 'Base de Données', code: 'BDA2024' }
    },
    {
      _id: '2',
      typeDecision: 'REFUS',
      recommandation: 'Refuser le rattrapage',
      scoreConfiance: 90,
      statut: 'APPROUVE',
      createdAt: '2024-01-09T14:30:00Z',
      etudiantId: { nom: 'Doe', prenom: 'John' },
      coursId: { intitule: 'Algorithmique', code: 'ALG2024' }
    }
  ];
  
  res.json({
    success: true,
    decisions: decisions
  });
});

// ====================
// ROUTES STATISTIQUES
// ====================

// Dashboard professeur
app.get('/api/statistics/dashboard/professor', (req, res) => {
  res.json({
    totalStudents: 45,
    totalCourses: 3,
    attendanceRate: 87,
    pendingDecisions: 2
  });
});

// Activités récentes
app.get('/api/statistics/recent-activity', (req, res) => {
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
  
  res.json(activities);
});

// Tendance des présences
app.get('/api/statistics/attendance-trend', (req, res) => {
  const trend = [
    { date: '2024-01-01', tauxPresence: 78 },
    { date: '2024-01-08', tauxPresence: 82 },
    { date: '2024-01-15', tauxPresence: 85 },
    { date: '2024-01-22', tauxPresence: 80 },
    { date: '2024-01-29', tauxPresence: 88 }
  ];
  
  res.json(trend);
});

// ====================
// ROUTES DIVERSES
// ====================

// Présences étudiant
app.get('/api/attendance/my-attendance', (req, res) => {
  const attendance = [
    {
      cours: 'Base de Données',
      date: '2024-01-10T08:30:00',
      statut: 'PRESENT'
    },
    {
      cours: 'Algorithmique',
      date: '2024-01-09T10:00:00',
      statut: 'RETARD'
    },
    {
      cours: 'Programmation Web',
      date: '2024-01-08T14:00:00',
      statut: 'PRESENT'
    }
  ];
  
  res.json(attendance);
});

// ====================
// CONNEXION MONGODB
// ====================

// Connexion optionnelle à MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => console.error('⚠️  MongoDB non connecté - Mode simulation:', err.message));
} else {
  console.log('⚠️  Mode simulation - Aucune base de données requise');
}

// ====================
// DÉMARRAGE SERVEUR
// ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur PFE démarré sur http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('📡 ROUTES DISPONIBLES :');
  console.log('├─ GET  /api/test');
  console.log('├─ GET  /api/auth/check-email/:email');
  console.log('├─ POST /api/auth/login');
  console.log('├─ POST /api/auth/register');
  console.log('├─ POST /api/qr/scan');
  console.log('├─ POST /api/chatbot/analyze');
  console.log('├─ GET  /api/statistics/dashboard/professor');
  console.log('└─ GET  /api/attendance/my-attendance');
  console.log('='.repeat(50));
  console.log('👥 IDENTIFIANTS DE TEST :');
  console.log('├─ Professeur : prof.badr@univ.fr / (n\'importe quel mot de passe)');
  console.log('├─ Étudiant : badr.zouine@univ.fr / (n\'importe quel mot de passe)');
  console.log('└─ Admin : admin@univ.fr / (n\'importe quel mot de passe)');
  console.log('='.repeat(50));
});