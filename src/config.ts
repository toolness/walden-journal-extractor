import * as path from 'path';

import { FriendlyGetter } from './util';

export const rootDir = path.normalize(path.join(__dirname, '..'));

const packageJson = new FriendlyGetter(require('../package.json'), 'package.json');

export const shortName = packageJson.getStr('name');

export const productName = packageJson.getStr('productName');

export const version = packageJson.getStr('version');
