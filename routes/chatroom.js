var express = require('express');
var router = express.Router();
const {User, Message} = require('../models/user');
//const messages = require('../models/message');
const {Op} = require("sequelize");
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
            }]
        });

        console.log(newMessages);

        req.session.lastUpdate = Date.now()

        const user = await User.findOne({
            select: ['firstName'],
            where:{id: req.session.user.id}
        });

        res.render('chatroom', { title: 'Chat', firstName: user.firstName, messages: newMessages });
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
        const newMessages = await Message.findAll({
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }],
            where: {
                updatedAt: {
                    [Op.gt]: req.session.lastUpdate
                },
                user_id: {
                    [Op.ne]: req.session.user.id
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
