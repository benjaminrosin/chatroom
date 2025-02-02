/**
 * Express router configuration for error handling
 * @module errorRouter
 */
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('error', {
        title: req.flash('title')[0] || 'Error!',
        message: req.flash('error')[0] || 'An error occurred',
        error: {
            status: req.flash('status')[0] || 500,
            details: req.flash('details')[0]
        }
    });
});

module.exports = router;