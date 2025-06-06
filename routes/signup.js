/**
 * Express router configuration for user registration
 * @module signupRouter
 */
const express = require('express');
const router = express.Router();
const validator = require('../controllers/validationController')

/* GET home page. */
router.get('/', validator.newSignup)

router.post('/', validator.register)

router.get('/password', validator.newSignup)

router.post('/password', validator.checkEmailAvailability);

module.exports = router;
