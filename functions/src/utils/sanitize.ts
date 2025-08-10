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

export function deepSanitize(value: any): any {
  if (Array.isArray(value)) return value.map(deepSanitize)
  if (value && typeof value === 'object') {
    const out: any = {}
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue
      out[k] = deepSanitize(v)
    }
    return out
  }
  return value === undefined ? null : value
}


