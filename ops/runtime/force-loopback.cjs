'use strict';

const net = require('node:net');

const expectedPort = Number(process.env.PORT);
if (!Number.isInteger(expectedPort) || expectedPort < 1 || expectedPort > 65535) {
  throw new Error('PORT must be a valid TCP port before installing the loopback guard.');
}

const originalListen = net.Server.prototype.listen;

net.Server.prototype.listen = function forceLoopbackListen(...args) {
  const requestedPort = Number(args[0]);
  if (requestedPort !== expectedPort) {
    throw new Error(`Unexpected listener port: ${String(args[0])}`);
  }

  if (typeof args[1] === 'function' || args[1] === undefined) {
    args.splice(1, 0, '127.0.0.1');
  } else if (args[1] !== '127.0.0.1') {
    throw new Error(`Refusing non-loopback listener host: ${String(args[1])}`);
  }

  return originalListen.apply(this, args);
};
