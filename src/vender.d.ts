// some import
// AND/OR some export

declare module NodeJS  {
    interface Global {
        document: any,
        window: any,
        navigator: any
    }
}
interface Window {
    __PRELOADED_STATE__: any
}
