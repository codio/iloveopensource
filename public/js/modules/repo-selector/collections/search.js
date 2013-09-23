/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 1:24 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var Repos = require('./repos')

	return Repos.extend({
		path: 'search/repositories',
		type: 'search',
		fetchRepo: function (owner, name) {
			var path = this.path, self = this
			this.path = 'repos/' + owner + '/' + name
			return this.fetch().always(function() {
				self.path = path
			})
		}
	})
})