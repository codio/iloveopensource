/**
 * Author: krasu
 * Date: 10/4/13
 * Time: 5:25 PM
 */
define(function (require) {
    require('backbone')

    return Backbone.Model.extend({
        idAttribute: '_id'
    })
})