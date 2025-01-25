function sendResponse(res, status, data, error, message) {
  return res.status(status).json({
    error,
    message,
    data: data,
  });
}
export default sendResponse;
