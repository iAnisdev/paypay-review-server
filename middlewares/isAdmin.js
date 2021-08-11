const isAdmin = async function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(401).json({
            message: 'Unauthorized Request: no permission granted'
        })
    } else {
        next()
    }
}

module.exports = isAdmin