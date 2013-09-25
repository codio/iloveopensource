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
		url: '/supporter/groups',
		parse: function (data) {
			_.each(data, function (entry) {
				entry.repos = new Projects(entry.repos)
			})

			return data
		},
		findCurrent: function () {
			var current = store().currentType,
				entity

			if (current.type == 'user') {
				entity = this.findWhere({type: 'User'})
			} else if (current.type == 'org') {
				entity = this.findWhere({type: 'Organization', org: current.id})
			} else {
				this.each(function (group) {
					var found = group.get('repos').findWhere({_id: current.id})
					if (!found) return
					entity = found
				})
			}

			return entity
		},
		currentHasSupport: function () {
			var current = this.findCurrent()

			if (!current) return false

			return current.get('hasSupport')
		},
		updateCurrentSupport: function (hasSupport) {
			var current = this.findCurrent()

			if (!current) return false

			current.set('hasSupport', hasSupport)
		},
		comparator: function (item) {
			return [item.get('type') != 'user', item.get('username')]
		}
	})
})