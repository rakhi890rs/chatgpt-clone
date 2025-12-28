const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
    const { fullname: { firstName, lastName }, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User already exists" }); // added return
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullname: { firstName, lastName },
        email,
        password: hashPassword // added password
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // fixed user_id -> user._id

    res.cookie("token", token);

    res.status(201).json({
        message: "user registered successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullname: user.fullname
        }
    });
}

module.exports = { registerUser };
