
export type PromiseQ<T> = {
    promises: Promise<T>[];
    on: (...a:any) => void;
    off: (...a:any) => void;
    start: () => void;
}
