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
            //return res.status(400).json({error: 'Message cannot be empty'});
            return await flashNrediredc(req, res, 'error','Message cannot be empty', 400);

        }

        await Message.create({content: content, user_id: req.session.user.id});

        await update(req, res);
    }
    catch(err) {
       //return res.status(400).json({error:err});
        return await flashNrediredc(req, res, 'error','Failed to add messages', 504);
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
            return await flashNrediredc(req, res, 'error','Search term is required', 400);

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
        return await flashNrediredc(req, res, 'error','Failed to search messages', 504);

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
            return await flashNrediredc(req, res, 'error','Message not found', 404);

        }

        if (message.user_id !== userId) {
            return await flashNrediredc(req, res, 'error','You are not authorized to edit this message', 403);

        }

        const messageToEdit = await Message.update(
            {content: newContent},
            {where: {id: messageId, user_id: userId}}
        );

        if (messageToEdit[0] === 0) {
            return await flashNrediredc(req, res, 'error','Message not found or cannot be edited', 404);

        }
        await update(req, res);
    }
    catch (err) {
        return await flashNrediredc(req, res, 'error','Failed to edit message', 504, err.message);
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
            return await flashNrediredc(req, res, 'error','Message not found', 404);

        }

        if (message.user_id !== userId) {
            return await flashNrediredc(req, res, 'error','You are not authorized to delete this message', 403);
        }

        const effectedRows = await Message.update(
            { deleted: true },
            { where: {id:messageId}
            });

        if (effectedRows === 0) {
            return await flashNrediredc(req, res, 'error','Message not found or cannot be deleted', 404);
        }

        await update(req, res);
    }
    catch (err) {
        return await flashNrediredc(req, res, 'error','Failed to delete message', 504, err.message);
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
        return await flashNrediredc(req, res, 'error','Cannot update messages', 504);
    }
}

async function flashNrediredc(req, res, title, error, status, details = '', url = '/error') {
    req.flash('title', title);
    req.flash('error', error);
    req.flash('status', status);
    req.flash('details', details);
    return res.redirect(url);
}

exports.update = update;