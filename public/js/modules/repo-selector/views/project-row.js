/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var toastr = require('toastr')
	var tpl = require('tpl!../templates/repo-row.html')
	var RepoRow = require('./repo-row')

	return RepoRow.extend({
		initialize: function (options) {
			this.listenTo(store().hub, 'support.update:' + this.model.id, this.updateSupport)
			this.listenTo(this.model, 'request', this.asleep)
			this.listenTo(this.model, 'error', this.errorNotify)
			this.listenTo(this.model, 'sync', this.onSuccess)
			this.listenTo(this.model, 'destroy', this.onDestroy)
		},
		removeWarning: 'If you do not check any icons, this item will be removed. OK?',
		attributes: {
			class: 'repo'
		},
		events: {
			'click .support-type': 'toggleSupport',
			'click .remove': 'removeProject'
		},
		asleep: function () {
			store().hub.trigger('sleep:' + this.model.id)
		},
		awake: function () {
			store().hub.trigger('wakeup:' + this.model.id)
		},
		onSuccess: function () {
			store().hub.trigger('support.set:' + this.model.id, this.model.get('support').toJSON())
			this.awake()
			this.renderSupport()
		},
		updateSupport: function (type, val) {
			if (!val && this.model.get('support').count() == 1) {
				window.confirm(this.removeWarning) && this.removeProject()
			} else {
				this.model.get('support').set(type, val)
				this.model.save()
			}
		},
		errorNotify: function (model, xhr) {
			this.awake()
			toastr.error(xhr.responseText)
		},
		onDestroy: function () {
			var support = this.model.get('support').flat()
			_.each(support, function (val, key) {
				support[key] = false
			})
			store().hub.trigger('support.set:' + this.model.id, support)
			this.awake()
			this.remove()
		},
		removeProject: function () {
			this.model.destroy()
		},
		toggleSupport: function (event) {
			var support = this.model.get('support'),
				type = $(event.currentTarget).data().type,
				val = !support.get(type)

			this.updateSupport(type, val)
		}
	});
})