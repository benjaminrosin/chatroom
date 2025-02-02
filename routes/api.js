/**
 * Express router configuration for chat functionality
 * @module chatRouter
 */

var express = require('express');
var router = express.Router();
const messageController = require('../controllers/messageHandler')
const apiController = require('../controllers/restAPI')


router.get('/', messageController.getchat)

router.get('/add', messageController.unexpected)

router.post('/add', apiController.addMsg)

router.get('/search', messageController.unexpected)

router.post('/search', apiController.searchMsg)

router.get('/edit', messageController.unexpected)

router.post('/edit', apiController.editMsg)

router.get('/delete', messageController.unexpected)

router.delete('/delete', apiController.deleteMsg)

router.get('/update', messageController.unexpected)

router.post('/update', apiController.update)


module.exports = router;
