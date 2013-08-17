/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var tpl = require('tpl!../templates/repo-row.html')

	return Backbone.View.extend({
		initialize: function (options) {
			this.listenTo(store().hub, 'changed:' + this.model.get('url'), this.renderSupportChange)
			this.listenTo(store().hub, 'removed:' + this.model.get('url'), this.removeSupport)
		},
		attributes: {
			class: 'repo row'
		},
		events: {
			'click .support-type': 'toggleSupport',
			'click .remove-icon': 'removeProject'
		},
		removeProject: function () {
			this.model.destroy()
			this.remove()
			store().hub.trigger('removed:' + this.model.get('url'))
		},
		renderSupportChange: function (type, value) {
			this.$('.support-type.' + type).toggleClass('active', value)
			this.model.get('support').set(type, value)

			this.options.isProject && console.log(this.model.get('support').isEmpty())
			if (this.options.isProject && this.model.get('support').isEmpty()) {
				this.model.destroy()
				this.remove()
			}
		},
		removeSupport: function () {
			this.$('.support-type').toggleClass('active', false)
			this.model.get('support').clear()
		},
		toggleSupportByType: function (type, value) {
			var support = this.model.get('support')

			support.set(type, typeof value === 'undefined' ? !support.get(type) : value)

			store().hub.trigger('changed:' + this.model.get('url'), type, this.model.get('support').get(type))

			if (!this.options.isProject && !this.model.get('support').isEmpty()
				&& !store().selected.get(this.model.id)
				) {
				store().selected.add(this.model)
			}
		},
		toggleSupport: function (event) {
			this.toggleSupportByType($(event.currentTarget).data().type)
		},
		render: function () {
			this.model.get('fork') && this.$el.addClass('fork')
			this.$el.html(tpl({
				repo: this.model.toJSON(),
				canDelete: this.model.isProject
			}))
			return this
		}
	});
})