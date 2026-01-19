const express = require('express');
const router = express.Router();
const { 
  generateQRCode, 
  scanQRCode, 
  getSessionQRCodes, 
  deactivateQRCode 
} = require('../controllers/qrController');
const { protect, authorize } = require('../middleware/auth.middleware');

// Générer QR Code (professeurs seulement)
router.post('/generate', protect, authorize('PROFESSEUR'), generateQRCode);

// Scanner QR Code (étudiants seulement)
router.post('/scan', protect, authorize('ETUDIANT'), scanQRCode);

// Obtenir les QR Codes d'une session
router.get('/session/:sessionCoursId', protect, getSessionQRCodes);

// Désactiver un QR Code
router.put('/deactivate/:qrCodeId', protect, authorize('PROFESSEUR'), deactivateQRCode);

module.exports = router;