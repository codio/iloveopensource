/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 4:54 PM
 */
define(function (require) {
	var $ = require('jquery')
	var _ = require('lodash')
	require('bootstrap')

	$(function () {
		new (require('modules/repo-selector/layout'))({
			el: '#repos-selector'
		})
	})
});