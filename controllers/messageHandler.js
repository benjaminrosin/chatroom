const {User, Message} = require('../models/user');
const {Sequelize, Op} = require("sequelize");

/**
 * Renders the chat room page with user messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getchat = async (req, res) => {
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
        const user = await User.findOne({
            select: ['firstName'],
            where:{id: req.session.user.id}
        });

        const messages = newMessages.map(msg => {
            const msgJSON = msg.toJSON();
            msgJSON.content = decodeHTML(msgJSON.content);
            return msgJSON;
        });

        newMessages.forEach((message) => {message.content = decodeHTML(message.content)})
        res.render('chatroom', { title: 'Chat', firstName: user.firstName, messages: messages, user_id: req.session.user.id});
    }
    catch(err) {
        res.render('error', {
            message: 'Could not load chat room',
            error: err,
            title: 'Error!'
        });
    }
}

exports.unexpected = async (req, res) => {
    res.redirect('/chatroom');
}

function decodeHTML(text) {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');
}
