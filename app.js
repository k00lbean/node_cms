//*** INCLUDE LIBRARIES */
const express = require('express');
const path = require('path');
const expressHB = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const fileUploads = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

//*** LOAD ROUTES */
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

//*** LOAD HELPER FUNCTION */
const {select, generateDate, paginate} = require('./helpers/handlebars-helpers');
const {mongoDbUrl} = require('./config/database');

//*** GLOBAL VARS */
const app = express();
const appPort = process.env.PORT || 4500;

mongoose.Promise = global.Promise;

//*** CONNECT TO THE MONGODB DATABASE */
mongoose.connect(mongoDbUrl).then((db)=>{
    console.log('MONGODB CONNECTED')
}).catch(error=> {
    console.log('COULD NOT CONNECT TO MONGODB. ERROR=' + error);
});

//*** TIE TO PUBLIC SUBDIR */
app.use(express.static(path.join(__dirname, 'public')));

//*** SET VIEW ENGINE */
//*** LOOK FOR views/layouts/home.handlebars WHEN RENDER - handlebars ENGINE*/
app.engine('handlebars', expressHB({defaultLayout: 'home', helpers:{select: select, generateDate: generateDate, paginate: paginate}}));
app.set('view engine', 'handlebars');

//*** Upload Middleware */
app.use(fileUploads());

//*** USE BODY PARSER */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//*** Method Override */
app.use(methodOverride('_method'));

//*** Use SESSION */
app.use(session({
    secret: 'bean',
    resave: true,
    saveUninitialized: true
}));

//*** Use FLASH */
app.use(flash());

//*** Use PASSWORD Authentication */
app.use(passport.initialize());
app.use(passport.session());

//** Load variables using middleware */
app.use((req, res, next)=>{
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//*** USE ROUTES */
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

//*** LISTEN FOR PORT */
app.listen(appPort, ()=>{
    console.log(`listening on port ${appPort}`);
});