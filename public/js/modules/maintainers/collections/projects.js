/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 8:41 AM
 */
define(function (require) {
	require('backbone')

	var Project = require('../models/project')

	return Backbone.Collection.extend({
		url: '/maintaining-projects',
		model: Project,
		save: function (options) {
			return this.sync('update', this, options);
		}
	})
})