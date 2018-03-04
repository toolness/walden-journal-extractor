import { FriendlyGetter } from './util';

const env = new FriendlyGetter(process.env, 'docker environment');

export const APP_DIR = env.getStr('APP_DIR');

export const STAGING_DIR = env.getStr('STAGING_DIR');
