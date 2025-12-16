// test/shorts.test.js
import { describe, it, beforeEach } from 'node:test'
import assert from 'assert'
import { getShorts, addShort, _reset, DEFAULT_SHORTS } from '../src/lib/shorts.js'

describe('shorts module', () => {
  beforeEach(() => {
    _reset()
  })

  it('returns defaults', () => {
    const all = getShorts()
    assert.ok(Array.isArray(all))
    assert.strictEqual(all.length, DEFAULT_SHORTS.length)
  })

  it('search q parameter works', () => {
    const r = getShorts({ q: 'timelapse' })
    assert.ok(r.length >= 1)
    r.forEach(item => {
      const has = item.title.toLowerCase().includes('timelapse') || item.tags.some(t => t.toLowerCase().includes('timelapse'))
      assert.ok(has)
    })
  })

  it('tag filter works', () => {
    const r = getShorts({ tag: 'nature' })
    assert.ok(r.length >= 1)
    r.forEach(item => {
      assert.ok(item.tags.map(t=>t.toLowerCase()).includes('nature'))
    })
  })

  it('addShort validates and adds', () => {
    const before = getShorts()
    const added = addShort({ videoUrl: 'https://example.com/x.mp4', title: 'X', tags: ['x'] })
    assert.strictEqual(typeof added.id, 'number')
    const after = getShorts()
    assert.strictEqual(after.length, before.length + 1)
  })

  it('addShort throws on bad payload', () => {
    assert.throws(() => addShort(null), TypeError)
    assert.throws(() => addShort({}), TypeError)
  })
})
