exports.notFoundError = (errorMessage) => {
    const error = new Error(errorMessage);
    error.status = 404;
    throw error;
}