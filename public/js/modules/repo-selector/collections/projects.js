/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/14/13
 * Time: 12:25 AM
 */
define(function (require) {
	require('backbone')

	var Project = require('../models/project')

	return Backbone.Collection.extend({
		url: '/save-projects',
		model: Project,
		save: function (options) {
			return this.sync('update', this, options);
		}
	})
})