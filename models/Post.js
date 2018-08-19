const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const schema = mongoose.Schema;

const postSchema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    category:{
        type: schema.Types.ObjectId, 
        ref: 'categories'
    }, 
    title: {
        type: String,
        required: true
    }, 
    status: {
        type: String,
        default: 'public'
    }, 
    allowComments: {
        type: Boolean,
        required: true
    }, 
    body: {
        type: String,
        required: true
    }, 
    file:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now()
    },
    slug: {
        type: String
    }, 
    comments: [{
        type: schema.Types.ObjectId,
        ref: 'comments'
    }]
});

postSchema.plugin(URLSlugs('title', {field: 'slug'}));

module.exports = mongoose.model('posts', postSchema);


