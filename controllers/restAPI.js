const {User, Message} = require('../models/user');
const {Sequelize, Op} = require("sequelize");

/**
 * Creates a new message
 * @param {Object} req - Express request object with message content
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.addMsg = async (req, res) => {
    try{
        const content = req.body.message;

        if (!content?.trim()) {
            return res.status(400).json({error: 'Message cannot be empty'});
        }

        await Message.create({content: content, user_id: req.session.user.id});

        await update(req, res);
    }
    catch(err) {
       return res.status(400).json({error:err});
    }
}

/**
 * Searches messages containing specific term
 * @param {Object} req - Express request object with search term
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.searchMsg = async (req, res) => {
    try{
        const searchTerm = req.body.searchTerm;

        if (!searchTerm) {
            req.flash('title', 'Error!');
            req.flash('error', 'Search term is required');
            req.flash('status', 400);
            return res.redirect('/error');
        }

        const messages = await Message.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.literal(`CASE WHEN "user_id" = ${req.session.user.id} THEN true ELSE false END`),
                        'isMine',
                    ],
                ],
            },
            where: {
                content: {
                    [Op.like]: `%${searchTerm}%`
                },
                deleted: false
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

/**
 * Edits an existing message
 * @param {Object} req - Express request object with messageId and new content
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.editMsg = async (req, res) => {
    try{
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

/**
 * Soft deletes a message
 * @param {Object} req - Express request object with messageId
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
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

/**
 * Fetches messages updated after specified timestamp
 * @param {Object} req - Express request object with last_updated timestamp
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
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