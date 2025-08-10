export function omitUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = {}
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined) out[k] = v
  }
  return out as T
}

export function nullifyOptionals<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): T {
  const out: any = { ...obj }
  for (const k of keys) {
    if (out[k] === undefined) out[k] = null
  }
  return out as T
}

