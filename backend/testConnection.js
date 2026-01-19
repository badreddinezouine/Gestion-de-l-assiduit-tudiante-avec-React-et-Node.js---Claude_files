const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db';

async function testConnection() {
  try {
    console.log('🔗 Tentative de connexion à MongoDB...\n');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ SUCCÈS : Connecté à MongoDB !');
    console.log(`📦 Base de données : ${mongoose.connection.name}`);
    console.log(`🌐 Host : ${mongoose.connection.host}`);
    console.log(`🔢 Port : ${mongoose.connection.port}`);
    
    // Lister les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Collections disponibles :');
    
    if (collections.length === 0) {
      console.log('   (Aucune collection - base vide)');
    } else {
      collections.forEach(col => console.log(`   • ${col.name}`));
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n⚠️  Si vous voyez ce message, votre configuration MongoDB est CORRECTE !');
    
  } catch (error) {
    console.error('\n❌ ERREUR de connexion :', error.message);
    console.log('\n🔍 DÉTAILS DE L\'ERREUR :');
    
    if (error.code === 'ENOTFOUND') {
      console.log('   • Vérifiez votre connexion internet');
      console.log('   • Le nom du cluster est incorrect');
    }
    if (error.code === 8000 || error.name === 'MongoServerError') {
      console.log('   • Mauvais nom d\'utilisateur ou mot de passe');
      console.log('   • Vérifiez vos identifiants MongoDB Atlas');
    }
    if (error.code === 13) {
      console.log('   • Problème d\'authentification');
      console.log('   • Vérifiez que l\'utilisateur a les bons privilèges');
    }
    
    console.log('\n💡 SOLUTION RAPIDE :');
    console.log('   1. Allez sur MongoDB Atlas → Database Access');
    console.log('   2. Vérifiez le nom d\'utilisateur et mot de passe');
    console.log('   3. Cliquez sur "Edit" → "Change Password" si besoin');
    console.log('   4. Dans Network Access, ajoutez "0.0.0.0/0" (Allow from anywhere)');
  }
}

testConnection();