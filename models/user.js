const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'First name is required']},
    lastName: {type: String, required: [true, 'Last name is required']},
    email: {type: String, required: [true, 'Email is required'],unique
},
{timestamps: true}
);
module.exports = mongoose.model('User', userSchema);