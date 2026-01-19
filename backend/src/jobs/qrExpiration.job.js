const cron = require('node-cron');
const QRCode = require('../models/QRCode');

// Vérifier toutes les minutes les QR codes expirés
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    // Trouver tous les QR codes actifs qui ont expiré
    const expiredQRCodes = await QRCode.find({
      actif: true,
      dateExpiration: { $lt: now }
    });

    console.log(`Found ${expiredQRCodes.length} expired QR codes`);

    // Désactiver les QR codes expirés
    for (const qrCode of expiredQRCodes) {
      qrCode.actif = false;
      await qrCode.save();
      console.log(`QR Code ${qrCode._id} désactivé (expiré à ${qrCode.dateExpiration})`);
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des QR codes expirés:', error);
  }
});

console.log('Job de vérification d\'expiration des QR codes démarré');