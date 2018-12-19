"use strict";

const gulp = require('gulp');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  build: 'appium-sdb',
  e2eTest: {
    files: '${testDir}/functional/*-e2e-specs.js',
  },
});
