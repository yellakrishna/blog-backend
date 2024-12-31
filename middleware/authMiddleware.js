const User = require('../modal/User')
const jwt = require('jsonwebtoken')
const secreteKey = process.env.SecreteKey



const authMiddleware = async (req, res, next) => {

    try {
        const token = req?.cookies?.authToken
        if (!token) return res.status(400).json({ status: false, message: "Access Denied" })

        jwt.verify(token, secreteKey, async (err, decode) => {
            const user = await User.findById(decode?.id)
            if (!user) return res.status(400).json({ status: false, message: "Invalid Token" })

            req.user = {
                id: user?.id,
                name: user?.name,
                email: user?.email
            }
            next();
        })
    } catch (error) {
        return res.status(400).json({ status: false, message: 'Something went wrong', error: error.message });
    }

}



module.exports = authMiddleware;