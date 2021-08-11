const { secret } = require('./../config/config.json')
const { users } = require('./../models')
const jwt = require('jsonwebtoken');

const isLoggedIn = async function (req, res, next) {
    var accessToken = req.header('accessToken')
    if (!accessToken) {
        return res.status(401).json({
            message: 'Unauthorized Request'
        })
    }
    try {
        var decoded = jwt.verify(accessToken, secret);
        users.findOne({
            where: { id: decoded.id }
        }).then(user => {
            if (user) {
                delete user.dataValues.password
                req.user = user
                next()
            } else {
                return res.status(401).json({
                    message: 'Invalid Access Token'
                })
            }
        }).catch(err => {
            return res.status(401).json({
                message: err
            })
        });
    } catch (err) {
        return res.status(401).json({
            message: err
        })
    }
}

module.exports = isLoggedIn