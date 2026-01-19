const QRCode = require('qrcode');
const crypto = require('crypto');
const QRCodeModel = require('../models/QRCode');
const SessionCours = require('../models/SessionCours');

// Générer un QR Code
exports.generateQRCode = async (req, res) => {
  try {
    const { sessionCoursId, dureeValidite = 10 } = req.body;

    // Vérifier si la session existe
    const session = await SessionCours.findById(sessionCoursId);
    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Vérifier si un QR Code actif existe déjà
    const existingQR = await QRCodeModel.findOne({
      sessionCoursId,
      actif: true,
      dateExpiration: { $gt: new Date() }
    });

    if (existingQR) {
      return res.status(400).json({ 
        error: 'Un QR Code actif existe déjà pour cette session' 
      });
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

    res.json({
      success: true,
      qrCode: {
        id: qrCode._id,
        image: qrImage,
        code: code,
        expiration: dateExpiration,
        dureeValidite: dureeValidite
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Scanner un QR Code
exports.scanQRCode = async (req, res) => {
  try {
    const { code } = req.body;
    const etudiantId = req.user.role === 'ETUDIANT' ? req.user.id : null;

    if (!etudiantId) {
      return res.status(403).json({ error: 'Seuls les étudiants peuvent scanner des QR Codes' });
    }

    // Rechercher le QR Code
    const qrCode = await QRCodeModel.findOne({ code, actif: true });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR Code non trouvé ou expiré' });
    }

    // Vérifier la validité
    if (!qrCode.isValide()) {
      return res.status(400).json({ error: 'QR Code expiré' });
    }

    // Vérifier si l'étudiant est inscrit au cours
    const session = await SessionCours.findById(qrCode.sessionCoursId).populate('coursId');
    const cours = session.coursId;
    
    const student = await Student.findOne({ utilisateurId: etudiantId });
    const isInscrit = cours.etudiantsInscrits.includes(student._id);
    
    if (!isInscrit) {
      return res.status(403).json({ error: 'Vous n\'êtes pas inscrit à ce cours' });
    }

    // Incrémenter le nombre de scans
    await qrCode.incrementScans();

    // Déterminer le statut (présent ou retard)
    const now = new Date();
    const sessionStart = new Date(session.dateDebut);
    const diffMinutes = Math.floor((now - sessionStart) / (1000 * 60));
    
    let statut = 'PRESENT';
    if (diffMinutes > 15) {
      statut = 'RETARD';
    }

    res.json({
      success: true,
      message: `Présence enregistrée (${statut})`,
      statut,
      session: {
        id: session._id,
        cours: cours.intitule,
        date: session.dateDebut
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les QR Codes d'une session
exports.getSessionQRCodes = async (req, res) => {
  try {
    const { sessionCoursId } = req.params;
    
    const qrCodes = await QRCodeModel.find({ sessionCoursId })
      .sort({ dateGeneration: -1 })
      .populate('sessionCoursId');
    
    res.json({
      success: true,
      qrCodes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Désactiver un QR Code
exports.deactivateQRCode = async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    
    const qrCode = await QRCodeModel.findByIdAndUpdate(
      qrCodeId,
      { actif: false },
      { new: true }
    );
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR Code non trouvé' });
    }
    
    res.json({
      success: true,
      message: 'QR Code désactivé'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};