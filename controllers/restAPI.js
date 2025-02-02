const {User, Message} = require('../models/user');
const {Sequelize, Op} = require("sequelize");


exports.addMsg = async (req, res) => {
    try{
        const content = req.body.message;

        if (!content?.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Message cannot be empty'
            });
        }

        await Message.create({content: content, user_id: req.session.user.id});

        await update(req, res);
    }
    catch(err) {
        /*res.status(500).json({
            status: 'error',
            message: 'Could not add message'
        });*/
        res.status(500).json({error: err});

    }
}

exports.searchMsg = async (req, res) => {
    try{
        const searchTerm = req.body.searchTerm;

        /*if (!searchTerm) {
            return res.status(400).json({error: 'Search term is required'});
        }*/

        if (!searchTerm) {
            return res.status(400).json({
                status: 'error',
                message: 'Search term is required'
            });
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
        res.status(500).json({
            status: 'error',
            message: 'Failed to search messages'
        });
    }
}

exports.editMsg = async (req, res) => {
    try{
        const { messageId, newContent } = req.body;
        const userId = req.session.user.id;
        const messageToEdit = await Message.update(
            {content: newContent},
            {where: {id: messageId, user_id: userId}}
        );

        if (messageToEdit[0] === 0) {
            throw new Error('Message not found or cannot be edited');
        }

        await update(req, res);

    }
    catch (err) {
        console.log(err);
        console.error('Error in editMsg:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to edit message'
        });
    }
}

exports.deleteMsg = async (req, res) => {
    try {
        const { messageId } = req.body;
        const effectedRows= Message.update(
            { deleted: true },
            { where: {id:messageId}
            });

        if (effectedRows === 0) {
            throw new Error('Message not found or cannot be deleted');
        }

        await update(req, res);
    }
    catch (err) {
        console.error('Error in deleteMsg:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete message'
        });
    }
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
        res.status(500).json({
            status: 'error',
            message: 'Cannot update messages'
        });
    }
}

exports.update = update;