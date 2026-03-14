const crypto   = require('crypto');
const mongoose = require('mongoose');

let QRCodeLib = null;
try {
  QRCodeLib = require('qrcode');
} catch (e) {
  console.warn('⚠️  package "qrcode" non installé — npm install qrcode');
}

const QRCode      = require('../models/QRCode');
const SessionCours = require('../models/SessionCours');
const Presence    = require('../models/Presence');

const makeCode = () => crypto.randomBytes(16).toString('hex');

// ─────────────────────────────────────────────────────────────
//  POST /api/qr/generate
// ─────────────────────────────────────────────────────────────
exports.generateQRCode = async (req, res) => {
  try {
    const { sessionCoursId, dureeValidite = 10 } = req.body;

    if (!sessionCoursId) {
      return res.status(400).json({
        success: false,
        error: 'sessionCoursId requis',
      });
    }

    // ✅ Vérifier que c'est un vrai ObjectId MongoDB
    if (!mongoose.Types.ObjectId.isValid(sessionCoursId)) {
      return res.status(400).json({
        success: false,
        error:
          'ID de séance invalide. ' +
          'Veuillez recréer vos séances depuis "Mes Cours" — ' +
          'les anciennes données localStorage ne sont plus valides.',
      });
    }

    // ✅ Chercher la séance en base
    const session = await SessionCours.findById(sessionCoursId).populate('coursId');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Séance introuvable en base de données. Recréez-la depuis "Mes Cours".',
      });
    }

    // Générer le code unique
    const code       = `qr_${makeCode()}`;
    const expiration = new Date(
      Date.now() + Number(dureeValidite) * 60 * 1000
    );

    // Générer l'image QR
    let image = null;
    if (QRCodeLib) {
      image = await QRCodeLib.toDataURL(code);
    } else {
      // Fallback SVG si qrcode non installé
      image =
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#ffffff"/>
            <text x="100" y="95"  font-family="Arial" font-size="11"
              text-anchor="middle" fill="#333">QR Demo</text>
            <text x="100" y="115" font-family="Arial" font-size="8"
              text-anchor="middle" fill="#999">Installez qrcode</text>
          </svg>`
        ).toString('base64');
    }

    // ✅ Sauvegarder dans MongoDB Atlas
    const qr = await QRCode.create({
      code,
      sessionCoursId: session._id,
      expiration,
      scans:     0,
      createdAt: new Date(),
    });

    console.log(`✅ QR Code généré pour séance ${session._id} — expire ${expiration}`);

    return res.json({
      success: true,
      qrCode: {
        id:            qr._id,
        image,
        code,
        expiration:    qr.expiration.toISOString(),
        dureeValidite: Number(dureeValidite),
        sessionCoursId: String(session._id),
      },
    });

  } catch (err) {
    console.error('generateQRCode error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/qr/scan
// ─────────────────────────────────────────────────────────────
exports.scanQRCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'code requis' });
    }

    // Chercher le QR en base
    const qr = await QRCode.findOne({ code });
    if (!qr) {
      return res.status(404).json({ success: false, error: 'QR Code non trouvé' });
    }

    // Vérifier expiration
    if (Date.now() > qr.expiration.getTime()) {
      return res.status(400).json({ success: false, error: 'QR Code expiré' });
    }

    // Chercher la séance
    const session = await SessionCours.findById(qr.sessionCoursId).populate('coursId');
    if (!session) {
      return res.status(404).json({ success: false, error: 'Séance non trouvée' });
    }

    const etudiantId = req.user?.id;
    if (!etudiantId) {
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }

    // Vérifier présence déjà enregistrée
    const already = await Presence.findOne({
      sessionCoursId: session._id,
      etudiantId,
    });
    if (already) {
      return res.status(400).json({
        success: false,
        error: 'Présence déjà enregistrée pour cette séance',
      });
    }

    // Calculer statut (présent / retard)
    const start         = session.dateDebut || new Date();
    const lateThreshold = new Date(new Date(start).getTime() + 15 * 60 * 1000);
    const statut        = new Date() > lateThreshold ? 'RETARD' : 'PRESENT';

    // ✅ Enregistrer la présence dans MongoDB Atlas
    await Presence.create({
      sessionCoursId: session._id,
      coursId:        session.coursId?._id || session.coursId,
      etudiantId,
      statut,
      dateScan: new Date(),
      source:   'QR',
    });

    // Incrémenter le compteur de scans
    qr.scans = (qr.scans || 0) + 1;
    await qr.save();

    console.log(`✅ Présence enregistrée — étudiant ${etudiantId} — statut ${statut}`);

    return res.json({
      success: true,
      message: 'Présence enregistrée avec succès',
      statut,
      session: {
        id:    session._id,
        cours: session.coursId?.intitule || 'Cours',
        date:  new Date(start).toISOString(),
      },
    });

  } catch (err) {
    console.error('scanQRCode error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};