var express = require('express');
var router = express.Router();
const {User, Message} = require('../models/user');
//const messages = require('../models/message');
const {Op, Sequelize} = require("sequelize");
const {Json} = require("sequelize/lib/utils");

/*
router.get('/',  async function(req, res, next) {
    if (!req.session.user || !req.session.user.isLoggedIn) {
        return res.redirect('/logout');
    }
    const user = await users.User.findOne({
        select: ['firstName'],
        where:{id: req.session.user.id}
    });

    res.render('chatroom', {
        title: 'Chat',
        firstName: user.firstName
    });
});

 */

router.get('/', async function(req, res, next) {
    // load all old messages
    try{
        const newMessages = await Message.findAll({
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }],
            where: [{
                deleted: false
            }]
        });

        console.log(newMessages);

        req.session.lastUpdate = Date.now();

        const user = await User.findOne({
            select: ['firstName'],
            where:{id: req.session.user.id}
        });

        res.render('chatroom', { title: 'Chat', firstName: user.firstName, messages: newMessages, user_id: req.session.user.id });
    }
    catch(err){
        console.log(err);
        next(err);
        //return res.redirect('/login');
        //res.redirect('/');
    }


    //res.render('chatroom', { title: 'Chat'});
});

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
                    [Op.gt]: req.session.lastUpdate
                }
            }
        });

        req.session.lastUpdate = Date.now()

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
router.put('/edit', async function(req, res) {
    try{
        const { messageId, newContent } = req.body;
        const userId = req.session.user.id;
        const messageToEdit= Message.update(
            {content: newContent},
            {where: {id: messageId, user_id: userId, updatedAt: Date.now()}});

        if(!messageToEdit === 0){
            return res.status(404).json({ error: 'the message does not found or cannot be edited' });
        }
        res.status(200).json({
            status: 'success'
        })
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
        const messageToDelete= Message.update(
            { deleted: true },
            { where: {id:messageId}
            });

        if(!messageToDelete === 0){
            return res.status(404).json({ error: 'the message does not found' });
        }
        res.status(200).json({
            status: 'success'
        })
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
                    [Op.gt]: req.session.lastUpdate
                }
            }
        });

        req.session.lastUpdate = Date.now()

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
})


module.exports = router;
