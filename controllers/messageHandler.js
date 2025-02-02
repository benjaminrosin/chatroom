const {User, Message} = require('../models/user');
const {Sequelize, Op} = require("sequelize");

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

        res.render('chatroom', { title: 'Chat', firstName: user.firstName, messages: newMessages, user_id: req.session.user.id});
    }
    catch(err) {
        res.render('error', {
            message: 'Could not load chat room',
            error: err,
            title: 'Error!'
        });
    }
}

exports.addMsg = async (req, res) => {
    try{
        const content = req.body.message;

        if (!content?.trim()) {
            req.flash('title', 'Error!');
            req.flash('error', 'Message cannot be empty');
            req.flash('status', 400);
            return res.redirect('/error');
        }

        await Message.create({content: content, user_id: req.session.user.id});

        await update(req, res);
    }
    catch(err) {
        req.flash('title', 'Error!');
        req.flash('error', 'Could not add message');
        req.flash('status', 500);
        return res.redirect('/error');
    }
}

exports.searchMsg = async (req, res) => {
    try{
        const searchTerm = req.body.searchTerm;

        /*if (!searchTerm) {
            return res.status(400).json({error: 'Search term is required'});
        }*/

        if (!searchTerm) {
            req.flash('title', 'Error!');
            req.flash('error', 'Search term is required');
            req.flash('status', 400);
            return res.redirect('/error');
        }

        const messages = await Message.findAll({
            where: {
                content: {
                    [Op.like]: `%${searchTerm}%`
                }
                },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }]
        });
        res.json({ messages });
    }
    catch (err){
        console.error('Error in searchMsg:', err);
        req.flash('title', 'Error!');
        req.flash('error', 'Failed to search messages');
        req.flash('status', 500);
        return res.redirect('/error');

    }
}

exports.editMsg = async (req, res) => {
    try{
        if (!req.session.user) {
            req.flash('title', 'Error!');
            req.flash('error', 'Unauthorized');
            req.flash('status', 401);
            return res.redirect('/error');
        }

        const { messageId, newContent } = req.body;
        const userId = req.session.user.id;

        // Check if message exists and belongs to user
        const message = await Message.findOne({
            where: { id: messageId }
        });

        if (!message) {
            req.flash('title', 'Error!');
            req.flash('error', 'Message not found');
            req.flash('status', 404);
            return res.redirect('/error');
        }

        if (message.user_id !== userId) {
            req.flash('title', 'Error!');
            req.flash('error', 'You are not authorized to edit this message');
            req.flash('status', 403);
            return res.redirect('/error');
        }

        const messageToEdit = await Message.update(
            {content: newContent},
            {where: {id: messageId, user_id: userId}}
        );

        if (messageToEdit[0] === 0) {
            req.flash('title', 'Error!');
            req.flash('error', 'Message not found or cannot be edited');
            req.flash('status', 404);
            return res.redirect('/error');
        }
        await update(req, res);
    }
    catch (err) {
        console.error('Error in editMsg:', err);

        req.flash('title', 'Error!');
        req.flash('error', 'Failed to edit message');
        req.flash('status', 500);
        req.flash('details', err.message);
        return res.redirect('/error');
    }
}

exports.deleteMsg = async (req, res) => {
    try {
        const { messageId } = req.body;
        const userId = req.session.user.id;

        // Check if message exists and belongs to user
        const message = await Message.findOne({
            where: { id: messageId }
        });

        if (!message) {
            req.flash('title', 'Error!');
            req.flash('error', 'Message not found');
            req.flash('status', 404);
            return res.redirect('/error');
        }

        if (message.user_id !== userId) {
            req.flash('title', 'Error!');
            req.flash('error', 'You are not authorized to delete this message');
            req.flash('status', 403);
            return res.redirect('/error');
        }
        const effectedRows = await Message.update(
            { deleted: true },
            { where: {id:messageId}
            });

        if (effectedRows === 0) {
            req.flash('title', 'Error!');
            req.flash('error', 'Message not found or cannot be deleted');
            req.flash('status', 404);
            return res.redirect('/error');
        }

        await update(req, res);
    }
    catch (err) {
        console.error('Error in deleteMsg:', err);

        req.flash('title', 'Error!');
        req.flash('error', 'Failed to delete message');
        req.flash('status', 500);
        req.flash('details', err.message);
        return res.redirect('/error');
    }
}

exports.unexpected = async (req, res) => {
    res.redirect('/chatroom');
}

async function update(req, res) {
    try {
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
                    //[Op.gt]: req.body.last_updated
                    [Op.gt]: new Date(req.body.last_updated)

                }
            }
        });

        res.status(200).json({
            status: 'success',
            messages: newMessages
        });
    }
    catch (err){
        console.error('Error in update:', err);
        req.flash('title', 'Error!');
        req.flash('error', 'Cannot update messages');
        req.flash('status', 500);
        return res.redirect('/error');
    }
}

exports.update = update;