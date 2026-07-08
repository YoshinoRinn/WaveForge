import { spawn } from 'child_process'
import { createServer } from 'vite'
import electron from 'electron'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function startDev() {
  // 启动 Vite 开发服务器
  const server = await createServer({
    configFile: resolve(__dirname, '../vite.config.ts'),
  })

  await server.listen()

  server.printUrls()

  // 启动 Electron
  const electronProcess = spawn(
    electron,
    [resolve(__dirname, '../desktop/main.js')],
    { stdio: 'inherit' }
  )

  electronProcess.on('close', () => {
    server.close()
    process.exit()
  })
}

startDev()
