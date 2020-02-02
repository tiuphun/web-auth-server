const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/developing', {
    dbName: 'test',
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Successfully connected to mongo local');
    })
    .catch((err) => {
        console.error(err);
    })

const userSchema = new mongoose.Schema({
    // 
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = {
    User
}
