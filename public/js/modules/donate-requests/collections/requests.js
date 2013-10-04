/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 8:41 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var Projects = Backbone.Collection.extend({})

	return Backbone.Collection.extend({
		url: '/service/requests'
	})
})