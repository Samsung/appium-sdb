"use strict";

let gulp = require('gulp'),
    boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  build: 'appium-sdb',
  jscs: false,
  e2eTest: { files: '${testDir}/functional/*-e2e-specs.js', }
});
