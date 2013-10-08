/**
 * Author: krasu
 * Date: 10/7/13
 * Time: 3:21 PM
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

var RequesterSchema = new Schema({
    request: {type: Schema.ObjectId, ref: 'Request'},
    ref: {type: Schema.ObjectId, ref: 'User'},
    username: {type: String, trim: true },
    email: {type: String, trim: true },
    isAnon: {type: Boolean, default: false},
    ip: {type: String, trim: true }
})

RequesterSchema.path('email').validate(function (email) {
    if (email) return emailRegExp.test(email);
    return true
}, 'Email field contain not an email')

mongoose.model('Requester', RequesterSchema)
