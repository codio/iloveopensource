/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/14/13
 * Time: 12:25 AM
 */
define(function (require) {
	require('backbone')

	var Repo = require('modules/repo-selector/models/repo')

	return Backbone.Collection.extend({
		model: Repo
	})
})