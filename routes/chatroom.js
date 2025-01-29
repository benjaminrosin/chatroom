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
/*
router.get('/add', function(req, res, next) {
    res.redirect('/chatroom');
})

router.post('/add', async function(req, res, next) {
    try{
        const content = req.body.message;

        await Message.create({content: content, user_id: req.session.user.id});

        const newMessages = await Message.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.literal(`CASE WHEN "user_id" = ${req.session.user.id} THEN true ELSE false END`),
                        'isMine',
                    ],
                ],
            },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }],
            where: {
                updatedAt: {
                    //[Op.gt]: req.session.lastUpdate
                    //[Op.gt]: lastChatUpdate
                }
            }
        });

        //req.session.lastUpdate = Date.now()
        lastChatUpdate = Date.now();

        res.status(200).json({
            status: 'success',
            messages: newMessages
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            status: 'error'
        });
        //res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: "cannot signup, please try again later."});
    }
})
router.post('/edit', async function(req, res) {
    try{
        const { messageId, newContent } = req.body;
        const userId = req.session.user.id;
        const messageToEdit= await Message.update(
            {content: newContent},
            {where: {id: messageId, user_id: userId}}
        );

        if(!messageToEdit === 0){
            return res.status(404).json({ error: 'the message does not found or cannot be edited' });
        }
        const newMessages = await Message.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.literal(`CASE WHEN "user_id" = ${req.session.user.id} THEN true ELSE false END`),
                        'isMine',
                    ],
                ],
            },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }],
            where: {
                updatedAt: {
                   // [Op.gt]: req.session.lastUpdate
                    [Op.gt]: lastChatUpdate
                }
            }
        });

        //req.session.lastUpdate = Date.now()
        lastChatUpdate = Date.now();

        res.status(200).json({
            status: 'success',
            messages: newMessages
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error'
        });
    }
})

router.delete('/delete', async function(req, res) {
    try {
        const { messageId } = req.body;
        const effectedRows= Message.update(
            { deleted: true },
            { where: {id:messageId}
            });

        if(effectedRows === 0){
            return res.status(404).json({ error: 'the message does not found' });
        }

        const newMessages = await Message.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.literal(`CASE WHEN "user_id" = ${req.session.user.id} THEN true ELSE false END`),
                        'isMine',
                    ],
                ],
            },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }],
            where: {
                updatedAt: {
                    //[Op.gt]: req.session.lastUpdate
                    [Op.gt]: lastChatUpdate
                }
            }
        });

        //req.session.lastUpdate = Date.now()
        lastChatUpdate = Date.now();

        res.status(200).json({
            status: 'success',
            messages: newMessages
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error'
        });
    }
})

router.post('/update', async function(req, res, next) {
    try{
        const newMessages = await Message.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.literal(`CASE WHEN "user_id" = ${req.session.user.id} THEN true ELSE false END`),
                        'isMine',
                    ],
                ],
            },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }],
            where: {
                updatedAt: {
                    //[Op.gt]: req.session.lastUpdate
                    [Op.gt]: lastChatUpdate
                }
            }
        });

        //req.session.lastUpdate = Date.now()
        lastChatUpdate = Date.now();

        res.status(200).json({
            status: 'success',
            messages: newMessages
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            status: 'error'
        });
    }
})*/


module.exports = router;
