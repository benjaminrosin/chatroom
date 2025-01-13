const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true});
});

router.post('/', function(req, res, next) {
    //check input and register
    res.redirect('login')
})

router.post('/password', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: false});
})

module.exports = router;
