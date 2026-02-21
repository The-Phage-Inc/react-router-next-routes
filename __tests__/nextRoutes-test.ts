import path from 'node:path';

import { RouteManifestEntry } from '../src/utils/manifest';
import { nextRoutesUniversal, routePrefix } from '../src/nextRoutes';
import { normalizeSlashes } from '../src/utils/normalizeSlashes';

const APP_DIR = path.join('test', 'root', 'app');
const ROUTES_DIR = path.join(APP_DIR, 'routes');

function pathToRouteId(fullPath: string) {
  const name = normalizeSlashes(path.relative(APP_DIR, fullPath)).replace(
    /\.[^/.]+$/,
    '',
  );
  return [routePrefix, name].join('/');
}

type RouteManifestTestCase = {
  fullPath: string;
  expected: RouteManifestEntry | undefined;
};

describe('nextRoutes', () => {
  describe('Correctly converts routes to a manifest.', () => {
    const testCases: RouteManifestTestCase[] = [
      {
        fullPath: path.join(ROUTES_DIR, 'dummy.tsx'),
        expected: undefined,
      },
      {
        fullPath: path.join(ROUTES_DIR, 'page.tsx'),
        expected: {
          id: `$/routes/page`,
          file: 'routes/page.tsx',
          index: true,
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'blog', 'page.tsx'),
        expected: {
          id: `$/routes/blog/page`,
          file: 'routes/blog/page.tsx',
          path: 'blog',
          index: true,
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'blog', '[slug]', 'page.tsx'),
        expected: {
          id: `$/routes/blog/[slug]/page`,
          file: 'routes/blog/[slug]/page.tsx',
          path: 'blog/:slug',
          index: true,
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, '(group)', 'about', 'page.tsx'),
        expected: {
          id: `$/routes/(group)/about/page`,
          file: 'routes/(group)/about/page.tsx',
          path: 'about',
          index: true,
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'shop', '[[...slug]]', 'page.tsx'),
        expected: {
          id: `$/routes/shop/[[...slug]]/page`,
          file: 'routes/shop/[[...slug]]/page.tsx',
          path: 'shop/*',
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'menu', 'layout.tsx'),
        expected: {
          id: `$/routes/menu/layout`,
          file: 'routes/menu/layout.tsx',
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'menu', 'page.tsx'),
        expected: {
          id: `$/routes/menu/page`,
          file: 'routes/menu/page.tsx',
          path: 'menu',
          index: true,
          parentId: `$/routes/menu/layout`,
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'menu', 'sub', 'page.tsx'),
        expected: {
          id: `$/routes/menu/sub/page`,
          file: 'routes/menu/sub/page.tsx',
          path: 'menu/sub',
          index: true,
          parentId: `$/routes/menu/layout`,
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, '(layout)', 'layout.tsx'),
        expected: {
          id: `$/routes/(layout)/layout`,
          file: 'routes/(layout)/layout.tsx',
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, '(layout)', 'layout-1', 'page.tsx'),
        expected: {
          id: `$/routes/(layout)/layout-1/page`,
          file: 'routes/(layout)/layout-1/page.tsx',
          path: 'layout-1',
          index: true,
          parentId: `$/routes/(layout)/layout`,
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, '(layout)', 'layout-2', 'page.tsx'),
        expected: {
          id: `$/routes/(layout)/layout-2/page`,
          file: 'routes/(layout)/layout-2/page.tsx',
          path: 'layout-2',
          index: true,
          parentId: `$/routes/(layout)/layout`,
        },
      },
      {
        fullPath: path.join(
          ROUTES_DIR,
          '(double-route)',
          '(1)',
          'double-route',
          'page1',
          'page.tsx',
        ),
        expected: {
          id: `$/routes/(double-route)/(1)/double-route/page1/page`,
          file: 'routes/(double-route)/(1)/double-route/page1/page.tsx',
          path: 'double-route/page1',
          index: true,
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(
          ROUTES_DIR,
          '(double-route)',
          '(2)',
          'double-route',
          'page2',
          'page.tsx',
        ),
        expected: {
          id: `$/routes/(double-route)/(2)/double-route/page2/page`,
          file: 'routes/(double-route)/(2)/double-route/page2/page.tsx',
          path: 'double-route/page2',
          index: true,
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'layout1', 'layout.tsx'),
        expected: {
          id: `$/routes/layout1/layout`,
          file: 'routes/layout1/layout.tsx',
          parentId: 'root',
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'layout1', 'page.tsx'),
        expected: {
          id: `$/routes/layout1/page`,
          file: 'routes/layout1/page.tsx',
          path: 'layout1',
          index: true,
          parentId: `$/routes/layout1/layout`,
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'layout1', 'layout2', 'layout.tsx'),
        expected: {
          id: `$/routes/layout1/layout2/layout`,
          file: 'routes/layout1/layout2/layout.tsx',
          parentId: `$/routes/layout1/layout`,
        },
      },
      {
        fullPath: path.join(ROUTES_DIR, 'layout1', 'layout2', 'page.tsx'),
        expected: {
          id: `$/routes/layout1/layout2/page`,
          file: 'routes/layout1/layout2/page.tsx',
          path: 'layout1/layout2',
          index: true,
          parentId: `$/routes/layout1/layout2/layout`,
        },
      },
      {
        fullPath: path.join(
          ROUTES_DIR,
          'layout1',
          'layout2',
          'layout3',
          'layout.tsx',
        ),
        expected: {
          id: `$/routes/layout1/layout2/layout3/layout`,
          file: 'routes/layout1/layout2/layout3/layout.tsx',
          parentId: `$/routes/layout1/layout2/layout`,
        },
      },
      {
        fullPath: path.join(
          ROUTES_DIR,
          'layout1',
          'layout2',
          'layout3',
          'page.tsx',
        ),
        expected: {
          id: `$/routes/layout1/layout2/layout3/page`,
          file: 'routes/layout1/layout2/layout3/page.tsx',
          path: 'layout1/layout2/layout3',
          index: true,
          parentId: `$/routes/layout1/layout2/layout3/layout`,
        },
      },
    ];

    const manifest = nextRoutesUniversal(
      APP_DIR,
      testCases.map((t) => t.fullPath),
      'routes',
    );

    for (const { fullPath, expected } of testCases) {
      const routeId = pathToRouteId(fullPath);
      it(`"${fullPath}" -> "${routeId}"`, () => {
        const routeInfo = manifest[routeId];
        expect(routeInfo).toEqual(expected);
      });
    }
  });
});
