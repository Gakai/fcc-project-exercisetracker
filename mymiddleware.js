/**
 * Creates an express middleware, that logs incoming requests in the format
 *
 * `METHOD PATH - SOURCEIP`
 *
 * Options:
 *
 * `logFormData` (boolean): If the request is not a GET request and additional form data is provided,
 * that is also logged. (default: true)
 * @param {RequestLoggerOptions} options
 * @returns {import("express").RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>>}
 */
function requestLogger({ logFormData = true } = {}) {
	return (req, res, next) => {
		console.log(req.method, req.originalUrl, '-', req.ip)
		if (logFormData && req.method !== 'GET' && req.body) {
			console.log('FormData:', { ...req.body })
		}
		return next()
	}
}

module.exports = { requestLogger }
