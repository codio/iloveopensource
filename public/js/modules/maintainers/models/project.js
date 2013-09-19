/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 8:41 PM
 */
define(function (require) {
	require('backbone')

	return Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: '/maintaining-projects'
	})
})