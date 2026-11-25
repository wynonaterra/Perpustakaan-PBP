const errorHandler = (err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Terjadi kesalahan pada server.',
  });
};

module.exports = errorHandler;