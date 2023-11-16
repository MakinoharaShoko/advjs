import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Alias, InlineConfig, Plugin } from 'vite'
import { mergeConfig } from 'vite'
import isInstalledGlobally from 'is-installed-globally'

import { uniq } from '@antfu/utils'
import { require } from '../env'

import { getIndexHtml } from '../common'
import type { ResolvedAdvOptions } from '../options'

import { resolveGlobalImportPath, resolveImportPath, toAtFS } from '../utils'

import { searchForWorkspaceRoot } from '../vite/searchRoot'
import { ADV_VIRTUAL_MODULES } from '../config'

// import { commonAlias } from '../../../shared/config/vite'
const __dirname = dirname(fileURLToPath(import.meta.url))

const EXCLUDE = [
  // avoid css parse by vite
  'animate.css',

  '@vueuse/core',
  '@vueuse/shared',
  'vue-demi',

  '@types/mdast',

  // internal
  ...ADV_VIRTUAL_MODULES,
]

const babylonDeps = [
  'babylon-vrm-loader',

  '@babylonjs/core',
  '@babylonjs/loaders',
  '@babylonjs/materials',
  '@babylonjs/materials/grid',
  '@babylonjs/loaders/glTF',
]

function filterDeps(deps: Record<string, string>) {
  return Object.keys(deps).filter(i => !EXCLUDE.includes(i) && !i.startsWith('@advjs/') && !i.startsWith('#advjs') && !i.startsWith('@types'))
}

export async function createConfigPlugin(options: ResolvedAdvOptions): Promise<Plugin> {
  // const { dependencies: parserDeps } = await import('@advjs/parser/package.json', { assert: { type: 'json' } })
  // const { dependencies: clientDeps } = await import('@advjs/client/package.json', { assert: { type: 'json' } })
  // const { dependencies: coreDeps } = await import('@advjs/core/package.json', { assert: { type: 'json' } })
  const parserPkg = require('@advjs/parser/package.json')
  const clientPkg = require('@advjs/client/package.json')
  const corePkg = require('@advjs/core/package.json')

  const parserDeps = 'dependencies' in parserPkg ? parserPkg.dependencies : {}
  const clientDeps = 'dependencies' in clientPkg ? clientPkg.dependencies : {}
  const coreDeps = 'dependencies' in corePkg ? corePkg.dependencies : {}

  let INCLUDE = [
    ...filterDeps(parserDeps),
    ...filterDeps(clientDeps),
    ...filterDeps(coreDeps),
  ]

  if (options.data.features.babylon)
    INCLUDE = INCLUDE.concat(babylonDeps)

  const themeDefaultRoot = resolve(__dirname, '../../../theme-default')
  const alias: Alias[] = [
    { find: '~/', replacement: `${toAtFS(options.clientRoot)}/` },
    { find: '@advjs/client', replacement: `${toAtFS(options.clientRoot)}/index.ts` },
    { find: '@advjs/client/', replacement: `${toAtFS(options.clientRoot)}/` },
    { find: '@advjs/core', replacement: `${resolve(__dirname, '../../../core/src')}/index.ts` },
    { find: '@advjs/parser', replacement: `${toAtFS(resolve(__dirname, '../../../parser/src', 'index.ts'))}` },
    { find: '@advjs/shared', replacement: `${toAtFS(resolve(__dirname, '../../../shared/src', 'index.ts'))}` },
    { find: '@advjs/theme-default', replacement: `${toAtFS(themeDefaultRoot)}/index.ts` },
  ]

  return {
    name: 'advjs:config',
    async config(config) {
      const injection: InlineConfig = {
        define: getDefine(options),
        resolve: {
          alias,
        },
        optimizeDeps: {
          entries: [resolve(options.clientRoot, 'main.ts')],

          include: INCLUDE,
          exclude: EXCLUDE,
        },
        server: {
          fs: {
            // strict: false,
            allow: uniq([
              searchForWorkspaceRoot(options.userRoot),
              searchForWorkspaceRoot(options.cliRoot),
              searchForWorkspaceRoot(options.themeRoot),
              ...(
                isInstalledGlobally
                  ? [dirname(await resolveGlobalImportPath('@advjs/client/package.json'))]
                  : []
              ),
            ]),
          },
        },
      }

      if (isInstalledGlobally) {
        injection.cacheDir = join(options.cliRoot, 'node_modules/.vite')
        injection.publicDir = join(options.userRoot, 'public')
        injection.root = options.cliRoot
        // @ts-expect-error type cast
        injection.resolve.alias.vue = `${await resolveImportPath('vue/dist/vue.esm-browser.js', true)}`
      }

      return mergeConfig(config, injection)
    },
    configureServer(server) {
      // serve our index.html after vite history fallback
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (req.url!.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html')
            res.statusCode = 200
            res.end(await getIndexHtml(options))
            return
          }
          next()
        })
      }
    },
  }
}

export function getDefine(options: ResolvedAdvOptions): Record<string, string> {
  return {
    __ADV_CLIENT_ROOT__: JSON.stringify(toAtFS(options.clientRoot)),
    __DEV__: options.mode === 'dev' ? 'true' : 'false',
    // __DEV__: options.mode === 'development' ? 'true' : 'false',
  }
}
