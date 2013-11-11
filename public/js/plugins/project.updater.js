/**
 * Created by krasu on 11/11/13.
 */
define(function (require) {
    var io = require('socket.io')
    var toastr = require('toastr')
    var sio = io.connect(window.location.origin + '/projects-update/status')

    $(function () {
        var projectSync = $('#projects-sync'),
            loader = projectSync.find('.loading');

        sio.on('error', function (error) {
            projectSync.addClass('error').removeClass('loading')
            toastr.error(error, 'Failed to retrieve your info from GitHub')
            updateTooltip()
        })

        sio.on('done', function () {
            projectSync.removeClass('error loading')
            toastr.success('Your projects loaded from GitHub!')
            projectSync.trigger('github-info-updated')
            updateTooltip()
        })

        sio.on('progress', function (msg) {
            projectSync.removeClass('error').addClass('loading')
            projectSync.trigger('github-info-updating')
            updateTooltip(msg)
        })


        projectSync.find('.trigger, .error').on('click', function () {
            if (projectSync.hasClass('loading')) return
            projectSync.removeClass('error')
            projectSync.addClass('loading')
            sio.emit('start')
        })

        function updateTooltip(msg) {
            loader.attr('data-original-title', msg || loader.data('title'))
                .tooltip('fixTitle').tooltip('show')
        }
    })

    return sio
})