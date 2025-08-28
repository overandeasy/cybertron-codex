"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSuccess = exports.handleError = void 0;
const handleError = (res, payload) => {
    const { status, code, message } = payload;
    const dataString = JSON.stringify(payload.data);
    payload.data = dataString; // Convert data to string for logging
    console.error("Error occurred:", payload);
    // Error data included in the payload won't be exposed to http response, but only logged to the server console.
    res.status(status).json({
        type: "error",
        status,
        code,
        message
    });
};
exports.handleError = handleError;
const handleSuccess = (res, payload) => {
    const { status, code, message, data } = payload;
    console.log("Success response:", { status, code, message });
    res.status(status).json({
        type: 'success',
        status,
        code,
        message,
        data
    });
};
exports.handleSuccess = handleSuccess;
