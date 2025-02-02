/**
 * Express router configuration for homepage
 * @module indexRouter
 */
var express = require('express');
var router = express.Router();
const messageController = require('../controllers/messageHandler')

router.get('/', messageController.getchat)

module.exports = router;
