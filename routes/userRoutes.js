const express = require('express')
const router = express.Router()
const { body, check, validationResult } = require('express-validator');
const { secret } = require('./../config/config.json')
const bcrypt = require("bcryptjs");
const { users } = require('./../models')
const isLoggedIn = require('./../middlewares/isLoggedIn')
const isAdmin = require('./../middlewares/isAdmin')

router.post('/users',
    body('firstname').exists().not().isEmpty().withMessage('First Name Required'),
    body('lastname').exists().not().isEmpty().withMessage('Last Name Required'),
    body('email').exists().not().isEmpty().withMessage('Email Required').isEmail().withMessage('Invalid Email Address'),
    body('email').custom(value => {
        return users.findOne({
            where: { email: value }
        }).then(user => {
            if (user !== null) {
                return Promise.reject('E-mail already in use');
            }
        });
    }),
    body('password').exists().not().isEmpty().withMessage('Login Password Required'),
    function (req, res, nex) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }
        users.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password
        }).then(data => {
            delete data.password
            res.json(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message
            });
        });
    })

router.get('/users', isLoggedIn, isAdmin, function (req, res, nex) {
    users.findAll().then((users) => {
        users.map((user) => {
            delete user.dataValues.password
            return user
        })
        res.json({ users })
    })
})

router.get('/users/:id', isLoggedIn, function (req, res, nex) {
    users.findOne({
        where: { id: Number(req.params.id) },
        include: ["givenReviews", "recivedReviews"]
    }).then(user => {
        if (user) {
            delete user.dataValues.password
            res.json(user);
        } else {
            res.status(500).send({
                message: `unable to find a user with id ${req.params.id}`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})


router.patch('/users/:id', isLoggedIn, isAdmin, async function (req, res, nex) {
    const salt = await bcrypt.genSaltSync()
    users.findOne({
        where: { id: Number(req.params.id) }
    }).then(user => {
        if (user) {
            let password
            console.log()
            if (req.body.password !== undefined) {
                password = bcrypt.hashSync(req.body.password, salt)
            } else {
                password = user.dataValues.password
            }
            console.log("password ", password)
            return users.update({
                firstname: req.body.firstname || user.dataValues.firstname,
                lastname: req.body.lastname || user.dataValues.lastname,
                email: req.body.email || user.dataValues.email,
                password: password
            }, { where: { id: Number(req.params.id) } }).then((data) => {
                res.status(200).send({
                    message: 'user updated successfully'
                });
            })
        } else {
            res.status(500).send({
                message: `unable to find a user with id ${req.params.id}`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})


router.delete('/users/:id', isLoggedIn, isAdmin, function (req, res, nex) {
    users.destroy({
        where: { id: Number(req.params.id) }
    }).then(resp => {
        if (resp) {
            res.status(200).send({
                message: 'user deleted successfully'
            });
        } else {
            res.status(500).send({
                message: 'Error while deleting user'
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
})


module.exports = router;