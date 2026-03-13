const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Test API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API backend fonctionnelle!' });
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));
app.use('/api/statistics', require('./src/routes/statistics.routes'));
app.use('/api/qr', require('./src/routes/qr.routes'));
app.use('/api/adaptation', require('./src/routes/adaptation.routes'));

// Si tu veux activer plus tard
// app.use('/api/chatbot', require('./src/routes/chatbot.routes'));

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.log('⚠️  MONGODB_URI manquant: backend en erreur');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connecté');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur PFE démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connexion échouée :', err.message);
    process.exit(1);
  });