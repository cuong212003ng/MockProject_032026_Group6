const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    success: false,
    data,
    message,
  });
};

module.exports = { sendSuccess, sendError };
