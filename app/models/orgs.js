/**
 * Author: krasu
 * Date: 9/18/13
 * Time: 14:21 AM
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	gravatarRegexp = /gravatar.com\/avatar\/([0-9a-z]+)/i

var OrganizationSchema = new Schema({
	githubId: {type: Number, default: 0, index: {unique: true}},
	name: String,
	gravatar: String,
	admins: [{type: Schema.ObjectId, ref: 'User', index: true}]
})

OrganizationSchema.statics.parseGitHubData = function (entry) {
	var gravatar = entry.avatar_url.match(gravatarRegexp)
	return {
		githubId: entry.id,
		name: entry.login,
		gravatar: gravatar ? gravatar[1] : '',
		admins: []
	}
}

mongoose.model('Organization', OrganizationSchema)