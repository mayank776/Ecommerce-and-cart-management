const {jwt} = require('../utils')

const userAuth = async (req, res, next) => {
    try {
        let token =  req.header("Authorization")

        console.log(token)
        if(!token) {
            res.status(403).send({status: false, message: `Missing authentication token in request`})
            return;
        }

        let tokenSplit = token.split(" ")
        token = tokenSplit[1]
        const decoded = await jwt.verifyToken(token);
        console.log(decoded)
        if(!decoded) {
            res.status(403).send({status: false, message: `Invalid authentication token in request`})
            return;
        }

        req.userId = decoded.userId;

        next()
    } catch (error) {
        console.error(`Error! ${error.message}`)
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports = userAuth