/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')

    var tpl = require('tpl!../templates/list.html'),
        Row = require('./row')

	return Backbone.View.extend({
		events: {
		},
		initialize: function () {
			this.listenTo(this.collection, 'sync', this.renderRows)
			this.rows = []
		},
        renderRows: function () {
			var list = this.$el
			_.invoke(this.rows, 'remove')
			this.rows = []

			this.collection.each(function (entry) {
				var view = new Row({model: entry})
				this.rows.push(view)
				view.render()
			}, this)

			list.append(_.pluck(this.rows, 'el'))
		},
		render: function () {
			this.$el.html(tpl())
			return this
		}
	});
})