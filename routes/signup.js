const express = require('express');
const router = express.Router();
let once = true;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
});

router.post('/', function(req, res, next) {
    //check input and register
    res.redirect('login')
})

router.post('/password', function(req, res, next) {
    if (once){
        once = false;
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'email already in use'});
    }
    res.render('signup', { title: 'Signup' , startRegistration: false});
})

module.exports = router;
