import { remote } from 'electron';

import * as dirs from '../../dirs';
import { default as SaveGameType } from '../../savegame';


export const SaveGame = remote.require('./dist/savegame').default as typeof SaveGameType;

export const findWaldenDir = remote.require('./dist/dirs').findWaldenDir as typeof dirs.findWaldenDir;

export const findSaveGameDir = remote.require('./dist/dirs').findSaveGameDir as typeof dirs.findSaveGameDir;
