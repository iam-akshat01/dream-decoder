const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const secretkey = process.env.JWT_SECRET;
const saltRounds = 10;

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username, email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedpass = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({ username, email, password: hashedpass });

    const token = jwt.sign({ id: newUser._id, email }, secretkey, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const checkUser = await User.findOne({ username });
    if (!checkUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const result = await bcrypt.compare(password, checkUser.password);
    if (!result) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: checkUser._id, email: checkUser.email },
      secretkey,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: checkUser._id,
        username: checkUser.username,
        email: checkUser.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
