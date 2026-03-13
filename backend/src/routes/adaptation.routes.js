const express = require('express');
const router = express.Router();

const qrController = require('../controllers/qrController');
const { protect, checkRole } = require('../middleware/auth');

// PROFESSEUR : générer QR
router.post('/generate', protect, checkRole('PROFESSEUR'), qrController.generateQRCode);

// ETUDIANT : scanner QR
router.post('/scan', protect, checkRole('ETUDIANT'), qrController.scanQRCode);

module.exports = router;