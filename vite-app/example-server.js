import { startDevServer, shutdownAllServers } from './src/plugins/devServerPlugin.ts'

async function runExample() {
  console.log('🚀 Starting dev servers with shutdown capabilities...\n')

  // Example 1: Start a dev server with default settings
  console.log('1️⃣ Starting default dev server...')
  const server1 = await startDevServer({
    port: 3000
  })

  // Example 2: Start a dev server with custom settings  
  console.log('\n2️⃣ Starting custom dev server...')
  const server2 = await startDevServer({
    entryPoint: 'src/main.tsx',
    port: 3001,
    host: 'localhost',
    open: false
  })

  console.log('\n📋 Server Information:')
  console.log(`Server 1 URL: ${server1.getUrl()}`)
  console.log(`Server 1 Shutdown URL: ${server1.getShutdownUrl()}`)
  console.log(`Server 2 URL: ${server2.getUrl()}`)
  console.log(`Server 2 Shutdown URL: ${server2.getShutdownUrl()}`)

  console.log('\n🔧 Shutdown Options:')
  console.log('1. Press Ctrl+C for graceful shutdown of all servers')
  console.log('2. Visit /shutdown endpoint to shutdown individual server')
  console.log('3. Call server.shutdown() method programmatically')
  console.log('4. Call shutdownAllServers() to shutdown all at once')

  // Example: Programmatic shutdown after 10 seconds
  setTimeout(async () => {
    console.log('\n⏰ Demo: Shutting down server 2 after 10 seconds...')
    await server2.shutdown()
    
    console.log(`Server 1 still running: ${server1.isRunning()}`)
    console.log(`Server 2 still running: ${server2.isRunning()}`)
    
    // Shutdown remaining servers after another 5 seconds
    setTimeout(async () => {
      console.log('\n🛑 Demo: Shutting down all remaining servers...')
      await shutdownAllServers()
      console.log('Demo complete!')
      process.exit(0)
    }, 5000)
  }, 10000)
}

// Run the example
runExample().catch(error => {
  console.error('❌ Example failed:', error)
  process.exit(1)
}) 