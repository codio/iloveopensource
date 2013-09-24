/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 8:41 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')

	return Backbone.Collection.extend({
		url: '/supporter/groups',
		currentHasSupport: function() {
			var current = store().currentType

			if (current.type == 'user') {
				return this.findWhere({type: 'User'}).get('hasSupport')
			} else if (current.type == 'org') {
				return this.findWhere({type: 'Organization', org: current.id}).get('hasSupport')
			} else {
				var hasSupport
				this.each(function(group) {
					var found = _.find(group.get('repos'), {_id: current.id})
					if (!found) return
					hasSupport = found.hasSupport
				})
				return hasSupport
			}
		},
		updateCurrentSupport: function(hasSupport) {
			var current = store().currentType

			if (current.type == 'user') {
				this.findWhere({type: 'User'}).set('hasSupport', hasSupport)
			} else if (current.type == 'org') {
				this.findWhere({type: 'Organization', org: current.id}).set('hasSupport', hasSupport)
			} else {

				this.each(function(group) {
					var projects = group.get('repos')
					var found = _.find(projects, {_id: current.id})
					if (!found) return
					found.hasSupport = hasSupport
					group.set('repos', projects)
				})
			}
		},
		comparator: function(item) {
			return [!item.get('type'), item.get('username')]
		}
	})
})