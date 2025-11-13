// Entry point for the package
const walletService = require('./walletService');
const routes = require('./routes');

module.exports = {
  ...walletService,
  routes
};
