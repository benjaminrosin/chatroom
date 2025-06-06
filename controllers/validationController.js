const {User} = require('../models/user')
const bcrypt = require("bcrypt");
const users = require("../models/user");
const REGISTER = 30;

/**
 * Renders login page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.newLogin = function(req, res) {
    res.render('login', { title: 'Login', msg: '', errMsg: ''});
}

/**
 * Validates user login credentials and manages session
 * @param {Object} req - Express request object with email and password
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.loginValidation = async(req, res) => {
    const user = await User.findOne({where:{email: req.body.email.trim().toLowerCase()}});

    if (user){
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            // Check if another user is active
            if (req.session.activeUser && req.session.activeUser !== user.id) {
                return res.render('login', {
                    title: 'Login',
                    msg: '',
                    errMsg: "Another user is already logged-in in another tab"
                });
            }
            req.session.user = {
                id: user.id,
                isLoggedIn: true
            };
            req.session.activeUser = user.id;
            res.redirect('chatroom');
        }
        else{
            res.render('login', { title: 'Login', msg: '', errMsg: "wrong password"});
        }
    }
    else{
        res.render('login', { title: 'Login', msg: '', errMsg: "cannot find user"});
    }
}

/**
 * Renders signup page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.newSignup = async(req, res) => {
    res.render('signup', { title: 'Signup' , startRegistration: true, errorMsg: ''});
}

/**
 * Verifies email availability and stores registration data in cookie
 * @param {Object} req - Express request object with email and user details
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.checkEmailAvailability = async (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    const result = await users.User.findOne({where: {email: email}});

    if(!result){
        res.cookie('registerData',
            JSON.stringify({
                email: email,
                firstName: req.body.first_name.trim().toLowerCase(),
                lastName: req.body.last_name.trim().toLowerCase()
            }),
            {
                maxAge: 1000 * REGISTER, // Set cookie expiration
            }
        );
        res.render('signup', { title: 'Signup' , startRegistration: false, errorMsg: ''});
    }
    else{
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'Email already in use'});
    }
}

/**
 * Completes user registration using stored cookie data
 * @param {Object} req - Express request object with password
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.register = async(req, res) => {
    if(!req.cookies.registerData){
        res.render('signup', { title: 'Signup' , startRegistration: true , errorMsg: 'session expired, please try again'});
    }
    else {
        try {
            const registerData = JSON.parse(req.cookies.registerData);

            const email = registerData.email.trim().toLowerCase();
            const fName = registerData.firstName.trim().toLowerCase();
            const lName = registerData.lastName.trim().toLowerCase();
            const password = req.body.password.trim().toLowerCase();

            res.clearCookie('registerData');
            await users.User.create({email: email, firstName: fName, lastName: lName, password: password});

            res.render('login', {title: 'Login', msg: 'you are now registered', errMsg: ''});
        }
        catch(err) {
            if (Array.isArray(err)) {
                console.log(err.errors[0]);
                res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: err.errors[0].message});
            }
            else{
                console.log(err);
                res.render('signup', {title: 'Signup', startRegistration: true, errorMsg: "cannot signup, please try again later."});
            }
        }
    }
}