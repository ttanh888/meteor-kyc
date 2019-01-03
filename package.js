Npm.depends({
  axios: '0.18.0',
  later: '1.2.0',
  'aws-sdk': '2.307.0',
});
Package.describe({
  name: 'relipa:meteor-kyc',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.0.1');
  api.use('ecmascript');
  api.use(['underscore', 'check', 'logging'], 'server');
  api.addFiles('asset/css/main.css', 'client');
  api.mainModule('client/Register.jsx', 'client');
  api.mainModule('server/Cron.js', 'server');
  api.mainModule('server/KYC.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('relipa:meteor-kyc');
  api.mainModule('meteor-kyc-tests.js');
});
