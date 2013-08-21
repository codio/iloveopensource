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
			noteFromAuthor = $('#note-from-author')

		$('body').tooltip({
			selector: '[data-toggle="tooltip"]'
		});

		$('body')
			.on('click', '.email-to-author', function () {
				emailToAuthor.modal('show')
			})
			.on('click', '.note-from-author', function (event) {
				noteFromAuthor.find('.modal-body')
					.html($(event.currentTarget).closest('.contribution').find('.content').html())
				noteFromAuthor.modal('show')
			});
	})
})