import fs from 'node:fs';
import path from 'node:path';
import { makeRe } from 'minimatch';

import { RouteManifest } from './utils/manifest';
import { normalizeSlashes } from './utils/normalizeSlashes';

export const routeModuleExts = ['.js', '.jsx', '.ts', '.tsx', '.md', '.mdx'];

// Dynamic route segments
export const paramStart = '[' as const;
export const paramEnd = ']' as const;

// group segments
export const groupStart = '(' as const;
export const groupEnd = ')' as const;

// catch-all prefix
export const catchAllPrefix = '...' as const;

// optional route segments
export const optionalStart = `[[` as const;
export const optionalEnd = ']]' as const;

// ignored prefix
export const ignoredPrefixChar = '_' as const;

export const pageName = 'page' as const;
export const layoutName = 'layout' as const;

export const routePrefix = '$' as const;

export function getAllRouteFiles(
  dir: string,
  ignoredFileRegex: RegExp[],
): string[] {
  const result: string[] = [];

  function walk(current: string) {
    const entries = fs.readdirSync(current, {
      withFileTypes: true,
      encoding: 'utf-8',
    });

    for (const entry of entries) {
      if (entry.name.startsWith(ignoredPrefixChar)) {
        continue;
      }
      const fullPath = normalizeSlashes(path.join(current, entry.name));
      const isIgnored = ignoredFileRegex.some((regex) => regex.test(fullPath));
      if (isIgnored) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (routeModuleExts.some((ext) => entry.name.endsWith(ext))) {
        result.push(fullPath);
      }
    }
  }

  walk(dir);
  return result;
}

export function nextRoutes(
  appDirectory: string,
  ignoredFilePatterns: string[] = [],
  prefix: string,
) {
  const ignoredFileRegex = Array.from(
    new Set(['**/.*', ...ignoredFilePatterns]),
  )
    .map((re) => makeRe(re))
    .filter((re): re is RegExp => !!re);

  const routesDir = path.join(appDirectory, prefix);

  const rootRoute = findFile(appDirectory, 'root', routeModuleExts);

  if (!rootRoute) {
    throw new Error(
      `Could not find a root route module in the app directory: ${appDirectory}`,
    );
  }

  if (!fs.existsSync(routesDir)) {
    throw new Error(
      `Could not find the routes directory: ${routesDir}. Did you forget to create it?`,
    );
  }

  const routes = getAllRouteFiles(routesDir, ignoredFileRegex);

  return nextRoutesUniversal(appDirectory, routes, prefix);
}

export function nextRoutesUniversal(
  appDirectory: string,
  routes: string[],
  prefix: string,
): RouteManifest {
  const normalizedApp = normalizeSlashes(appDirectory);

  const routeIds = new Map<string, string[]>();

  for (const fullPath of routes) {
    const dirName = path.dirname(fullPath);
    const routeId = path.join(
      routePrefix,
      path.posix.relative(normalizedApp, dirName),
    );

    const conflict = routeIds.get(routeId);
    if (conflict) {
      routeIds.set(routeId, [...conflict, fullPath]);
      continue;
    }
    routeIds.set(routeId, [fullPath]);
  }

  const sortedRouteIds = Array.from(routeIds).sort(
    ([a], [b]) => a.length - b.length,
  );

  const routeManifest: RouteManifest = {};

  function getParentId(routeId: string) {
    // prefix
    const prefixPath = path.join(routePrefix, prefix);
    // Remove the prefix from the routeId
    routeId = routeId.slice(prefixPath.length + 1);
    const segments = routeId.split('/');
    while (segments.length > 0) {
      segments.pop();
      const parentId = [prefixPath, ...segments, layoutName].join('/');
      if (parentId in routeManifest) {
        return parentId;
      }
    }
    return 'root';
  }

  for (const [routeId, fullPaths] of sortedRouteIds) {
    let parentId = getParentId(routeId);
    // layout
    const layoutPath = findModule(fullPaths, layoutName, routeModuleExts);
    if (layoutPath) {
      const layoutId = `${routeId}/${layoutName}`;
      const filepath = path.relative(normalizedApp, layoutPath);
      routeManifest[layoutId] = {
        id: layoutId,
        file: filepath,
        parentId,
      };
      // update parentId
      parentId = layoutId;
    }
    // page
    const pagePath = findModule(fullPaths, pageName, routeModuleExts);
    if (pagePath) {
      const pageId = `${routeId}/${pageName}`;
      const filepath = path.relative(normalizedApp, pagePath);
      const pathname = getPathname(routeId, prefix);
      routeManifest[pageId] = {
        id: pageId,
        file: filepath,
        path: pathname,
        parentId,
      };
      // index
      if (pathname) {
        if (!hasCatchAllSegment(pathname)) {
          routeManifest[pageId].index = true;
        }
      } else {
        routeManifest[pageId].index = true;
      }
    }
  }
  return routeManifest;
}

function findFile(
  dir: string,
  basename: string,
  extensions: string[],
): string | undefined {
  for (const ext of extensions) {
    const name = basename + ext;
    const file = path.join(dir, name);
    if (fs.existsSync(file)) return file;
  }
  return undefined;
}

function findModule(
  files: string[],
  basename: string,
  extensions: string[],
): string | undefined {
  const filteredFiles = files.filter((file) => {
    const filename = path.basename(file);
    return extensions.some((ext) => filename === `${basename}${ext}`);
  });
  if (filteredFiles.length === 0) {
    return undefined;
  }
  if (filteredFiles.length > 1) {
    throw new Error(
      `Route conflict detected: ${filteredFiles.join(', ')} both define the same route. Ensure only one file exists per route path.`,
    );
  }
  return filteredFiles[0];
}

function getPathname(routeId: string, prefix: string) {
  // Remove the prefix from the routeId
  routeId = routeId.slice(path.join(routePrefix, prefix).length + 1);
  const segments = routeId.split('/');

  const filteredSegments = segments.filter((segment) => {
    return !(segment.startsWith(groupStart) && segment.endsWith(groupEnd));
  });

  const pathname = filteredSegments
    .map((segment): string => {
      if (segment.startsWith(optionalStart) && segment.endsWith(optionalEnd)) {
        const name = segment.slice(optionalStart.length, -optionalEnd.length);
        if (name.startsWith(catchAllPrefix)) {
          return `*`;
        } else {
          throw new Error(
            'Supports optional catch-all segments like `[[...slug]]`, but not patterns like `[[slug]]`.',
          );
        }
      } else if (segment.startsWith(paramStart) && segment.endsWith(paramEnd)) {
        const name = segment.slice(paramStart.length, -paramEnd.length);
        if (name.startsWith(catchAllPrefix)) {
          throw new Error(
            `Catch-all segments like \`[${name}]\` are not supported.` +
              'Only optional catch-all segments (e.g. `[[...slug]]`) are allowed.',
          );
        } else {
          return `:${name}`;
        }
      }
      return segment;
    })
    .join('/');
  return pathname.length ? pathname : undefined;
}

function hasCatchAllSegment(routeId: string) {
  const segments = routeId.split('/');
  return segments.some((segment) => {
    return segment === '*';
  });
}
