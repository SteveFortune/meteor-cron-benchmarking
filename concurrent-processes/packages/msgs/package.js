'use strict';

// -------------------------------------------------------------------
// Configure your package here!
// -------------------------------------------------------------------

// Add your package name
var packageName = 'msgs';

// Setup your package description
Package.describe({
  name: packageName,
  version: '0.0.1',
  summary: 'A message queue.',
  git: '',
  documentation: 'README.md'
});

// -------------------------------------------------------------------
// Add your module loading and testing setup code here!
// -------------------------------------------------------------------

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.export(["Msgs"]);
  api.addFiles('shared.js', ['server', 'client']);
});
