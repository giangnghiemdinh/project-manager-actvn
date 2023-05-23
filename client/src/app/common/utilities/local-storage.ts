import { environment } from '../../../environments/environment';
const APP_PREFIX = environment.appPrefix;

export function loadInitialState() {
    if (!isEnabled()) { return {}; }
    return Object.keys(localStorage).reduce((state: any, storageKey) => {
        if (storageKey.includes(APP_PREFIX)) {
            const stateKeys = storageKey
                .replace(APP_PREFIX, '')
                .toLowerCase()
                .split('.')
                .map(key =>
                    key
                        .split('-')
                        .map((token, index) =>
                            index === 0
                                ? token
                                : token.charAt(0).toUpperCase() + token.slice(1)
                        )
                        .join('')
                );
            let currentStateRef = state;
            stateKeys.forEach((key, index) => {
                if (index === stateKeys.length - 1) {
                    currentStateRef[key] = JSON.parse(localStorage.getItem(storageKey) || '');
                    return;
                }
                currentStateRef[key] = currentStateRef[key] || {};
                currentStateRef = currentStateRef[key];
            });
        }
        return state;
    }, {});
}

export function set(key: string, value: string): void {
    if (!isEnabled()) { return; }
    localStorage.setItem(`${APP_PREFIX}${key}`, value);
}

export function get(key: string): string {
    if (!isEnabled()) { return ''; }
    return localStorage.getItem(`${APP_PREFIX}${key}`) || '';
}

export function setObject(key: string, value: unknown): void {
    if (!isEnabled()) { return; }
    localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
}

export function getObject<TType = unknown>(key: string): TType | null {
    if (!isEnabled()) { return null; }
    return JSON.parse(localStorage.getItem(`${APP_PREFIX}${key}`) || JSON.stringify({})) as TType;
}

export function remove(key: string): void {
    if (!isEnabled()) { return; }
    localStorage.removeItem(`${APP_PREFIX}${key}`);
}

export function clear(): void {
    localStorage.clear();
}

function isEnabled() {
    if (!window.localStorage) {
        console.error('Current browser does not support Local Storage');
        return false;
    }
    return true;
}
