/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 8:39 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')

	return Backbone.Router.extend({
		routes: {
			'*actions': 'selected'
		},
		selected: function (hash) {
			hash = hash || 'selected-repos'
			var el = store().layout.$('.nav a[href="#' + hash + '"]')
			el.tab('show')
		}
	});
})
