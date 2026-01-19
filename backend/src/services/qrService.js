const QRCode = require('qrcode');
const crypto = require('crypto');
const QRCodeModel = require('../models/QRCode');
const SessionCours = require('../models/SessionCours');
const Presence = require('../models/Presence');

class QRService {
  async generateQRCode(sessionCoursId, dureeValidite = 10) {
    // Vérifier si la session existe
    const session = await SessionCours.findById(sessionCoursId);
    if (!session) {
      throw new Error('Session non trouvée');
    }

    // Générer un code unique
    const code = crypto.randomBytes(32).toString('hex');

    // Calculer la date d'expiration
    const dateExpiration = new Date();
    dateExpiration.setMinutes(dateExpiration.getMinutes() + dureeValidite);

    // Créer le QR Code en base
    const qrCode = await QRCodeModel.create({
      sessionCoursId,
      code,
      dateExpiration,
      dureeValidite
    });

    // Générer l'image QR
    const qrImage = await QRCode.toDataURL(code);

    // Mettre à jour la session
    await SessionCours.findByIdAndUpdate(sessionCoursId, {
      qrCodeGenere: true
    });

    return {
      qrCode,
      qrImage,
      expiration: dateExpiration
    };
  }

  async scanQRCode(code, etudiantId) {
    // Rechercher le QR Code
    const qrCode = await QRCodeModel.findOne({ code, actif: true });
    
    if (!qrCode) {
      throw new Error('QR Code non trouvé ou expiré');
    }

    // Vérifier la validité
    if (new Date() > qrCode.dateExpiration) {
      throw new Error('QR Code expiré');
    }

    // Vérifier si l'étudiant a déjà scanné
    const existingPresence = await Presence.findOne({
      etudiantId,
      sessionCoursId: qrCode.sessionCoursId
    });

    if (existingPresence) {
      throw new Error('Vous avez déjà scanné pour cette session');
    }

    // Déterminer le statut (présent ou retard)
    const session = await SessionCours.findById(qrCode.sessionCoursId);
    const now = new Date();
    const sessionStart = new Date(session.dateDebut);
    const diffMinutes = Math.floor((now - sessionStart) / (1000 * 60));
    
    let statut = 'PRESENT';
    if (diffMinutes > 15) {
      statut = 'RETARD';
    }

    // Créer l'enregistrement de présence
    const presence = await Presence.create({
      etudiantId,
      sessionCoursId: qrCode.sessionCoursId,
      qrCodeId: qrCode._id,
      statut,
      dateScan: now
    });

    // Incrémenter le nombre de scans
    await qrCode.incrementScans();

    return {
      presence,
      statut,
      session
    };
  }
}

module.exports = new QRService();