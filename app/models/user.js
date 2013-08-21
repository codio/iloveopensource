/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 3:45 PM
 */

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var sanitizer = require('sanitizer')

var UserSchema = new Schema({
	username: { type: String, required: true, index: { unique: true }, trim: true },
	email: { type: String, match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, trim: true },
	avatar: String,
	type: String,
	displayName: {type: String, trim: true},
	twitterName: {type: String, trim: true},

	contributions: {
		gittip: {type: String, trim: true},
		paypal: {type: String, trim: true},
		flattr: {type: String, trim: true},
		note: {type: String, trim: true},
		emailMe: Boolean,
		code: Boolean
	},

	github: {},
	provider: { type: String, default: '' },
	authToken: { type: String, default: '' }
});

UserSchema.methods.register = function (callback) {
	this.save(callback)
}

UserSchema.post('save', function (doc) {
	var Project = mongoose.model('Project')
	Project.updateOwner(doc)
})

UserSchema.pre('validate', function (next, done) {
	var reg = /^https:\/\/www.paypal(objects)?.com\//
	if (this.support && this.support.paypal) {
		if (this.support.paypal) {
			this.support.paypal = sanitizer.sanitize(this.support.paypal, function (value) {
				return  value.match(reg) ? value : ''
			})
		}
		if (this.support.other) {
			this.support.other = sanitizer.sanitize(this.support.other)
		}
	}
	next();
});

mongoose.model('User', UserSchema);