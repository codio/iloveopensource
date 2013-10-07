/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
    require('backbone')
    var tpl = require('tpl!../templates/request.html')
    var store = require('store').getNamespace('donation-requests')
    var Supporters = require('./supporters')

    return Backbone.View.extend({
        attributes: {
            class: 'row'
        },
        events: {
            'click .toggle-supporters': 'toggleSupporters',
            'click .edit-email': 'toggleEmailEditor',
            'click .notify-trigger': 'notify',
            'click .toggle-requests': 'toggleRequests',
            'keyup input.email': 'handleUserInput'
        },
        handleUserInput: function (event) {
            if (event.type == 'keyup') {
                if (event.which == 27) return this.toggleEmailEditor()
                if (event.which != 13) return
            }

            var val = $.trim(this.$('input.email').val())
            var data = this.model.get('maintainer')

            data.email = val
            this.model.save('maintainer', data)
                .success(_.bind(function (data) {
                    this.updateEmail()
                    this.toggleEmailEditor()
                }, this))
                .fail(function () {
                    store().notify('Failed to change email')
                })
        },
        toggleSupporters: function () {
            var el = this.$('.supporters')
            if (!this.supporters) {
                this.supporters = new Supporters({
                    requestId: this.model.id,
                    el: el
                })
            }

            el.slideToggle(el.is(':visible'))
        },
        toggleEmailEditor: function () {
            var input = this.$('input.email')
            input.add(this.$('.edit-email')).toggle()
            input.is(':visible') && input.focus()
        },
        toggleRequests: function () {
            this.$('.requests').toggle()
        },
        notify: function () {
            var btn = this.$('.notify-trigger')
            if (!this.model.get('maintainer').email) return
            if (btn.prop('disabled')) return
            btn.button('loading')
            $.get('/service/requests/' + this.model.id + '/notify')
                .success(_.bind(function (data) {
                    this.model.set('maintainer', data.maintainer)
                    this.updateNotifiedState()
                }, this))
                .fail(function () {
                    store().notify('Failed to send email')
                    btn.button('reset')
                })
        },
        updateEmail: function () {
            this.$('.edit-email').html(this.model.get('maintainer').email || 'Not Set')
        },
        updateNotifiedState: function () {
            this.$('.notified.status').addClass('active')
            this.$('.notify-trigger').button('reset')
                .addClass('btn-warning').removeClass('btn-info').html('re-notify')
        },
        remove: function () {
            this.supporters && this.supporters.remove()
            Backbone.View.prototype.remove.apply(this, arguments)
        },
        render: function () {
            var data = this.model.toJSON()
            this.$el.html(tpl({
                request: data,
                project: data.project.ref
            }))

            return this
        }
    });
})