/**
 * Module alias setup for production builds
 * This resolves TypeScript path mapping (@/) at runtime
 */

import * as moduleAlias from 'module-alias';
import * as path from 'path';

// Set up aliases for production
const isDist = __dirname.includes('dist');
const sourceRoot = isDist ? path.join(__dirname, '..') : __dirname;

moduleAlias.addAliases({
  '@': sourceRoot,
  '@/config': path.join(sourceRoot, 'config'),
  '@/models': path.join(sourceRoot, 'models'),
  '@/controllers': path.join(sourceRoot, 'controllers'),
  '@/services': path.join(sourceRoot, 'services'),
  '@/middleware': path.join(sourceRoot, 'middleware'),
  '@/routes': path.join(sourceRoot, 'routes'),
  '@/utils': path.join(sourceRoot, 'utils'),
  '@/types': path.join(sourceRoot, 'types'),
});

export default moduleAlias;
