
const isDev = process.env.NODE_ENV !== 'production';

export function log(...args: any[]) {
    if (isDev) {
        console.log('[DEBUG]', ...args);
    }
}
export function warn(...args: any[]) {
    console.log('[WARN]', ...args);
}
export function error(...args: any[]) {
    console.error('[ERROR]', ...args);
}

