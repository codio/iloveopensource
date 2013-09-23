/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 6:20 PM
 */
define(function (require) {
	require('backbone')
	require('bootstrap')

	var View = Backbone.View.extend({
		events: {
			'change [data-field]': 'updateField',
			'focus [data-field]': 'resetField',
			'click .embed': 'selectAlltext'
		},
		selectAllText: function(event) {
			$(event.currentTarget).select()
		},
		updateField: function (event) {
			var el = $(event.currentTarget),
				field = el.data().field,
				val = $.trim(el.val())

			if (el.attr('required') && !val) {
				return this.setError(el)
			}

			if (el.attr('type') == 'checkbox') {
				val = el.prop('checked')
			}

			this.saveField(field, el, val)
		},
		setSuccess: function (field) {
			var group = field.closest('.form-group')
			group.removeClass('has-error').addClass('has-success')
			group.find('.saved').show().fadeOut(3000, function () {
				group.removeClass('has-success')
			})
		},
		saveField: function (field, el, val) {
			$.post('/settings/' + field, {value: val})
				.done(_.bind(this.setSuccess, this, el))
				.fail(_.bind(this.setError, this, el))
		},
		resetField: function (event) {
			$(event.currentTarget).closest('.form-group').removeClass('has-error has-success')
		},
		setError: function (field) {
			var group = field.closest('.form-group')
			group.addClass('has-error').removeClass('has-success')
			group.find('.saved').stop().hide()
		}
	})

	$(function () {
		var view = new View({
			el: $('#page-settings')
		})

		view.$('.form-group')
			.on('mouseover', '.help, .popover', function () {
				var group = $(this).closest('.form-group'),
					popover = group.find('.popover'),
					help = group.find('.help')

				popover.show().css('top', -(popover.outerHeight() / 2 + help.position().top - help.height()))
			})
			.on('mouseout', '.help, .popover', function () {
				$(this).closest('.form-group').find('.popover').hide()
			})
	})
})