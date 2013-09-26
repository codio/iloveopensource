/**
 * Author: krasu
 * Date: 9/25/13
 * Time: 10:52 AM
 */
define(function (require) {
	require('backbone')

	var store = require('store').getNamespace('repo-selector')
	var tpl = require('tpl!../templates/group-selector.html')

	return Backbone.View.extend({
		initialize: function () {
			this.listenTo(store().groups, 'sync', this.render)
			this.listenTo(store().selected, 'add', this.addHeart)
			this.listenTo(store().selected, 'remove', this.removeHeart)
			$('body').on('github-info-updated', this.updateGroups)
		},
		events: {
			'click a[role="menuitem"]': 'selectGroup'
		},
		updateGroups: function() {
			store().groups.fetch()
		},
		addHeart: function () {
			if (!store().groups.currentHasSupport()) {
				store().groups.updateCurrentSupport(true)
				this.render()
			}
		},
		removeHeart: function (model, collection) {
			if (collection.length) return
			store().groups.updateCurrentSupport(false)
			this.render()
		},
		selectGroup: function (event) {
			var el = $(event.currentTarget)
			this.$('.value').text(el.data().val || el.text())
		},
		render: function () {
			this.$el.html(tpl({
				groups: store().groups.toJSON(),
				current: store().currentType
			}))

			return this
		}
	});
})