/**
 * Author: krasu
 * Date: 10/7/13
 * Time: 3:21 PM
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var RequesterSchema = new Schema({
    request: {type: Schema.ObjectId, ref: 'Request'},
    ref: {type: Schema.ObjectId, ref: 'User'},
    username: {type: String, trim: true },
    email: {type: String, trim: true },
    isAnon: {type: Boolean, default: false},
    ip: {type: String, trim: true }
})
mongoose.model('Requester', RequesterSchema)
