/**
 * Author: krasu
 * Date: 8/21/13
 * Time: 7:21 AM
 */
define(function (require) {
    require('jquery')
    require('bootstrap')
    require('./project.updater')
    var toastr = require('toastr')

    $(function () {
        var emailToAuthor = $('#email-to-author'),
            noteFromAuthor = $('#note-from-author'),
            requestContribution = $('#need-contribution-ways');

        requestContribution.on('click', '.set-email', function () {
            var email = $.trim(requestContribution.find('input').val())
            if (!email) return requestContribution.modal('hide')

            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: '/projects/donate-request/update-email',
                data: JSON.stringify({
                    email: email,
                    project: requestContribution.data().project,
                    projectData: requestContribution.data().projectData
                })
            })
                .fail(function (xhr) {
                    toastr.error(xhr.responseText)
                })
                .done(function () {
                    requestContribution.modal('hide')
                })
        })

        $('body')
            .tooltip({
                selector: '[data-toggle="tooltip"]'
            })
            .on('click', 'input.embed', function (event) {
                $(event.currentTarget).select()
            })
            .on('click', '.email-to-author', function (event) {
                var el = $(event.currentTarget)
                var textarea = emailToAuthor.find('textarea')
                textarea.val(textarea.data().initText)

                emailToAuthor.modal('show').data({
                    url: 'comment-for-author',
                    project: el.data().project,
                    projectData: el.data().projectData
                })
            })
            .on('click', '.want-contribute', function (event) {
                var el = $(event.currentTarget)

                requestContribution.modal('show').data({
                    project: el.data().project,
                    projectData: el.data().projectData
                })

                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: '/projects/donate-request',
                    data: JSON.stringify({
                        project: el.data().project,
                        projectData: el.data().projectData
                    })
                })
            })
            .on('click', '.note-from-author', function (event) {
                noteFromAuthor.find('.modal-body')
                    .html($(event.currentTarget).closest('.contribution').find('.content').html())
                noteFromAuthor.modal('show')
            })
            .on('click', '.modal .send-email', function (event) {
                var btn = $(event.currentTarget)
                var modal = btn.closest('.modal')
                var message = $.trim(modal.find('textarea').val())

                if (!message) return toastr.warning('Message too short')
                if (btn.attr('disabled')) return
                btn.button('loading')

                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: '/projects/comment-for-author',
                    data: JSON.stringify({
                        message: message,
                        project: modal.data().project,
                        projectData: modal.data().projectData
                    })
                })
                    .done(function () {
                        toastr.success('Message sent')
                        modal.modal('hide')
                    })
                    .fail(function (xhr) {
                        toastr.error(xhr.responseText)
                    })
                    .always(function () {
                        btn.button('reset')
                    })
            })
    })
})