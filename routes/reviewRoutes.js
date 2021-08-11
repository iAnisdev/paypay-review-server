const express = require('express')
const router = express.Router()
const { reviews } = require('./../models')
const { body, check, validationResult } = require('express-validator');
const isLoggedIn = require('./../middlewares/isLoggedIn')
const isAdmin = require('./../middlewares/isAdmin')

router.get('/reviews', function (req, res, nex) {
    reviews.findAll({
        include: ["reviewerUser", "reviewForUser"]
    }).then((list) => {
        res.json({ list })
    })
})

router.post('/reviews', isLoggedIn,
    body('reviewer').exists().not().isEmpty().withMessage('Reviewer Id Required'),
    body('reviewFor').exists().not().isEmpty().withMessage('Target user Id Required'),
    body('rating').exists().not().isEmpty().withMessage('rating Required'),
    body('feedback').exists().not().isEmpty().withMessage('feedback Required'), function (req, res, nex) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }
        if (req.body.reviewer != req.body.reviewFor) {
            reviews.findOne({
                where: {
                    reviewer: Number(req.body.reviewer),
                    reviewFor: Number(req.body.reviewFor)
                }
            }).then(request => {
                if (request) {
                    res.status(500).send({
                        message: 'Review with same parameters already exits'
                    });
                } else {
                    return reviews.create({
                        reviewer: req.body.reviewer,
                        reviewFor: req.body.reviewFor,
                        rating: req.body.rating,
                        feedback: req.body.feedback
                    }).then(data => {
                        res.json(data);
                    })
                }
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
        } else {
            return res.status(400).json({
                errors: [{
                    "msg": "Both id's must be different",
                    "param": "reviewFor",
                    "location": "body"
                }]
            });
        }
    })


router.get('/reviews/by-id/:id', isLoggedIn, function (req, res, nex) {
    reviews.findOne({
        where: { id: Number(req.params.id) }
    }).then(review => {
        if (review) {
            res.json(review);
        } else {
            res.status(500).send({
                message: `unable to find a reviews with id ${req.params.id}`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})

router.get('/reviews/given/:userId', isLoggedIn, function (req, res, nex) {
    reviews.findAll({
        where: { reviewer: Number(req.params.userId) },
        include: ["reviewForUser"]
    }).then(review => {
        if (review) {
            res.json(review);
        } else {
            res.status(500).send({
                message: `unable to find a reviews with id ${req.params.id}`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})

router.get('/reviews/received/:userId', isLoggedIn, function (req, res, nex) {
    reviews.findAll({
        where: { reviewFor: Number(req.params.userId) },
        include: ["reviewerUser"]
    }).then(review => {
        if (review) {
            res.json(review);
        } else {
            res.status(500).send({
                message: `unable to find a reviews with id ${req.params.id}`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})


router.patch('/reviews/:id',
    body('rating').exists().not().isEmpty().withMessage('rating Required'),
    body('feedback').exists().not().isEmpty().withMessage('feedback Required'), isLoggedIn, async function (req, res, nex) {
        reviews.findOne({
            where: { id: Number(req.params.id) }
        }).then(review => {
            if (review) {
                return reviews.update({
                    rating: req.body.rating,
                    feedback: req.body.feedback
                }, { where: { id: Number(req.params.id) } }).then((data) => {
                    res.status(200).send({
                        message: 'review updated successfully'
                    });
                })
            } else {
                res.status(500).send({
                    message: `unable to find a review with id ${req.params.id}`
                });
            }
        }).catch(err => {
            res.status(500).send({
                message: err.message
            });
        });
    })

module.exports = router;