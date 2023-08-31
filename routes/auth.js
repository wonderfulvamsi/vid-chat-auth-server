const router = require("express").Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const [verify_token, generateAccessToken, generateRefreshToken] = require('../controller/jwtFunctions');
var refreshTokens = [];

//REGISTER
router.post("/signup", async (req, res) => {
    try {
        if (await User.findOne({ email: req.body.email })) {
            res.status(200).send("already registered!");
        }
        else{
            //generate new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            //create new user
            const newUser = new User({
                email: req.body.email,
                password: hashedPassword,
            });

            //save user and respond
            const user = await newUser.save();
            const accessToken = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user)

            refreshTokens.push(refreshToken);
            res.status(200).json({
                user,
                'accesstoken': accessToken,
                'refreshtoken': refreshToken
            });
        }
    } catch (err) {
        res.status(500).json(err)
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(200).json(null);
        }
        else {
            const validPassword = await bcrypt.compare(req.body.password, user.password)
            if (!validPassword) {
                res.status(200).json(null);
            }
            else {
                const accessToken = generateAccessToken(user)
                const refreshToken = generateRefreshToken(user)

                refreshTokens.push(refreshToken);
                res.status(200).json({
                    user,
                    'accesstoken': accessToken,
                    'refreshtoken': refreshToken
                })
            }
        }
    } catch (err) {
        res.status(500).json(err)
    }
});

//Refresh token 
router.post("/jwt/refresh", (req, res) => {
    //take the refresh token from the user
    const refreshToken = req.body.token;

    //send error if there is no token or it's invalid
    if (!refreshToken) return res.status(401).json("You are not authenticated!");
    if (refreshTokens.length) {
        //check *only* if there exisits any tokes in the array else the first entry will always give thia error
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh token is not valid!");
        }
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_PRIVATE_KEY, (err, user) => {
        err && console.log(err);
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.push(newRefreshToken);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    });
});

module.exports = router;