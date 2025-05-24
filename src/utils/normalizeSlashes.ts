// Portions of this file are adapted from @react-router/fs-routes,
// available at https://github.com/remix-run/react-router
// Licensed under the MIT License.

import path from 'node:path';

export function normalizeSlashes(file: string) {
  return file.split(path.win32.sep).join('/');
}
