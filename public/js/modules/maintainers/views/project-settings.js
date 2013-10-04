/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 1:46 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('maintainer')
	var tpl = require('tpl!../templates/project-settings.html')

	return Backbone.View.extend({
		attributes: {
			class: 'repo'
		},
		events: {
			'change [data-field]': 'updateField',
			'focus [data-field]': 'resetField',
			'click .set-account-email': 'setAccountEmail',
			'click .embed': 'selectAllText'
		},
		setAccountEmail: function(event) {
			event.preventDefault()
			if (!currentUserEmail) return
			this.$('[data-field="emailMe"]').val(currentUserEmail).trigger('change')
		},
		selectAllText: function(event) {
			$(event.currentTarget).select()
		},
		updateField: function (event) {
			var el = $(event.currentTarget),
				field = el.data().field,
				val = $.trim(el.val()),
				methods = this.model.get('donateMethods') || {}

			if (el.attr('type') == 'checkbox') {
				val = el.prop('checked')
			}

			methods[field] = val
			this.model.save('donateMethods', methods, {patch: true})
				.done(_.bind(this.setSuccess, this, el))
				.fail(_.bind(this.setError, this, el))
		},
		setSuccess: function (field) {
            field.val(this.model.get('donateMethods')[field.data().field])
			var group = field.closest('.form-group')
			group.removeClass('has-error').addClass('has-success')
			group.find('.saved').show().fadeOut(3000, function () {
				group.removeClass('has-success')
			})
		},
		resetField: function (event) {
			$(event.currentTarget).closest('.form-group').removeClass('has-error has-success')
		},
		setError: function (field) {
			var group = field.closest('.form-group')
			group.addClass('has-error').removeClass('has-success')
			group.find('.saved').stop().hide()
		},
		render: function () {
			this.$el.html(tpl({
				project: this.model.toJSON()
			}))

			return this
		}
	});
})