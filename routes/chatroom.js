var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.user || !req.session.user.isLoggedIn) {
        return res.redirect('/logout');
    }
    res.render('chatroom', { title: 'Chat'});
});

module.exports = router;
