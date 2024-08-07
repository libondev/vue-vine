import {
  createConnection,
  createServer,
  createSimpleProject,
  createTypeScriptProject,
  loadTsdkByPath,
} from '@volar/language-server/node'
import type * as ts from 'typescript'
import { create as createCssService } from 'volar-service-css'
import { create as createEmmetService } from 'volar-service-emmet'
import { create as createHtmlService } from 'volar-service-html'
import { create as createTypeScriptServices } from 'volar-service-typescript'

import type { VueCompilerOptions } from '@vue/language-core'
import { createParsedCommandLine, resolveVueCompilerOptions } from '@vue/language-core'
import { createVueVineLanguagePlugin } from '@vue-vine/language-service'

const debug = false

const connection = createConnection()
const server = createServer(connection)

connection.listen()

connection.onInitialize(async (params) => {
  const tsdk = loadTsdkByPath(
    params.initializationOptions.typescript.tsdk,
    params.locale,
  )
  const plugins = [
    createHtmlService(),
    createCssService(),
    createEmmetService(),
  ]
  if (debug) {
    plugins.push(...createTypeScriptServices(tsdk.typescript))
  }

  const result = await server.initialize(
    params,
    debug
      ? createTypeScriptProject(
        tsdk.typescript,
        tsdk.diagnosticMessages,
        ({ configFileName }) => ({
          languagePlugins: getLanguagePlugins(configFileName),
          setup() { },
        }),
      )
      : createSimpleProject(getLanguagePlugins(undefined)),
    plugins,
  )

  // tsserver already provides semantic tokens
  // TODO: handle in upstream instead of here
  result.capabilities.semanticTokensProvider = undefined

  return result

  function getLanguagePlugins(configFileName: string | undefined) {
    let compilerOptions: ts.CompilerOptions = {}
    let vueCompilerOptions: VueCompilerOptions
    if (configFileName) {
      const { vueOptions, options } = createParsedCommandLine(tsdk.typescript, tsdk.typescript.sys, configFileName)
      vueCompilerOptions = resolveVueCompilerOptions(vueOptions)
      compilerOptions = options
    }
    else {
      vueCompilerOptions = resolveVueCompilerOptions({})
    }
    return [createVueVineLanguagePlugin(tsdk.typescript, compilerOptions, vueCompilerOptions)]
  }
})

connection.onInitialized(server.initialized)
connection.onShutdown(server.shutdown)
