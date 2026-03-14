import { fetchUserRepos } from './ghClient'
import { getCache, setCache } from './cache'
import { Client } from 'pg'

export type Repo = {
  id: string
  name: string
  updatedAt: string
  stars: number
  forks: number
  language: string
  color: string
  languages: string[]
  health?: number
  contributors?: number
  prCount?: number
  mergeTimeHours?: number
  impact?: number
}

const PG_CONN = process.env.PG_CONN_STRING || ''

async function upsertRepoHealth(repo: Repo) {
  if (!PG_CONN) return
  const client = new Client({ connectionString: PG_CONN })
  try {
    await client.connect()
    await client.query(
      `CREATE TABLE IF NOT EXISTS repository_health (
        repo_id TEXT PRIMARY KEY,
        name TEXT,
        language TEXT,
        color TEXT,
        stars INT,
        forks INT,
        languages TEXT[],
        health INT,
        updated_at TIMESTAMP,
        pr_count INT,
        merge_time_hours REAL
      )`
    )
    await client.query(
      `INSERT INTO repository_health (repo_id, name, language, color, stars, forks, languages, health, updated_at, pr_count, merge_time_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW(), $9, $10)
       ON CONFLICT (repo_id) DO UPDATE SET name = EXCLUDED.name, language = EXCLUDED.language, color = EXCLUDED.color, stars = EXCLUDED.stars, forks = EXCLUDED.forks, languages = EXCLUDED.languages, health = EXCLUDED.health, updated_at = NOW(), pr_count = EXCLUDED.pr_count, merge_time_hours = EXCLUDED.merge_time_hours`,
      [repo.id, repo.name, repo.language, repo.color, repo.stars, repo.forks, repo.languages, repo.health ?? 0, repo.prCount ?? 0, repo.mergeTimeHours ?? 0]
    )
  } catch (e) {
    console.error('Postgres upsert error', e)
  } finally {
    await client.end().catch(() => {})
  }
}

function computeHealth(repo: Repo): number {
  // naive health based on stars, forks, language diversity, and recency
  const now = Date.now()
  const updated = new Date(repo.updatedAt).getTime()
  const days = Math.max(1, (now - updated) / (1000 * 60 * 60 * 24))
  const recencyScore = Math.max(0, 14 - days) // more recent -> higher score
  const diversity = Math.max(1, repo.languages.length)
  const activity = repo.stars * 0.6 + repo.forks * 0.4 + diversity * 6 + recencyScore * 2
  let score = Math.round(activity)
  if (score > 100) score = 100
  if (score < 0) score = 0
  return score
}

export async function loadUserRepos(username: string, limit: number = 10): Promise<Repo[]> {
  const cacheKey = `ghos:user:${username}:repos:limit:${limit}`
  const cached = await getCache<Repo[]>(cacheKey)
  if (cached) return cached

  const raw = await fetchUserRepos(username, limit)
  const repos: Repo[] = raw.map((r: any) => {
    const health = computeHealth({
      id: r.id,
      name: r.name,
      updatedAt: r.updatedAt || new Date().toISOString(),
      stars: r.stars ?? 0,
      forks: r.forks ?? 0,
      language: (r.language ?? r.primaryLanguage ?? { name: 'Unknown' as any }).name,
      color: r.color ?? '#888',
      languages: r.languages ?? [],
      contributors: r.contributors ?? 0,
      impact: 0,
    } as any)
    return {
      id: r.id,
      name: r.name,
      updatedAt: r.updatedAt,
      stars: r.stars ?? 0,
      forks: r.forks ?? 0,
      language: r.language ?? (r.primaryLanguage?.name ?? 'Unknown'),
      color: r.color ?? '#888',
      languages: r.languages ?? [],
      health,
      impact: health / 100,
      contributors: (r.contributors ?? 0),
      prCount: (r.prCount ?? 0),
      mergeTimeHours: (r.mergeTimeHours ?? 0),
    }
  })

  await setCache(cacheKey, repos, 300)
  await upsertRepoHealthBatch(repos)
  return repos
}

async function upsertRepoHealthBatch(repos: Repo[]) {
  if (!PG_CONN) return
  for (const r of repos) {
    await upsertRepoHealth(r)
  }
}
