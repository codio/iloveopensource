/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 3:27 AM
 */
define(function (require) {
	var RepoList = require('modules/repo-selector/views/repo-list')

	return RepoList.extend({
		isProjectList: true,
		tpl: require('tpl!templates/repo-selector/selected.html'),
		initialize: function() {
			RepoList.prototype.initialize.apply(this, arguments)
			this.listenTo(this.collection, 'add', this.renderRepos)
			this.listenTo(this.collection, 'destroy', this.checkIsEmpty)
			this.listenTo(this.collection, 'add', this.checkIsEmpty)
		}
	});
})