/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 6:19 PM
 */
define(function (require) {
	require('plugins/activate-plugins')
	var toastr = require('toastr')

	$(function () {
		var projectId = window.location.pathname.split('/').pop()

		$('.support-type').on('click', function (event) {
			var el = $(this)

			if (el.prop('disabled')) return

			el.prop('disabled', true)
			$.get('/subscribe/' + el.data().type + '/' + projectId + '/' + !el.hasClass('active'))
				.done(function () {
					el.toggleClass('active')
				})
				.fail(function (xhr) {
					console.log(arguments)
					toastr.error(xhr.responseText)
				})
				.always(function() {
					el.removeProp('disabled')
				})
		})
	})
})