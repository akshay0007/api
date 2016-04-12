import ms = require('ms')
import { join } from 'path'

/* Paths */
export const DATA_PATH = join(__dirname, '../../data')

/* Jobs */
export const JOB_UPDATE_DT = 'UPDATE_DT'
export const JOB_UPDATE_TYPINGS = 'UPDATE_TYPINGS'
export const JOB_INDEX_DT_COMMIT = 'INDEX_DT_COMMIT'
export const JOB_INDEX_TYPINGS_COMMIT = 'INDEX_TYPINGS_COMMIT'
export const JOB_INDEX_DT_FILE_CHANGE = 'INDEX_DT_FILE_CHANGE'
export const JOB_INDEX_TYPINGS_FILE_CHANGE = 'INDEX_TYPINGS_FILE_CHANGE'

/* Repos */
export const REPO_DT_PATH = join(DATA_PATH, 'DefinitelyTyped')
export const REPO_DT_URL = 'https://github.com/DefinitelyTyped/DefinitelyTyped.git'
export const REPO_TYPINGS_PATH = join(DATA_PATH, 'registry')
export const REPO_TYPINGS_URL = 'https://github.com/typings/registry.git'

/* Set up */
export const TIMEOUT_REPO_POLL = ms('5m')
