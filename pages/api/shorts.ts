// pages/api/shorts.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getShorts, addShort } from '../../src/lib/shorts'

type Short = { id: number; videoUrl: string; title: string; tags: string[] }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { q, tag, page, limit } = req.query
      const pageNum = Array.isArray(page) ? page[0] : page
      const limitNum = Array.isArray(limit) ? limit[0] : limit

      // Only include props that are defined to avoid exactOptionalPropertyTypes mismatch
      const opts: any = {
        page: Number(pageNum || 1),
        limit: Number(limitNum || 20)
      }
      if (typeof q === 'string' && q.length) opts.q = q
      if (typeof tag === 'string' && tag.length) opts.tag = tag

      const items = getShorts(opts)
      return res.status(200).json(items as Short[])
    } else if (req.method === 'POST') {
      const body = req.body
      if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid body' })
      const { videoUrl, title, tags } = body as any
      if (typeof videoUrl !== 'string' || typeof title !== 'string' || !Array.isArray(tags)) {
        return res.status(400).json({ error: 'Missing/invalid fields: videoUrl(string), title(string), tags(array)' })
      }
      const added = addShort({ videoUrl, title, tags })
      return res.status(201).json(added as Short)
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end('Method Not Allowed')
    }
  } catch (err: any) {
    console.error('API /api/shorts error:', err)
    return res.status(500).json({ error: String(err?.message || 'Internal error') })
  }
}
