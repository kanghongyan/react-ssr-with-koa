import React from 'react'
import hoistStatics from 'hoist-non-react-statics'


/**
 *
 * container组件从this.props.initialData上拿到初始数据
 *
 * === for route Container ===
 * class My extends React.Component {

      static getInitialProps() {
          // todo: server在这里请求数据
          return 'my data from server'
      }

      ...
      ...
   }
 * export default Wrapper({type: 'route', name: 'abc'})(Container)
 *
 * // 数据会被挂载到window.__PRELOADED_STATE__.routeProps上
 * // window.__PRELOADED_STATE__.routeProps.abc = 'my data from server'
 *
 *
 *
 * === for root App ===
 * 同上，type值为'app'即可，不用设置name
 * export default Wrapper({type: 'app'})(App)
 *
 * // 数据会被挂载到window.__PRELOADED_STATE__.pageProps上
 * // window.__PRELOADED_STATE__.pageProps = 'my data from server'
 *
 *
 * @param option  type:container类型， name:container name,用于从window上拿数据
 * @constructor
 */

const Wrapper = (option) => {

    const routeName = option.name;
    const compType = option.type || 'app';


    const isMainApp = compType === 'app';
    const preloadedStatePorps = isMainApp ? 'pageProps' : 'routeProps';


    return (Comp) => {

        class Container extends React.Component {


            static displayName = routeName;

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

        return hoistStatics(Container, Comp)
    }
};

export default Wrapper
