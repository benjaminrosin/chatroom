/**
 * Express router configuration for authentication
 * @module authRouter
 */
const express = require('express');
const router = express.Router();
const validator = require('../controllers/validationController')

router.get('/', validator.newLogin);

router.post('/', validator.loginValidation);

module.exports = router;
