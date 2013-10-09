/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
    require('backbone')
    var tpl = require('tpl!../templates/supporter.html')

    return Backbone.View.extend({
        attributes: {
            class: 'row'
        },
        render: function () {
            this.$el.html(tpl(this.model.toJSON()))
            return this
        }
    });
})