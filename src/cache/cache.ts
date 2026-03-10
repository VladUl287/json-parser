export function createCache<K, V>() {
    const cache = new Map<K, V>()

    return {
        getOrAdd: <T extends V>(key: K, factory: (key: K) => T): T => {
            if (cache.has(key))
                return cache.get(key) as T

            let value = factory(key)
            cache.set(key, value)
            return value
        }
    }
}