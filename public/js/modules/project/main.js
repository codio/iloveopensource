/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 6:19 PM
 */
define(function (require) {
	require('plugins/activate-plugins')
	var toastr = require('toastr')

	$(function () {
		var projectId = window.location.pathname.split('/').pop()
		var usersList = $('.users')

		$('.donate .toggle').on('click', function (event) {
			var btn = $(this), methods = btn.parent().find('.methods')
			btn.slideUp()
			methods.slideDown()
		})

		if (!currentUserName) return

		$('.support-type').on('click', function (event) {
			var el = $(this),
				href = '/users/' + currentUserName,
				newState = !el.hasClass('active')

			if (el.prop('disabled')) return

			el.prop('disabled', true)
			$.get('/projects/' + projectId + '/subscribe/' + el.data().type + '/' + newState)
				.done(function () {
					var container = usersList.find('.col.' + el.data().type),
						counter = container.find('.counter')

					if (newState) {
						var link = $('<a>').text(currentUserName).attr('href', href)
						container.append(link)
						counter.text(parseInt(counter.text()) + 1)
					} else {
						container.find('a[href="' + href + '"]').remove()
						counter.text(parseInt(counter.text()) - 1)
					}
					el.toggleClass('active')
				})
				.fail(function (xhr) {
					toastr.error(xhr.responseText)
				})
				.always(function () {
					el.removeProp('disabled')
				})
		})
	})
})