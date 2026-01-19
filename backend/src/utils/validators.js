const { body } = require('express-validator');

exports.validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('motDePasse').isLength({ min: 8 }),
  body('nom').notEmpty().trim(),
  body('prenom').notEmpty().trim(),
  body('role').isIn(['PROFESSEUR', 'ETUDIANT', 'ADMIN'])
];

exports.validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('motDePasse').notEmpty()
];

exports.validateQRGeneration = [
  body('sessionCoursId').isMongoId(),
  body('dureeValidite').optional().isInt({ min: 1, max: 60 })
];

exports.validateScan = [
  body('code').isLength({ min: 32 }).matches(/^[a-f0-9]+$/i)
];