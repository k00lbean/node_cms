const express = require('express');
const router = express.Router();
const category = require('../../models/Category');

//*** OVERRIDE ROUTE FROM HOME TO ADMIN */
router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

//*** ROUTE TO ADMIN ROOT - SHOW ALL CATEGORIES AND ADD NEW CATEGORY */
router.get('/', (req, res)=>{
    category.find({}).then(categories=>{
        res.render('admin/categories/index', {categories:categories});
    });
});

//*** CREATE A CATEGORY  */
router.post('/create', (req, res)=>{
    const newCat = category({
        name: req.body.name
    });
    newCat.save().then(savedCat=>{
        res.redirect('/admin/categories');
    });
    
});

//*** EDIT A CATEGORY*/
router.get('/edit/:id', (req, res)=>{
    category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit', {category: category});
    });
});


//*** UPDATE A CATEGORY*/
router.put('/edit/:id', (req, res)=>{

    category.findOne({_id: req.params.id}).then(cat=>{
        cat.name = req.body.name;
        cat.date = Date.now();

        cat.save().then(updatedCat=>{
            res.redirect('/admin/categories');
        });
    });
});

//** DELETE A CATEGORY */
router.delete('/:id', (req, res)=>{
    category.findOne({_id: req.params.id})
        .then(cat=>{
            cat.remove();
            res.redirect('/admin/categories');
    });
});

//*** EXPORT ROUTES TO CALLER */
module.exports = router;
