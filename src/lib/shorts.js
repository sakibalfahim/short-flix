/**
 * Simple in-memory shorts store and query functions.
 * Implemented in plain JS to allow Node native tests (node --test) without extra devDeps.
 */

const DEFAULT_SHORTS = [
  {
    id: 1,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    title: "City Timelapse",
    tags: ["timelapse", "city"]
  },
  {
    id: 2,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
    title: "Close-up Nature",
    tags: ["nature", "macro"]
  },
  {
    id: 3,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    title: "W3Schools Sample",
    tags: ["sample", "demo"]
  },
  {
    id: 4,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Big Buck Bunny (trim)",
    tags: ["animation", "demo"]
  },
  {
    id: 5,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    title: "Ocean Waves",
    tags: ["ocean", "nature"]
  },
  {
    id: 6,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
    title: "Night Drive",
    tags: ["car", "city"]
  },
  {
    id: 7,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    title: "Minimalist Shapes",
    tags: ["design", "abstract"]
  },
  {
    id: 8,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    title: "Street Performer",
    tags: ["music", "street"]
  },
  {
    id: 9,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
    title: "Coffee Pour",
    tags: ["food", "coffee"]
  },
  {
    id: 10,
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    title: "Clouds Timelapse",
    tags: ["timelapse", "clouds"]
  }
]

let store = [...DEFAULT_SHORTS]

/**
 * Get shorts with optional search and tag filter
 * @param {Object} opts
 * @param {string} [opts.q] full-text search on title and tags
 * @param {string} [opts.tag] exact tag filter
 * @param {number} [opts.page] 1-based page
 * @param {number} [opts.limit] page size
 * @returns {Array}
 */
function getShorts(opts = {}) {
  const { q, tag, page = 1, limit = 20 } = opts
  let res = store.slice()

  if (q && typeof q === 'string') {
    const ql = q.trim().toLowerCase()
    if (ql.length) {
      res = res.filter(s => {
        if (s.title && s.title.toLowerCase().includes(ql)) return true
        if (Array.isArray(s.tags) && s.tags.some(t => t.toLowerCase().includes(ql))) return true
        return false
      })
    }
  }

  if (tag && typeof tag === 'string') {
    const t = tag.trim().toLowerCase()
    if (t.length) {
      res = res.filter(s => Array.isArray(s.tags) && s.tags.some(x => x.toLowerCase() === t))
    }
  }

  // Sort newest-first (highest id first) so newly added shorts appear first on GET
  res.sort((a, b) => (b.id || 0) - (a.id || 0))

  // simple pagination
  const p = Math.max(1, Number(page) || 1)
  const lim = Math.max(1, Math.min(100, Number(limit) || 20))
  const start = (p - 1) * lim
  const end = start + lim
  return res.slice(start, end)
}

/**
 * Add a short to in-memory store
 * @param {{videoUrl:string,title:string,tags:string[]}} obj
 * @returns {{id:number,videoUrl:string,title:string,tags:string[]}} added
 */
function addShort(obj) {
  if (!obj || typeof obj !== 'object') throw new TypeError('Invalid payload')
  const { videoUrl, title, tags } = obj
  if (!videoUrl || typeof videoUrl !== 'string') throw new TypeError('videoUrl required')
  if (!title || typeof title !== 'string') throw new TypeError('title required')
  if (!Array.isArray(tags)) throw new TypeError('tags must be array')
  const id = Math.max(0, ...store.map(s => s.id)) + 1
  const item = { id, videoUrl, title, tags }
  store.push(item)
  return item
}

/** Used in tests to reset the store */
function _reset() {
  store = [...DEFAULT_SHORTS]
}

module.exports = { getShorts, addShort, _reset, DEFAULT_SHORTS }
