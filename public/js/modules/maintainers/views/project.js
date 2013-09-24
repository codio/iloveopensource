/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 1:46 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('maintainer')
	var tpl = require('tpl!../templates/project.html')
	var ProjectSettings = require('./project-settings')
	var DonateMethods = require('common/views/donate-methods')

	return Backbone.View.extend({
		attributes: {
			class: 'repo'
		},
		events: {
			'click .settings-toggler': 'toggleSettings'
		},
		initialize: function () {
			this.listenTo(this.model, 'sync', this.updateDonateMethods)
		},
		updateDonateMethods: function () {
			this.donateMethods.render()
		},
		render: function () {
			this.model.get('fork') && this.$el.addClass('fork')

			this.$el.html(tpl({
				project: this.model.toJSON()
			}))

			this.donateMethods = new DonateMethods({
				model: this.model,
				needHelp: false
			})
			this.donateMethods.render().$el.insertAfter(this.$('.repo-name'))

			return this
		},
		remove: function() {
			this.donateMethods.remove()
			Backbone.View.prototype.remove.apply(this, arguments)
		},
		toggleSettings: function () {
			var btn = this.$('.settings-toggler'),
				altText = btn.data().altText,
				settingsEl = this.$('.settings')

			if (btn.prop('disabled')) return

			if (!this.settings) {
				this.settings = new ProjectSettings({
					model: this.model,
					el: settingsEl
				})

				this.settings.render()
				this.settings.rendered = true
			}

			btn.prop('disabled', true)
			settingsEl.slideToggle(function () {
				btn.data().altText = btn.text()
				btn.text(altText)
				btn.removeProp('disabled')
			})
		}
	});
})