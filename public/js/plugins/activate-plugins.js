/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/21/13
 * Time: 7:21 AM
 */
define(function(require) {
	require('jquery')
	require('bootstrap')

	$(function () {
		var emailToAuthor = $('#email-to-author'),
			noteFromAuthor = $('#note-from-author'),
			requestContribution = $('#need-contribution-ways')

		$('body').tooltip({
			selector: '[data-toggle="tooltip"]'
		});

		$('body')
			.on('click', '.email-to-author', function (event) {
				emailToAuthor.modal('show').data().project = $(event.currentTarget).data().project
			})
			.on('click', '.want-contribute', function (event) {
				requestContribution.modal('show').data().project = $(event.currentTarget).data().project
			})
			.on('click', '.note-from-author', function (event) {
				noteFromAuthor.find('.modal-body')
					.html($(event.currentTarget).closest('.contribution').find('.content').html())
				noteFromAuthor.modal('show')
			});

		requestContribution.on('click', 'send', function(event) {
//			event
//			var message
//			$.post('/request-contribution', {
//				message: requestContribution.find('textarea').val()
//			})
		})
	})
})