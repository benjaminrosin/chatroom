var express = require('express');
var router = express.Router();
const users = require('../models/user');

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

module.exports = router;
