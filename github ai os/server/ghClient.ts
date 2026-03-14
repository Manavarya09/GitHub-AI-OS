// Use global fetch if available (Node 18+). Fall back to dynamic import if needed.

type LanguageEdge = { node: { name: string; color?: string } }
type LanguageConnection = { edges: LanguageEdge[] }
type LanguageInfo = { name: string; color?: string }

type RepoNode = {
  id: string
  name: string
  updatedAt: string
  stargazerCount: number
  forkCount: number
  primaryLanguage?: LanguageInfo
  languages?: LanguageConnection
  collaborators?: { totalCount: number }
  pullRequests?: { totalCount: number; nodes: { createdAt: string; mergedAt: string | null }[] }
}

type UserReposResponse = {
  user?: {
    repositories?: {
      nodes: RepoNode[]
    }
  }
}

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

async function graphqlFetch(query: string, variables?: any): Promise<any> {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN not set in environment')
  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`)
  }
  return json.data
}

export async function fetchUserRepos(username: string, first: number = 10): Promise<any[]> {
  const query = `query($login: String!, $first: Int!) {
    user(login: $login) {
      repositories(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          name
          updatedAt
          stargazerCount
          forkCount
          primaryLanguage { name color }
          languages(first: 5) { edges { node { name } } }
          collaborators { totalCount }
          pullRequests(first: 50, states: MERGED) { totalCount, nodes { createdAt, mergedAt } }
        }
      }
    }
  }`
  const data = await graphqlFetch(query, { login: username, first })
  const nodes = data?.user?.repositories?.nodes ?? []
  // Normalize to a simpler shape for frontend: id, name, language, color, updatedAt, stars, forks, languages
  const repos = nodes.map((n: any) => {
    const langs = (n.languages?.edges ?? []).map((e: any) => e.node.name)
    const primary = n.primaryLanguage ? { name: n.primaryLanguage.name, color: n.primaryLanguage.color || '#888' } : { name: 'Unknown', color: '#555' }
    const contributors = n.collaborators?.totalCount ?? 0
    const prCount = n.pullRequests?.totalCount ?? 0
    const prsNodes: any[] = n.pullRequests?.nodes ?? []
    const mergeTimes = prsNodes
      .filter((p) => p.mergedAt && p.createdAt)
      .map((p) => {
        const a = new Date(p.createdAt).getTime()
        const b = new Date(p.mergedAt).getTime()
        return (b - a) / (1000 * 60 * 60)
      })
    const mergeTimeHours = mergeTimes.length ? mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length : 0
    return {
      id: n.id,
      name: n.name,
      updatedAt: n.updatedAt,
      stars: n.stargazerCount ?? 0,
      forks: n.forkCount ?? 0,
      language: primary.name,
      color: primary.color,
      languages: langs,
      primaryLanguage: primary.name,
      contributors,
      prCount,
      mergeTimeHours,
    }
  })
  return repos
}
