/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 8:41 PM
 */
define(function (require) {
    require('backbone')

    return Backbone.Model.extend({
        idAttribute: '_id',
        urlRoot: '/maintainer/projects',
        save: function () {
            var req = Backbone.Model.prototype.save.apply(this, arguments)
            req.done(function (data, status, xhr) {
                if (xhr.getResponseHeader('Became-Maintainer')) {
                    ga && ga('send', 'event', 'users', 'firstTimeMaintainer')
                }
            })
            return  req
        }
    })
})