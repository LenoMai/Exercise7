// controllers/userController.js
const model = require('../models/user');
const Story = require('../models/story');

exports.new = (req, res) => {
    res.render('./user/new');
};

exports.create = (req, res, next) => {
    // Create a new user document
    let user = new model(req.body);
    // Save the user document to the database
    user.save()
    .then(user => {
        req.session.user = user._id; 
        req.flash('success', 'You have successfully registered!');
        res.redirect('/users/profile');
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            res.redirect('/users/new');
        }
        
        if(err.code === 11000) {
            req.flash('error', 'Email address exist in our database');
            res.redirect('/users/new');
        }
        
        next(err);
    });
};

exports.getUserLogin = (req, res) => {
    res.render('./user/login');
};

exports.login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address. Try again.');
            res.redirect('/users/login');
        } else if (user.password !== password) {
            req.flash('error', 'Wrong password. Try again.');
            res.redirect('/users/login');
        } else {
            req.session.user = user._id;
            req.flash('success', 'You have successfully logged in!');
            res.redirect('/users/profile');
        }
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    if(!id) {
        req.flash('error', 'You need to login first before you access these.');
        return res.redirect('/users/login');
    }
    
    Promise.all([model.findById(id), Story.find({ author: id })])
    .then(results => {
        const [user, stories] = results;
        res.render('./user/profile', { user, stories });
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if(!err){
            req.flash('success', 'You have successfully logged out');
            res.redirect('/');
        } else {
            return next(err);
        }
    });
};