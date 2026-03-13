const crypto = require('crypto');
let QRCodeLib = null;

try {
  QRCodeLib = require('qrcode');
} catch (e) {
  console.warn('⚠️ package "qrcode" non installé');
}

const QRCode = require('../models/QRCode');
const SessionCours = require('../models/SessionCours');
const Presence = require('../models/Presence');

const makeCode = () => crypto.randomBytes(16).toString('hex');

exports.generateQRCode = async (req, res) => {
  try {
    const { sessionCoursId, dureeValidite = 10 } = req.body;

    if (!sessionCoursId) {
      return res.status(400).json({ success: false, error: 'sessionCoursId requis' });
    }

    const session = await SessionCours.findById(sessionCoursId).populate('coursId');
    if (!session) {
      return res.status(404).json({ success: false, error: 'Séance non trouvée' });
    }

    const code = `qr_${makeCode()}`;
    const expiration = new Date(Date.now() + Number(dureeValidite) * 60 * 1000);

    let image = null;
    if (QRCodeLib) {
      image = await QRCodeLib.toDataURL(code);
    } else {
      image =
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `<svg width="200" height="200"><rect width="200" height="200" fill="#fff"/><text x="100" y="100" font-family="Arial" font-size="12" text-anchor="middle">QR Demo</text></svg>`
        ).toString('base64');
    }

    const qr = await QRCode.create({
      code,
      sessionCoursId,
      expiration,
      scans: 0,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      qrCode: {
        id: qr._id,
        image,
        code,
        expiration: qr.expiration.toISOString(),
        dureeValidite: Number(dureeValidite),
        sessionCoursId,
      },
    });
  } catch (err) {
    console.error('generateQRCode error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.scanQRCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'code requis' });
    }

    const qr = await QRCode.findOne({ code });
    if (!qr) {
      return res.status(404).json({ success: false, error: 'QR Code non trouvé' });
    }

    if (Date.now() > qr.expiration.getTime()) {
      return res.status(400).json({ success: false, error: 'QR Code expiré' });
    }

    const session = await SessionCours.findById(qr.sessionCoursId).populate('coursId');
    if (!session) {
      return res.status(404).json({ success: false, error: 'Séance non trouvée' });
    }

    const etudiantId = req.user?.id;
    if (!etudiantId) {
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }

    const already = await Presence.findOne({ sessionCoursId: session._id, etudiantId });
    if (already) {
      return res.status(400).json({ success: false, error: 'Présence déjà enregistrée' });
    }

    const start = session.dateDebut || session.startAt || new Date();
    const lateThreshold = new Date(new Date(start).getTime() + 15 * 60 * 1000);
    const statut = new Date() > lateThreshold ? 'RETARD' : 'PRESENT';

    await Presence.create({
      sessionCoursId: session._id,
      coursId: session.coursId?._id || session.coursId,
      etudiantId,
      statut,
      dateScan: new Date(),
      source: 'QR',
    });

    qr.scans = (qr.scans || 0) + 1;
    await qr.save();

    return res.json({
      success: true,
      message: 'Présence enregistrée avec succès',
      statut,
      session: {
        id: session._id,
        cours: session.coursId?.intitule || 'Cours',
        date: new Date(start).toISOString(),
      },
    });
  } catch (err) {
    console.error('scanQRCode error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};