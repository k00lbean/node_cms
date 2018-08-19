const mongoose = require('mongoose');

const schema = mongoose.Schema;

const commentSchema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'users',
        required: true
    }, 
    body: {
        type: String,
        required: true
    }, 
    approveComment: {
        type: Boolean, 
        default: false
    },
    date:{
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('comments', commentSchema);