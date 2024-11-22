const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email) return res.status(400).send({ errors: { email: { kind: 'required' } } });

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).send('User already registered.');

        user = new User({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();

        const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
        const token = jwt.sign({ _id: user._id }, jwtPrivateKey);
        res.header('x-auth-token', token).send({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Server error');
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.send({ token });
});

module.exports = router;
