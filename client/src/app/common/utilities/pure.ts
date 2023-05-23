/**
 * Decorator for memoization of pure methods and getters
 * Decorator can help to cache result of methods or getters that can be computed once in the first call. The next calls to getter will just use computed static value.
 *
 * If you use decorator with methods, it does not compute the result again if arguments did not change after the last call (concept similar to Angular pure pipes)
 * @copyright https://taiga-ui.dev/decorators/pure
 */
export function isPure<T>(
    _target: Record<string, any>,
    propertyKey: string,
    {get, enumerable, value}: TypedPropertyDescriptor<T>,
): TypedPropertyDescriptor<T> {
    if (get) {
        return {
            configurable: true,
            enumerable,
            get(): T {
                const value = get.call(this);

                Object.defineProperty(this, propertyKey, {enumerable, value});

                return value;
            },
        };
    }

    if (typeof value !== `function`) {
        throw new Error('isPure can only be used with functions or getters');
    }

    const original = value;

    return {
        configurable: true,
        enumerable,
        get(): T {
            let previousArgs: readonly unknown[] = [];
            let originalFnWasCalledLeastAtOnce = false;
            let pureValue: unknown;

            const patched = (...args: unknown[]): unknown => {
                const isPure =
                    originalFnWasCalledLeastAtOnce &&
                    previousArgs.length === args.length &&
                    args.every((arg, index) => arg === previousArgs[index]);

                if (isPure) {
                    return pureValue;
                }

                previousArgs = args;
                pureValue = original.apply(this, args);
                originalFnWasCalledLeastAtOnce = true;

                return pureValue;
            };

            Object.defineProperty(this, propertyKey, {
                configurable: true,
                value: patched,
            });

            return patched as unknown as T;
        },
    };
}
