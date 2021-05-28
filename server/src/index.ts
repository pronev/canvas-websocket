#!/usr/bin/env node

import {app} from './app';

const port = process.env.PORT || 4000;

if (!module.parent) {
  app.listen(port);
  console.log(`Server running at ${port}`);
}

module.exports = app;