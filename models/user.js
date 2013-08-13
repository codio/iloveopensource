/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 3:45 PM
 */

var mongoose = require('mongoose')
var Schema = mongoose.Schema
	, ObjectId = Schema.ObjectId;

var User = new Schema({
	displayName: ObjectId,
	gitHubId: Number,
	username: String,
	gitHubUrl: String,
	avatar: String,
	type: String,
	created: Date
});

var Repo = new Schema({
	belongsTo: ObjectId,
	gitHubId: Number,
	name: String,
	gitHubUrl: String,
	type: String
});

var Project = new Schema({
	gitHubId: Number,
	name: String,
	gitHubUrl: String
});