// Prints method, URL, status code and time taken, once the response has been sent
function logger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)} ms`);
  });
  next();
}

module.exports = logger;
