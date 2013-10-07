/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
    require('backbone')
    var tpl = require('tpl!../templates/row.html')
    var store = require('store').getNamespace('donation-requests')

    return Backbone.View.extend({
        attributes: {
            class: 'row'
        },
        events: {
            'click .edit-email': 'toggleEmailEditor',
            'click .notify-trigger': 'notify',
            'click .toggle-requests': 'toggleRequests',
            'blur input.email': 'handleUserInput',
            'keyup input.email': 'handleUserInput'
        },
        handleUserInput: function (event) {
            if (event.type == 'keyup') {
                if (event.which == 27) return this.toggleEmailEditor()
                if (event.which != 13) return
            }

            var val = $.trim(this.$('input.email').val())
            var data = this.model.get('maintainer')

            if (!val) return this.toggleEmailEditor()

            data.email = val
            this.model.save('maintainer', data)
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
                .fail(function() {
                    store().notify('Failed to send email')
                })
                .always(function() {
                    btn.button('reset')
                })
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