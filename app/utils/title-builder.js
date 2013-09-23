/**
 * Author: krasu
 * Date: 8/14/13
 * Time: 3:51 AM
 */
module.exports = function () {
	var manager = {},
		result = [],
		title = 'Open Source Supporters',
		sep = ' / '

	manager.add = function (string) {
		result.push(string)
	}

	manager.render = function () {
		var string = result.reverse().join(sep)
		result = [title]
		return string
	}

	manager.add(title)
	return manager
}()
