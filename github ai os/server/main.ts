// Minimal backend skeleton for GitHub Data Engine
// This server would coordinate:
// - GraphQL calls to GitHub API
// - Redis caching
// - PostgreSQL persistence
// - Background workers for heavy analytics
import Fastify from 'fastify'
import { loadUserRepos } from './dataEngine'
import { analyzeCommand, analyzeCommandLLM } from './ai'
import type { Repo } from './dataEngine'

const app = Fastify({ logger: true })
// Simple CORS for local testing
app.addHook('preHandler', (request: any, reply: any, done: any) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  done()
})

app.get('/health', async () => {
  return { status: 'ok', timestamp: Date.now() }
})

// Fetch user repositories (cached, persisted, analyzed)
app.get('/user/:username/repos', async (request, reply) => {
  try {
    const username = request.params.username as string
    const limit = typeof request.query?.limit === 'string' ? parseInt(request.query.limit as string) : 10
    const repos = await loadUserRepos(username, limit)
    reply.send({ username, repos })
  } catch (e) {
    request.log.error(e)
    reply.status(500).send({ error: (e as Error).message })
  }
})

// AI assistant-like command processor for developer insights
app.post('/ai/command', async (request, reply) => {
  try {
    const { username, command } = request.body as any
    if (!username || !command) {
      reply.status(400).send({ error: 'username and command are required' })
      return
    }
    // Ensure we have repos loaded for analysis
    const repos = await loadUserRepos(username, 10)
    // Prefer LLM-based analysis if configured, else fallback to heuristic
    const result = process.env.OPENAI_API_KEY
      ? (await analyzeCommandLLM(username, repos, command)).summary
      : analyzeCommand(username, repos, command).summary
    // If LLm path returns more structured result, adapt accordingly
    const details = undefined
    reply.send({ username, command, result, details })
  } catch (e) {
    request.log.error(e)
    reply.status(500).send({ error: (e as Error).message })
  }
})

app.listen({ port: 8080 }).then(() => {
  console.log('GitHub AI OS backend listening on http://localhost:8080')
})
