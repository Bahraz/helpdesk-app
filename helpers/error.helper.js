exports.invalidCredentialsError = (
    errorMessage = "Nieprawidłowy email lub hasło."
) => {
    error(errorMessage, 401);
}

exports.inactiveAccountError = (
    errorMessage = "Konto jest nieaktywne."
) => {
    error(errorMessage, 403);
}

exports.notFoundError = (
    errorMessage = "Nie znaleziono zasobu."
) => {
    error(errorMessage, 404);
}

exports.conflictError = (
    errorMessage = "Wystąpił konflikt z istniejącym zasobem."
) => {
    error(errorMessage, 409);
}

exports.serverError = (
    errorMessage = "Wystąpił błąd serwera."
) => {
    error(errorMessage, 500);
}

const error = (message, status) => {
    const err = new Error(message);
    console.error(message);
    err.status = status;
    throw err;
}