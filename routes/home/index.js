const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const router = express.Router();
const post = require('../../models/Post');
const category = require('../../models/Category');
const User = require('../../models/User');

//*** OVERRIDE ROUTE TO HOME */
router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'home';
    next();
});

//*** ROUTE TO ROOT */
router.get('/', (req, res)=>{

    const perPage = 10;
    const page = req.query.page || 1;

    post.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .then(posts=>{
        post.count().then(postCount=>{
            category.find({}).then(categories=>{
                res.render('home/index', {
                    posts:posts, 
                    categories:categories,
                    current: parseInt(page),
                    pages: Math.ceil(postCount / perPage)
                });        
            });
        }); 
    });
});

//*** ROUTE TO LOGIN */
router.get('/login', (req, res)=>{
    res.render('home/login');
});

//*** APP LOGIN ROUTE */

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{

    User.findOne({email: email}).then(user=>{
        if(!user)
            return done(null, false, {message: 'No user found'});
        
        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err)
                return err;
            if(matched)
                return done(null, user)
            else
                return done(null, false, {message: 'Incorrect password'});
        });

    });

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login', (req, res, next)=>{

    passport.authenticate('local', {
        successRedirect: '/admin', 
        failureRedirect: '/login', 
        failureFlash: true
    })(req, res, next);

});

router.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/login');
});

//*** ROUTE TO REGISTER */
router.get('/register', (req, res)=>{
    res.render('home/register');
});

//*** ROUTE TO REGISTER POST */
router.post('/register', (req, res)=>{
    let errors = [];

    if (!req.body.firstName) {
        errors.push({message: 'please add a first name'});
    }
    if (!req.body.lastName) {
        errors.push({message: 'please add a last name'});
    }
    if (!req.body.email) {
        errors.push({message: 'please add an email'});
    }
    if (!req.body.password) {
        errors.push({message: 'please add a password'});
    }
    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({message: 'password fields do not match'});
    }

    if (errors.length > 0) {

        res.render('home/register', {
            errors: errors, 
            firstName: req.body.firstName, 
            lastName: req.body.lastName, 
            email: req.body.email
        });
    }
    else {

        User.findOne({email: req.body.email}).then(user=>{
            if (!(user)) {
                const newUser = new User({
                    firstName: req.body.firstName, 
                    lastName: req.body.lastName, 
                    email: req.body.email, 
                    password: req.body.password
                });
        
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        newUser.password = hash;
                        newUser.save().then(savedUser=>{
                            req.flash('success_msg', 'You are now registered, please login');
                            res.redirect('/login');
                        });
                    });
                });
            }
            else {
                req.flash('error_msg', 'That email already exists so please login');
                res.redirect('/login');
            }
        });     
    }
    
});

//*** ROUTE TO ABOUT */
router.get('/about', (req, res)=>{
    res.render('home/about');
});

//*** ROUTE TO ABOUT */
router.get('/post/:slug', (req, res)=>{
    post.findOne({slug: req.params.slug})
        .populate({path: 'comments', match: {approveComment: true}, populate: {path:'user', model: 'users'}})
        .populate('user')
        .then(post=>{
            category.find({}).then(categories=>{
                res.render('home/post', {post: post, categories:categories});        
            });
    });
});

//*** EXPORT ROUTES TO CALLER */
module.exports = router;
