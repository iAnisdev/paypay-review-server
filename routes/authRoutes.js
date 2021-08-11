const express = require('express')
const router = express.Router()
const { body, check, validationResult } = require('express-validator');
const { users } = require('./../models');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { secret } = require('./../config/config.json')
const isLoggedIn = require('./../middlewares/isLoggedIn')

router.post('/login',
    check('email').exists().not().isEmpty().withMessage('Email Required').isEmail().withMessage('Invalid Email Address'),
    check('password').exists().not().isEmpty().withMessage('Login Password Required'),
    async function (req, res, nex) {
        console.log(req.body)
        const errors = validationResult(req);
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }
        users.findOne({
            where: { email: req.body.email }
        }).then(user => {
            if (user) {
                console.log(user.dataValues.password, req.body.password)
                bcrypt.compare(req.body.password, user.dataValues.password).then(async (isPasswordValid) => {
                    if (isPasswordValid) {
                        var token = await jwt.sign({
                            id: user.id,
                            role: user.role
                        }, secret)
                        user.dataValues.accessToken = token
                        delete user.dataValues.password
                        res.json(user);
                    } else {
                        res.status(401).send({
                            message: `Invalid Login Password`
                        });
                    }

                })
            } else {
                res.status(401).send({
                    message: `no account associated with the email address`
                });
            }
        }).catch(err => {
            res.status(500).send({
                message: err.message
            });
        });
    })

router.get('/userdata', isLoggedIn, function (req, res, nex) {
    res.json(req.user)
})

module.exports = router;