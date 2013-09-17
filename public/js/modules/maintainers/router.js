/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 8:39 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('maintainer')

	return Backbone.Router.extend({
		routes: {
			'settings/:project': 'settings'
		},
		settings: function (project) {
			store().layout.showSettings(project)
		}
	});
})
