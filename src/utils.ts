// tslint:disable-next-line:no-any
export function duckType<T>(object: any, key: string): object is T {
    return key in object;
}
