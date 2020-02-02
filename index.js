require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { User } = require("./user");

app.use(express.json());
app.use(passport.initialize());
// seed user
User.deleteMany({}, () => {
    const seed_user = new User({ username: 'duc0905' });
    seed_user.setPassword('abcd1234')
        .then(() => seed_user.save())
        .catch((err) => console.log(err));
});

let refreshTokens = [];

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;

    if(refreshToken === null) {
        return res.sendStatus(401);
    }

    if(!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(403);
        }

        const accessToken = generateAccessToken({name: user.name});
        res.json({accessToken});
    });
})

app.post("/login", passport.authenticate('local'), (req, res) => {
    console.log(req.body);
    const username = req.body.username;
    const user = {name: username}

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({accessToken, refreshToken});
})

app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);

    console.log("succeed");
    res.sendStstus(204);
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}

function verify(req, res, next) {
    if (!req.headers.authorization) {
        return res.sendStatus(403);
    }

    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(user);
        if (err) {
            res.json(err);
        } else {
            req.user = {
                name: user.user
            }
            next();
        }
    })
}


app.listen(4000, (err) => {
    console.log(`Server is running on port 4000`);
});
