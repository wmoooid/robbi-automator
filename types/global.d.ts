export {};

declare global {
    interface Window {
        robbiEventHandler: (arg0: MouseEvent) => Promise<void>;
    }
}
