/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')

    var tpl = require('tpl!../templates/supporters.html'),
        Supporters = require('../collections/supporters'),
        Row = require('./supporter')

	return Backbone.View.extend({
		initialize: function () {
			this.rows = []
            this.collection = new Supporters
            this.collection.requestId = this.options.requestId
            this.listenTo(this.collection, 'fetched', this.renderRows)
            this.collection.fetch()
            this.render()
        },
        renderRows: function () {
			var list = this.$('.supporters-list')
			_.invoke(this.rows, 'remove')
			this.rows = []

			this.collection.each(function (entry) {
				var view = new Row({model: entry})
				this.rows.push(view)
				view.render()
			}, this)

			list.append(_.pluck(this.rows, 'el'))
		},
        remove: function() {
            _.invoke(this.rows, 'remove')
            Backbone.View.prototype.remove.apply(this, arguments)
        },
		render: function () {
			this.$el.html(tpl())
			return this
		}
	});
})