const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Importer les modèles
const User = require('../src/models/User');
const Professor = require('../src/models/Professor');
const Student = require('../src/models/Student');
const Course = require('../src/models/Course');
const SessionCours = require('../src/models/SessionCours');

async function seedDatabase() {
  try {
    console.log('🌱 Début de l\'initialisation de la base de données...\n');
    
    // Connexion
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Vider les collections existantes (optionnel)
    console.log('🧹 Nettoyage des anciennes données...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Base nettoyée\n');

    // 1. CRÉER L'ADMINISTRATEUR
    console.log('👑 Création de l\'administrateur...');
    const adminUser = await User.create({
      email: 'admin@univ.fr',
      motDePasse: 'admin123',
      nom: 'Admin',
      prenom: 'System',
      role: 'ADMIN',
      telephone: '0600000000'
    });
    console.log(`✅ Admin créé : ${adminUser.email}\n`);

    // 2. CRÉER UN PROFESSEUR
    console.log('👨‍🏫 Création du professeur...');
    const profUser = await User.create({
      email: 'prof.badr@univ.fr',
      motDePasse: 'prof123',
      nom: 'BENBOUKER',
      prenom: 'Mohamed Badr',
      role: 'PROFESSEUR',
      telephone: '0612345678'
    });

    const professor = await Professor.create({
      utilisateurId: profUser._id,
      specialite: 'Informatique',
      departement: 'Département d\'Informatique',
      grade: 'PROFESSEUR'
    });
    console.log(`✅ Professeur créé : ${profUser.email}\n`);

    // 3. CRÉER DES ÉTUDIANTS
    console.log('👨‍🎓 Création des étudiants...');
    const studentsData = [
      {
        user: {
          email: 'badr.zouine@univ.fr',
          motDePasse: 'etu123',
          nom: 'Zouine',
          prenom: 'Badr eddine',
          role: 'ETUDIANT',
          telephone: '0623456789'
        },
        student: {
          numeroEtudiant: 'ETU2024001',
          niveau: 'LICENCE3',
          filiere: 'Informatique'
        }
      },
      {
        user: {
          email: 'marouane.moumen@univ.fr',
          motDePasse: 'etu123',
          nom: 'Moumen',
          prenom: 'Marouane',
          role: 'ETUDIANT',
          telephone: '0634567890'
        },
        student: {
          numeroEtudiant: 'ETU2024002',
          niveau: 'LICENCE3',
          filiere: 'Informatique'
        }
      },
      {
        user: {
          email: 'john.doe@univ.fr',
          motDePasse: 'etu123',
          nom: 'Doe',
          prenom: 'John',
          role: 'ETUDIANT',
          telephone: '0645678901'
        },
        student: {
          numeroEtudiant: 'ETU2024003',
          niveau: 'LICENCE3',
          filiere: 'Informatique'
        }
      }
    ];

    const students = [];
    for (const data of studentsData) {
      const user = await User.create(data.user);
      const student = await Student.create({
        utilisateurId: user._id,
        ...data.student
      });
      students.push({ user, student });
      console.log(`✅ Étudiant créé : ${user.email} (${data.student.numeroEtudiant})`);
    }
    console.log(`\n✅ Total : ${students.length} étudiants créés\n`);

    // 4. CRÉER UN COURS
    console.log('📚 Création d\'un cours...');
    const course = await Course.create({
      professeurId: professor._id,
      intitule: 'Base de Données Avancées',
      code: 'BDA2024',
      description: 'Cours avancé sur les bases de données NoSQL, MongoDB, et l\'optimisation des requêtes.',
      credits: 5,
      niveau: 'LICENCE3',
      filiere: 'Informatique',
      etudiantsInscrits: students.map(s => s.student._id)
    });
    console.log(`✅ Cours créé : ${course.intitule} (${course.code})\n`);

    // 5. CRÉER DES SESSIONS DE COURS
    console.log('📅 Création des sessions de cours...');
    const today = new Date();
    const sessions = [];

    for (let i = 0; i < 5; i++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + i * 2);
      sessionDate.setHours(10, 0, 0, 0);

      const session = await SessionCours.create({
        coursId: course._id,
        dateDebut: sessionDate,
        dateFin: new Date(sessionDate.getTime() + 2 * 60 * 60 * 1000), // +2 heures
        type: i % 2 === 0 ? 'COURS' : 'TD',
        statut: i === 0 ? 'PLANIFIÉ' : 'TERMINÉ',
        theme: `Séance ${i + 1}: ${i % 2 === 0 ? 'Théorie MongoDB' : 'Travaux pratiques'}`,
        objectifs: [
          'Comprendre les concepts NoSQL',
          'Maîtriser les opérations CRUD',
          'Implémenter des schémas optimisés'
        ]
      });
      sessions.push(session);
      console.log(`✅ Session créée : ${session.theme} (${session.type})`);
    }
    console.log(`\n✅ Total : ${sessions.length} sessions créées\n`);

    // AFFICHER LE RÉSUMÉ
    console.log('='.repeat(60));
    console.log('🎉 BASE DE DONNÉES INITIALISÉE AVEC SUCCÈS !');
    console.log('='.repeat(60));
    
    console.log('\n📊 RÉCAPITULATIF DES DONNÉES :');
    console.log('├─ 👑 Administrateurs : 1');
    console.log('├─ 👨‍🏫 Professeurs : 1');
    console.log('├─ 👨‍🎓 Étudiants : 3');
    console.log('├─ 📚 Cours : 1');
    console.log('└─ 📅 Sessions : 5');

    console.log('\n🔐 IDENTIFIANTS DE TEST :');
    console.log('├─ Admin : admin@univ.fr / admin123');
    console.log('├─ Professeur : prof.badr@univ.fr / prof123');
    console.log('└─ Étudiant : badr.zouine@univ.fr / etu123');

    console.log('\n🚀 Prochaine étape : Démarrer le backend et le frontend !');
    console.log('\n💡 Conseil : Ouvrez MongoDB Atlas pour voir vos nouvelles données.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

seedDatabase();