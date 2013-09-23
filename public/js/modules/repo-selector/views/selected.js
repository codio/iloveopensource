/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 3:27 AM
 */
define(function (require) {
	var RepoList = require('./repo-list')

	return RepoList.extend({
		RepoRow: require('./project-row'),
		isProjectList: true,
		tpl: require('tpl!../templates/selected.html'),
		initialize: function () {
			RepoList.prototype.initialize.apply(this, arguments)
			this.listenTo(this.collection, 'add', this.renderRepo)
			this.listenTo(this.collection, 'destroy', this.checkIsEmpty)
			this.listenTo(this.collection, 'add', this.checkIsEmpty)
			this.listenTo(this.collection, 'sync', this.renderRepos)
		}
	});
})