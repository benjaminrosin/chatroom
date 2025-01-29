var express = require('express');
var router = express.Router();
const messageController = require('../controllers/messageHandler')


router.get('/', messageController.getchat)

router.get('/add', messageController.unexpected)

router.post('/add', messageController.addMsg)

router.get('/edit', messageController.unexpected)

router.post('/edit', messageController.editMsg)

router.get('/delete', messageController.unexpected)

router.delete('/delete', messageController.deleteMsg)

router.get('/update', messageController.unexpected)

router.post('/update', messageController.update)


module.exports = router;
