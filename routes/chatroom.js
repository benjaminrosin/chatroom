var express = require('express');
var router = express.Router();
const users = require('../models/user');
const messages = require('../models/message');
const {Op} = require("sequelize");
const {Json} = require("sequelize/lib/utils");

router.get('/', async function(req, res, next) {
    // load all old messages
    try{
        const newMessages = await messages.Message.findAll({
            include: [{
                model: users.User,
                attributes: ['firstName', 'lastName']
            }]
        });

        req.session.lastUpdate = Date.now()

        res.render('chatroom', { title: 'Chat', messages: newMessages });
    }
    catch(err){
        console.log(err);
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

        await messages.Message.create({content: content/*, user_id: req.session.user.id*/});

        res.status(200).json({
            status: 'success'
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

router.post('/update', async function(req, res, next) {
    try{
        const newMessages = await messages.Message.findAll({
            include: [{
                model: users.User,
                attributes: ['firstName', 'lastName']
            }],
            where: {
                updatedAt: {
                    [Op.gte]: req.session.lastUpdate
                },
                user_id: {
                    [Op.ne]: req.session.user.id
                }
            }
        });

        res.status(200).json({
            status: 'success',
            messages: newMessages
        });

        req.session.lastUpdate = Date.now()
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            status: 'error'
        });
    }
})


module.exports = router;
