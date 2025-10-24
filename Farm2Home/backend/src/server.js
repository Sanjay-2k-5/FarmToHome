const app = require('./app');

const PORT = process.env.PORT || 3500;

const server = app.listen(PORT, () => {
  console.log(`Backend running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
