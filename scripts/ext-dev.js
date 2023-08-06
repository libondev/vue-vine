import { log, setGlobalPrefix } from '@baiwusanyu/utils-log'
import { runCommand, spawnCommand } from './utils'

async function runExtScript(mode) {
  const BUILD_COMPILER = 'pnpm --filter @vue-vine/compiler run build'
  const WATCH_EXT_TSC = ['pnpm', ['--filter', 'vue-vine-extension', 'run', `${mode}:tsc`]]
  const WATCH_EXT_ESBUILD = ['pnpm', ['--filter', 'vue-vine-extension', 'run', `${mode}:esbuild`]]
  const WATCH_LANGUAGE_SERVER = ['pnpm', ['--filter', '@vue-vine/language-server', 'run', `${mode}`]]

  // set log prefix
  setGlobalPrefix('[vue-vine]: ')

  try {
    await runCommand(BUILD_COMPILER, { title: 'BUILD_COMPILER' })
    await Promise.all([
      spawnCommand(...WATCH_EXT_TSC, { title: 'WATCH_EXT_TSC' }),
      spawnCommand(...WATCH_EXT_ESBUILD, { title: 'WATCH_EXT_ESBUILD' }),
      spawnCommand(...WATCH_LANGUAGE_SERVER, { title: 'WATCH_LANGUAGE_SERVER' }),
    ])
  }
  catch (e) {
    log('error', e)
  }
}

runExtScript(
  process.argv[2] === 'dev' ? 'watch' : 'build',
)