const express = require("express")
const router = express.Router()
const User = require("../modal/User")
const jwt = require("jsonwebtoken")
const authMiddleware = require("../middleware/authMiddleware")
const secreteKey = process.env.SecreteKey


router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ status: false, message: "All files are require" })

        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ status: false, message: "Email Already registered" });

        // const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({ name, email, password });
        await newUser.save();

        return res.status(201).json({ status: true, message: "Register successful" })
    } catch (error) {
        return res.status(400).json({ status: false, message: "Something went wrong", error: error.message })
    }
})


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ status: false, message: "All files are require" })

        const user = await User.findOne({ email,password });

        if (!user || !((password, user.password))) {   //await bcrypt.compare
            return res.status(400).json({ status: true, message: "Invalid Credential" })
        }

        const token = jwt.sign({ id: user._id, email: user.email }, secreteKey, { expiresIn: '1hr' })

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, //1 hr
        })

        return res.status(201).json({ status: true, message: "Login successful",authToken:authToken })
    } catch (error) {
        return res.status(400).json({ status: false, message: "Something went wrong", error: error.message })
    }
})

router.post('/profile', authMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        return res.status(201).json({ status: true, message: 'Profile Data', data: userData });

    } catch (error) {
        return res.status(400).json({ status: false, message: "Something went wrong", error: error.message })
    }
})

router.post("/logout", (req, res) => {
    res.clearCookie('authToken');
    res.status(201).json({ status: true, message: "logout success" })

})


module.exports = router;