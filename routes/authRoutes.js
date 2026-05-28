const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/register', authController.getRegister);

router.post('/register', [
    body('firstName').notEmpty().withMessage('Imię jest wymagane').trim(),
    body('lastName').notEmpty().withMessage('Nazwisko jest wymagane').trim(),
    body('company').notEmpty().withMessage('Nazwa firmy jest wymagana').trim(),
    body('department').notEmpty().withMessage('Wybór działu jest wymagany'),
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć minimum 6 znaków')
], authController.postRegister);



router.get('/login', authController.getLogin);

router.post('/login', [
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail').normalizeEmail(),
    body('password').notEmpty().withMessage('Hasło jest wymagane')
], authController.postLogin);


router.get('/logout', authController.logout);

module.exports = router;