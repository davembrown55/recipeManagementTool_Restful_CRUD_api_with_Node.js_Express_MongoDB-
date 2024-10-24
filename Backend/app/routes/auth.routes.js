const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user.model');

const router = express.Router();

// Register route
router.post('/register', [
    check('email').isEmail(),
    check('password').isLength({ min: 6 })
    // need more validation for password?  
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, email, password: hashedPassword, isAdmin: false });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
    } catch (err) {        
        console.error("Error occurred during registration:", err);
        res.status(500).send('Server error');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Server error');
    }
});


//Check if email exists
router.post('/user/checkEmail',  async (req, res) => {
    const { email } = req.body;

    try {
        const findEmail = await User.findOne({ email });
        const emailAvailable = findEmail ? false : true;
        res.json({emailAvailable: emailAvailable });  
    } catch (e) {
        // console.error("Error occurred during email check:", e);
        // res.status(500).send('Server error');
        res.status(500).json({ msg: 'Server error', error: e.message });
    }

});
//Check if username exists
router.post('/user/checkUsername',  async (req, res) => {
    const { username } = req.body;

    try {
        const findUsername = await User.findOne({ username });
        const userNameAvailable = findUsername ? false : true;
        res.json({userNameAvailable: userNameAvailable });  
    } catch (e) {
        // console.error("Error occurred during username check:", e);
        // res.status(500).send('Server error');
        res.status(500).json({ msg: 'Server error', error: e.message });
    }

});

//For admin 
router.get('/users', async (req, res) => {
    // add conditions and admin auth
    try {
        const allUsers = await User.find({}, {username:1, email:1})
        res.json(allUsers)

    } catch (err) {
        // console.error("Error occurred during get all users:", err);
        res.status(500).send('Server error');
    }

});

router.get('/user/:id', async (req, res) => {
    const id = req.query.id;

    // add conditions and auth for admin || user

    try {
        const result = await User.findById(id);
        // const result = await User.findById({id}, {username:1, email:1})
        const { password, isAdmin, ...oneUser } = result._doc;
        res.json(oneUser);

    } catch (e) {
        // res.status(500).send('Server error');
        res.status(500).json({ msg: 'Server error', error: e.message });
    
    }

});




module.exports = router;
