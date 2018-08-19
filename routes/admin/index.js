const express = require('express');
const router = express.Router();
const post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Category = require('../../models/Category');
const User = require('../../models/User');
const faker = require('faker');
const {userAuthenticated} = require('../../helpers/authentication');

//*** OVERRIDE ROUTE FROM HOME TO ADMIN */
router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

//*** ROUTE TO ADMIN ROOT */
router.get('/', (req, res)=>{

    const promises = [
        post.count().exec(),
        Category.count().exec(),
        Comment.count().exec(),
        User.count().exec()
    ];

    Promise.all(promises).then(([postCount, categoryCount, commentCount, userCount])=>{
        res.render('admin/index', {postCount:postCount, categoryCount: categoryCount, commentCount: commentCount, userCount: userCount});
    });

    /*
    post.count().then(postCount=>{
        Comment.count().then(comCount=>{
            Category.count().then(catCount=>{
                User.count().then(usrCount=>{
                    res.render('admin/index', {postCount: postCount, comCount: comCount, catCount: catCount, usrCount: usrCount});
                });
            });
        });
        
    });
    */
});

//*** ROUTE TO GENERATE FAKE DATA */
router.post('/generate-fake-posts', (req, res)=> {
    for(let i=0; i<req.body.amount; i++){
        let newPost = new post();
        newPost.title = faker.name.title();
        newPost.file = 'placeholder.png';
        newPost.status=faker.random.arrayElement(['public', 'private', 'draft']);
        newPost.allowComments = faker.random.boolean();
        newPost.slug=faker.name.title();
        newPost.body=faker.lorem.sentences();
        newPost.save().then(savedPost=>{
           console.log('FAKE POST GENERATED'); 
        });
    }
    res.redirect('/admin/posts');
    
});


//*** EXPORT ROUTES TO CALLER */
module.exports = router;
