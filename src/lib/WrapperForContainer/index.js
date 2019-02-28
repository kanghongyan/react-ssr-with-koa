import React from 'react'

//
// Wrapper({name: 'my'})(App)

/**
 * 1. for route Container
 * const Comp = Wrapper({type: 'route', name: 'abc'})(Container)
 * Comp.displayName = 'abc'
 * export default Comp
 *
 * 2. for root App
 * const Comp = Wrapper({type: 'app'})(Container)
 * export default Comp
 *
 *
 * @param option  type:container类型， name:container name,用于从window上拿数据
 * @return {function(*): {new(*=): {componentDidMount: {(): void, (): void}, render: {(): *, (): React.ReactNode}, shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean, componentWillUnmount?(): void, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): (SS | null), componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callBack?: () => void): void, props: Readonly<{children?: React.ReactNode}> & Readonly<P>, state: Readonly<S>, context: any, refs: {[p: string]: React.ReactInstance}}, new(props: Readonly<P>): {componentDidMount: {(): void, (): void}, render: {(): *, (): React.ReactNode}, shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean, componentWillUnmount?(): void, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): (SS | null), componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callBack?: () => void): void, props: Readonly<{children?: React.ReactNode}> & Readonly<P>, state: Readonly<S>, context: any, refs: {[p: string]: React.ReactInstance}}, new(props: P, context?: any): {componentDidMount: {(): void, (): void}, render: {(): *, (): React.ReactNode}, shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean, componentWillUnmount?(): void, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): (SS | null), componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callBack?: () => void): void, props: Readonly<{children?: React.ReactNode}> & Readonly<P>, state: Readonly<S>, context: any, refs: {[p: string]: React.ReactInstance}}, prototype: {componentDidMount: {(): void, (): void}, render: {(): *, (): React.ReactNode}, shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean, componentWillUnmount?(): void, componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void, getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): (SS | null), componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void, componentWillMount?(): void, UNSAFE_componentWillMount?(): void, componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void, componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void, setState<K extends keyof S>(state: (((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | Pick<S, K> | S | null), callback?: () => void): void, forceUpdate(callBack?: () => void): void, props: Readonly<{children?: React.ReactNode}> & Readonly<P>, state: Readonly<S>, context: any, refs: {[p: string]: React.ReactInstance}}}}
 * @constructor
 */

const Wrapper = (option) => {

    const routeName = option.name;
    const compType = option.type || 'app';


    const isMainApp = compType === 'app';
    const preloadedStatePorps = isMainApp ? 'pageProps' : 'routeProps';

    return (Comp) => {

        return class extends React.Component {

            constructor(props) {
                super(props);

                this.isClient = !!window.__PRELOADED_STATE__;


                // 对window.__PRELOADED_STATE__.routeProps做处理
                // 对window.__PRELOADED_STATE__.pageProps做处理
                // pageProps由于是顶级组件，可以放一些全部不变的数据
                if (isMainApp) {
                    this.state  = {
                        initialData: this.isClient && window.__PRELOADED_STATE__[preloadedStatePorps] ?
                            window.__PRELOADED_STATE__[preloadedStatePorps] :
                            this.props.initialData
                    }
                } else {
                    this.state  = {
                        initialData: this.isClient && window.__PRELOADED_STATE__[preloadedStatePorps][routeName] ?
                            window.__PRELOADED_STATE__[preloadedStatePorps][routeName] :
                            this.props.initialData
                    }
                }


            }

            componentDidMount() {
                if (this.state.initialData) {
                    isMainApp && delete window.__PRELOADED_STATE__[preloadedStatePorps]
                    !isMainApp && delete window.__PRELOADED_STATE__[preloadedStatePorps][routeName];
                }
            }

            render() {

                const {initialData} = this.state;

                return (
                    <Comp {...this.props} initialData={initialData}/>
                )
            }

        }
    }
};

export default Wrapper
