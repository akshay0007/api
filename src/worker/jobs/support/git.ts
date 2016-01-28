import fs = require('fs')
import cp = require('child_process')
import stream = require('stream')
import thenify = require('thenify')
import split = require('split')
import debug from '../../../support/debug'

const statify = thenify(fs.stat)
const execify = thenify<string, Object, [string, string]>(cp.exec)

const lastUpdated: { [path: string]: number } = {}

/**
 * Clone or update a repo path.
 */
export function updateOrClone (cwd: string, repo: string, timeout: number) {
  const now = Date.now()
  const updated = lastUpdated[cwd] || 0

  return statify(cwd)
    .then<any>(
      (stats) => {
        const isDir = stats.isDirectory()

        debug('update or clone: %s %s', isDir, cwd)

        if (isDir) {
          // Only update if time has elasped.
          if (updated + timeout < now) {
            return update(cwd).then(function () {
              lastUpdated[cwd] = now
            })
          }

          return
        }

        return clone(cwd, repo)
      },
      () => clone(cwd, repo)
    )
}

/**
 * Update a repo contents.
 */
export function update (cwd: string) {
  debug('git pull: %s', cwd)

  return execify('git pull', { cwd })
}

/**
 * Clone a repo contents to path.
 */
export function clone (cwd: string, repo: string) {
  debug('git clone: %s %s', repo, cwd)

  return execify(`git clone ${repo} ${cwd}`, {})
}

/**
 * Get commits since an existing commit hash.
 */
export function commitsSince (cwd: string, commit?: string): stream.Transform {
  const stream = cp.spawn('git', ['rev-list', '--reverse', commit ? `${commit}..HEAD` : 'HEAD'], { cwd })

  debug('git rev-list: %s %s', commit, cwd)

  return stream.stdout.pipe(split(null, null, { trailing: false }))
}

/**
 * Get the files changes made by a commit.
 */
export function commitFilesChanged (cwd: string, commit: string) {
  debug('git show: %s %s', commit, cwd)

  return execify(`git show --pretty="format:" --name-status --diff-filter=ADM ${commit}`, { cwd })
    .then(([stdout]) => {
      const out = stdout.trim()

      if (out.length === 0) {
        return []
      }

      return out.split(/\r?\n/).map(line => line.split('\t'))
    })
}

/**
 * Get file contents at a commit hash.
 */
export function getFile (cwd: string, path: string, commit: string, maxBuffer: number) {
  debug('git show file: %s %s', commit, cwd)

  return new Promise<string>((resolve, reject) => {
    const stream = cp.spawn('git', ['show', `${commit}:${path}`], { cwd })
    let data = ''
    let length = 0

    stream.stdout.on('data', (chunk: Buffer) => {
      // Discard additional output.
      if (length >= maxBuffer) {
        return
      }

      const len = Math.min(chunk.length, maxBuffer - length)

      data += chunk.toString('utf8', 0, len)
      length += len
    })

    stream.stdout.on('error', reject)
    stream.stdout.on('end', () => resolve(data))
  })
}