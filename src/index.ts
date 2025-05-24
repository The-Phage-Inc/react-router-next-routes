import fs from 'node:fs';
import path from 'node:path';
import {
  type RouteConfigEntry,
  getAppDirectory,
} from '@react-router/dev/routes';
import { routeManifestToRouteConfig } from './utils/manifest';

import { nextRoutes as nextRoutesImpl } from './nextRoutes';

export async function nextRoutes(
  options: {
    /**
     * An array of [minimatch](https://www.npmjs.com/package/minimatch) globs that match files to ignore.
     * Defaults to `[]`.
     */
    ignoredRouteFiles?: string[];

    /**
     * The directory containing file system routes, relative to the app directory.
     * Defaults to `"./routes"`.
     */
    rootDirectory?: string;
  } = {},
): Promise<RouteConfigEntry[]> {
  const {
    ignoredRouteFiles = [],
    rootDirectory: userRootDirectory = 'routes',
  } = options;
  const appDirectory = getAppDirectory();
  const rootDirectory = path.resolve(appDirectory, userRootDirectory);

  const routes = fs.existsSync(rootDirectory)
    ? nextRoutesImpl(appDirectory, ignoredRouteFiles, userRootDirectory)
    : {};

  return routeManifestToRouteConfig(routes);
}
