/**
 * Author: krasu
 * Date: 10/7/13
 * Time: 1:21 PM
 */
define(function (require) {
    require('backbone')

    return Backbone.Collection.extend({
        url: function() {
            return '/service/requests/' + this.requestId + '/supporters'
        },
        fetch: function (options) {
            var request = Backbone.Collection.prototype.fetch.apply(this, arguments);
            request.done(_.bind(function () {
                this.trigger('fetched')
            }, this))

            return request
        }
    })
})