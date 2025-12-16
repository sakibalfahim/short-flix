// src/lib/shorts.d.ts
export type Short = { id: number; videoUrl: string; title: string; tags: string[] }

/**
 * Accept string | undefined for q/tag to satisfy exactOptionalPropertyTypes usage.
 * Parameter names prefixed with underscore to avoid unused-var lint warnings in declaration files.
 */
export function getShorts(_opts?: { q?: string | undefined; tag?: string | undefined; page?: number; limit?: number }): Short[]
export function addShort(_obj: { videoUrl: string; title: string; tags: string[] }): Short
export function _reset(): void
export const DEFAULT_SHORTS: Short[]
