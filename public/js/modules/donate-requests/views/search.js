/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:33 AM
 */
define(function (require) {
    require('backbone')

    var store = require('store').getNamespace('donation-requests')
    var tpl = require('tpl!../templates/search.html')

    return Backbone.View.extend({
        events: {
            'click .switcher': 'toggleFilter',
            'blur .search-query': 'search',
            'keyup .search-query': 'search'
        },
        initialize: function () {
            this.filters = {}
        },
        fetchRequests: function () {
            this.$('.loading').show()
            this.undelegateEvents()
            store().requests.fetch({data: this.filters})
                .always(_.bind(function() {
                    this.$('.loading').hide()
                    this.delegateEvents()
                }, this))
        },
        search: function (event) {
            if (event.type == 'keyup' && event.which != 13) return

            var query = this.$('.search-query').val()
            if (this.filters.search == query) return
            this.filters.search = query
            this.fetchRequests()
        },
        toggleFilter: function (event) {
            var filter = $(event.currentTarget),
                isOn = filter.hasClass('active')

            filter.toggleClass('active', !isOn)
            if (!isOn) {
                this.filters[filter.data().field] = true
            } else {
                delete this.filters[filter.data().field]
            }
            this.fetchRequests()
        },
        render: function () {
            this.$el.html(tpl())
            return this
        }
    });
})