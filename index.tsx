import React from 'react';

export const Context = React.createContext(null as { server?: boolean, client?: boolean, cache: Cache } | null);

export const useServerPromise = <T,>(predicate: () => Promise<T>) => {
    const context = React.useContext(Context);
    const key = React.useId();

    if (!context) {
        throw new Error(`use-server-promise was unable to find context. Did you forget to use <ServerPromiseProvider />`);
    }

    const { server, client, cache } = context;

    if (client && !cache.has(key)) {
        console.warn(`use-server-promise was unable to find data for ${key}. Looks like a server promise was rejected`);
    }

    if (server && !cache.has(key)) {
        const promise = Promise.resolve(predicate());

        promise.then((value) => {
            cache.set(key, value);
        });

        throw new Promise((resolve) => {
            promise.then(resolve);
        });
    }
    
    return cache.get(key) as T;
};

export const ServerPromiseProvider = ({ children, client, server, cache }: React.PropsWithChildren<{
    client?: boolean,
    server?: boolean,
    cache: Cache,
}>) => {
    return (
        <Context.Provider value={{ server, client, cache }}>
            <React.Suspense fallback={<></>}>
                {children}
            </React.Suspense>
        </Context.Provider>
    );
};

export class Cache {
    constructor (private cache = new Map<string, unknown>()) {}

    public static from = (cache: Map<string, unknown>) => {
        return new Cache(cache);
    };

    public static parse = (str: string) => {
        return Cache.from(new Map(JSON.parse(str)));
    };

    public stringify = () => {
        return JSON.stringify(Array.from(this.cache.entries()))
    };

    public has = (key: string) => {
        return this.cache.has(key);
    };

    public set = (key: string, value: unknown) => {
        return this.cache.set(key, value);
    };

    public get = (key: string) => {
        return this.cache.get(key);
    };
};
