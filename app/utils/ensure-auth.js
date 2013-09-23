/**
 * Author: krasu
 * Date: 8/18/13
 * Time: 8:12 PM
 */
module.exports = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	req.session.redirectUrl = req.url;
	res.redirect('/');
}
