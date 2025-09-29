
import { styleText } from 'node:util';
const isDev = process.env.NODE_ENV !== 'production';

export function log(...args: any[]) {
    if (isDev) {
        console.log(styleText('grey', '[DEBUG]'), ...args);
    }
}
export function warn(...args: any[]) {
    console.log(styleText('yellow', '[WARN]'), ...args);
}
export function error(...args: any[]) {
    console.log(styleText('red', '[ERROR]'), ...args);
}

