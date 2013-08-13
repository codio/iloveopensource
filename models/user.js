/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 3:45 PM
 */

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
	username: { type: String, required: true, index: { unique: true } },
	displayName: String,
	type: String,
	avatar: String,
	github: {},
	provider: { type: String, default: '' },
	authToken: { type: String, default: '' }
});

mongoose.model('User', UserSchema);