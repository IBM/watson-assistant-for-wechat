class UnauthorizedError extends Error {
	constructor(code, error) {
		super(error.message);
		this.name = 'UnauthorizedError';
		this.message = error.message;
		Error.captureStackTrace(this, this.constructor);
		this.code = code;
		this.status = 401;
	}
}

module.exports = {
	UnauthorizedError
};
