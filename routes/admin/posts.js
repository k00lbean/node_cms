const express = require('express');
const router = express.Router();
const post = require('../../models/Post');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const category = require('../../models/Category');
const fs = require('fs');
const placeholder_filename = 'placeholder.png';
const dirUploads = './public/uploads/';
const {userAuthenticated} = require('../../helpers/authentication');

//*** OVERRIDE ROUTE FROM HOME TO ADMIN */
router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

//*** ROUTE TO POSTS ROOT */
router.get('/', (req, res)=>{
    post.find({})
        .populate('category')
        .then(posts=>{
            res.render('admin/posts', {posts:posts});
    });
    
});

router.get('/my-posts', (req, res)=>{
    post.find({user: req.user.id})
        .populate('category')
        .then(posts=>{
            res.render('admin/posts/my-posts', {posts: posts});
        });
})

//*** CREATE A POST*/
router.get('/create', (req, res)=>{
    category.find({}).then(cat=>{
        res.render('admin/posts/create', {cat:cat});
    });
});

//*** ACCEPT AND SAVE NEW POST */
router.post('/create', (req, res)=>{
    let filename = placeholder_filename;
    let errors = [];

    if (!req.body.title) {
        errors.push({message: 'please add a title'});
    }
    if (!req.body.body) {
        errors.push({message: 'please add a description body'});
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    }
    else {
        if (!(isEmpty(req.files))) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
        
            file.mv(dirUploads + filename, (err)=>{
                if (err)
                    throw err
            });
        }
    
        let allowComments = false;
    
        if (req.body.allowComments)
            allowComments=true;
        else
            allowComments=false;
    
        const newPost = new post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            file: filename, 
            category: req.body.category
        });
    
        newPost.save().then(savedPost=>{
            console.log('NEW POST CREATED');
            req.flash('success_msg', `Post '${savedPost.title}' was created successfully`);
            res.redirect('/admin/posts');
        }).catch(error=> {
            console.log('COULD NOT CREATE NEW POST. ERROR=' + error);
        });
    }
});

//*** EDIT A POST*/
router.get('/edit/:id', (req, res)=>{

    post.findOne({_id: req.params.id}).then(post=>{
        category.find({}).then(cat=>{
            res.render('admin/posts/edit', {post: post, cat:cat});
        });
    });

});

//*** UPDATE A POST*/
router.put('/edit/:id', (req, res)=>{

    post.findOne({_id: req.params.id}).then(post=>{
        let allowComments = false;

        if (req.body.allowComments)
            allowComments=true;
        else
            allowComments=false

         post.user = req.user.id;
         post.title = req.body.title;
         post.status = req.body.status;
         post.allowComments = allowComments;
         post.body = req.body.body;
         post.category = req.body.category;

         let filename = placeholder_filename;
         let errors = [];
     
         if (!req.body.title) {
             errors.push({message: 'please add a title'});
         }
         if (!req.body.body) {
             errors.push({message: 'please add a description body'});
         }
     
         if (errors.length > 0) {
             res.render(`admin/posts/edit/${req.params.id}`, {
                 errors: errors
             });
         }
         else {
             if (!(isEmpty(req.files))) {
                 let file = req.files.file;
                 filename = Date.now() + '-' + file.name;
                 
                 file.mv(dirUploads + filename, (err)=>{
                     if (err)
                         throw err
                 });
             }
             post.file = filename;
         }
         post.save().then(updatedPost=>{
            console.log('POST UPDATED (ID=' + req.params.id + ')');
            req.flash('success_msg', `Post '${req.params.id}' was successfully updated`);
            res.redirect('/admin/posts/my-posts');
         }).catch(error=>{
            console.log('COULD NOT UPDATE POST (ID=' + req.params.id + ') ERROR=' + error);
         });
    });
});

//** DELETE A POST */
router.delete('/:id', (req, res)=>{
    post.findOne({_id: req.params.id})
        .populate('comments')
        .then(post=>{
            if (post.file != placeholder_filename) {
                fs.unlink(uploadDir + post.file, (err)=>{
                    if (err)
                        throw err;
                });
            }
            if (!post.comments.length < 1) {
                post.comments.forEach(singleComment => {
                    singleComment.remove();
                });
            }
            post.remove().then(postRemoved=>{
                console.log('POST DELETED (ID=' + req.params.id + ')');
                req.flash('success_msg', `Post '${req.params.id}' was successfully deleted`);
                res.redirect('/admin/posts/my-posts');
            });

    }).catch(error=>{
        console.log('COULD NOT DELETE POST (ID=' + req.params.id + ') ERROR=' + error);
    });
});

//*** EXPORT ROUTES TO CALLER */
module.exports = router;
