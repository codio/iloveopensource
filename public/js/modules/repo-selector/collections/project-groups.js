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
				return this.find({type: 'User'}).get('hasSupport')
			} else if (current.type == 'org') {
				return this.find({type: 'Organization', org: current.id}).get('hasSupport')
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
				this.find({type: 'User'}).set('hasSupport', hasSupport)
			} else if (current.type == 'org') {
				this.find({type: 'Organization', org: current.id}).set('hasSupport', hasSupport)
			} else {

				this.each(function(group) {
					var projects = group.get('repos')
					var found = _.find(projects, {_id: current.id})
					if (!found) return
					console.log(found)
					found.hasSupport = hasSupport
					console.log(projects)
					group.set('repos', projects)
				})
			}
		},
		comparator: function(item) {
			return [!item.get('type'), item.get('username')]
		}
	})
})