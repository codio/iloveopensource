/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var tpl = require('tpl!../templates/repo-row.html')
	var DonateMethods = require('common/views/donate-methods')

	return Backbone.View.extend({
		initialize: function (options) {
			this.listenTo(store().hub, 'support.set:' + this.model.id, this.updateSupport)
			this.listenTo(store().hub, 'wakeup:' + this.model.id, this.unsetLoading)
			this.listenTo(store().hub, 'sleep:' + this.model.id, this.setLoading)
		},
		attributes: {
			class: 'repo'
		},
		events: {
			'click .support-type': 'toggleSupport'
		},
		setLoading: function () {
			this.undelegateEvents()
			this.$el.addClass('loading')
		},
		unsetLoading: function () {
			this.delegateEvents()
			this.$el.removeClass('loading')
		},
		updateSupport: function (support) {
			this.model.get('support').set(support)
			this.renderSupport()
		},
		renderSupport: function () {
			var types = this.$('.support-type')
			_.each(this.model.get('support').flat(), function (val, type) {
				types.filter('.' + type).toggleClass('active', val)
			})
		},
		toggleSupport: function (event) {
			var support = this.model.get('support'),
				type = $(event.currentTarget).data().type,
				val = !support.get(type),
				exists = store().selected.get(this.model.id)

			if (exists) {
				store().hub.trigger('support.update:' + this.model.id, type, val)
			} else {
				var newModel = this.model.toJSON()
				newModel.support[type] = val
				store().selected.create(newModel, {parse: true})
			}
		},
		render: function () {
			this.model.get('fork') && this.$el.addClass('fork')
			this.$el.html(tpl({
				repo: this.model.toJSON(),
				canDelete: this.model.isProject
			}))

			this.donateMethods = new DonateMethods({
				model: this.model,
				needHelp: true
			})
			this.donateMethods.render().$el.insertAfter(this.$('.support-types'))

			if (!this.model.isProject) {
				var projectData = this.model.toJSON(),
					els = this.$('.want-contribute, .email-to-author')

				if (els.length) els.data().projectData = this.model.toJSON()
			}

			return this
		},
		remove: function() {
			this.donateMethods && this.donateMethods.remove()
			Backbone.View.prototype.remove.apply(this, arguments)
		}
	});
})