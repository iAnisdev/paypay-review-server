const express = require('express')
const router = express.Router()
const { body, check, validationResult } = require('express-validator');
const { requests } = require('./../models')
const isLoggedIn = require('./../middlewares/isLoggedIn')
const isAdmin = require('./../middlewares/isAdmin')

router.get('/requests', isLoggedIn, function (req, res, nex) {
    requests.findAll({
        where: {
            status: 'pending'
        },
        include: ["reviewerUser", "reviewForUser"]
    }).then((list) => {
        let parsed_data = list.map((request) => {
            return {
                id: request.id,
                status: request.status,
                reviewerUser: {
                    fullname: request.reviewerUser.firstname + " " + request.reviewerUser.lastname,
                    email: request.reviewerUser.email
                },
                reviewForUser: {
                    fullname: request.reviewForUser.firstname + " " + request.reviewForUser.lastname,
                    email: request.reviewForUser.email
                }
            }
        })
        res.json({ list: parsed_data })
    })
})


router.get('/requests/reviewfor/:id', isLoggedIn, function (req, res, nex) {
    requests.findAll({
        where: {
            reviewfor: Number(req.params.id)
        },
        include: ["reviewerUser"]
    }).then((list) => {
        let parsed_data = list.map((request) => {
            return {
                id: request.id,
                status: request.status,
                userId: request.reviewerUser.id,
                fullname: request.reviewerUser.firstname + " " + request.reviewerUser.lastname,
                email: request.reviewerUser.email
            }
        })
        res.json({ list: parsed_data })
    })
})

router.get('/requests/reviewer/:id', isLoggedIn, function (req, res, nex) {
    requests.findAll({
        where: {
            reviewer: Number(req.params.id),
            status: 'pending'
        },
        include: ["reviewForUser"]
    }).then((list) => {
        let parsed_data = list.map((request) => {
            return {
                id: request.id,
                status: request.status,
                createdAt: request.createdAt,
                userId: request.reviewForUser.id,
                fullname: request.reviewForUser.firstname + " " + request.reviewForUser.lastname,
                email: request.reviewForUser.email
            }
        })
        res.json({ list: parsed_data })
    })
})



router.post('/requests', isLoggedIn, isAdmin,
    body('reviewer').exists().not().isEmpty().withMessage('Reviewer Id Required'),
    body('reviewFor').exists().not().isEmpty().withMessage('Target user Id Required'), function (req, res, nex) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }
        if (req.body.reviewer != req.body.reviewFor) {
            requests.findOne({
                where: {
                    reviewer: Number(req.body.reviewer),
                    reviewFor: Number(req.body.reviewFor)
                }
            }).then(request => {
                if (request) {
                    res.status(500).send({
                        message: 'Review Request with same parameters already exits'
                    });
                } else {
                    return requests.create({
                        reviewer: req.body.reviewer,
                        reviewFor: req.body.reviewFor
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

router.get('/requests/:id', isLoggedIn, function (req, res, nex) {
    requests.findOne({
        where: { id: Number(req.params.id) }
    }).then(request => {
        if (request) {
            res.json(request);
        } else {
            res.status(500).send({
                message: `unable to find a request with id ${req.params.id}`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})

router.patch('/requests/:id', isLoggedIn, async function (req, res, nex) {
    requests.findOne({
        where: { id: Number(req.params.id) }
    }).then(request => {
        if (request) {
            return requests.update({
                status: 'reviewed'
            }, { where: { id: Number(req.params.id) } }).then((data) => {
                res.status(200).send({
                    message: 'requests updated successfully'
                });
            })
        } else {
            res.status(500).send({
                message: `unable to find a request with id ${req.params.id}`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})

router.delete('/requests/:id', isLoggedIn, isAdmin, function (req, res, nex) {
    requests.destroy({
        where: { id: Number(req.params.id) }
    }).then(resp => {
        if (resp) {
            res.status(200).send({
                message: 'request deleted successfully'
            });
        } else {
            res.status(500).send({
                message: 'Error while deleting request'
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})

module.exports = router;