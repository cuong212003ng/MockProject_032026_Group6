const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    message,
    data,
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    data,
  });
};

module.exports = { sendSuccess, sendError };
