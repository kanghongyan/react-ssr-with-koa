import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as hoistStatics from 'hoist-non-react-statics'

const PAGE_DATA_KEY = 'pageProps';
const ROUTE_DATA_KEY = 'routeProps';

const PAGE_TYPE = 'app';
const ROUTE_TYPE = 'route';

type ContainerType = 'app' | 'route'

const _isClient = () => {
    return typeof window === 'object' && !!window.__PRELOADED_STATE__
};

const _getClientData = (type, name) => {
    if (type === PAGE_TYPE) {
        if (window &&
            window.__PRELOADED_STATE__
        ) {
            return window.__PRELOADED_STATE__[PAGE_DATA_KEY]
        }
    }
    if (type === ROUTE_TYPE) {
        if (window &&
            window.__PRELOADED_STATE__ &&
            window.__PRELOADED_STATE__[ROUTE_DATA_KEY]
        ) {
            return window.__PRELOADED_STATE__[ROUTE_DATA_KEY][name]
        }
    }
};

const _deleteClientData = (type, name) => {
    if (window && window.__PRELOADED_STATE__) {
        type === PAGE_TYPE && delete window.__PRELOADED_STATE__[PAGE_DATA_KEY];
        type === ROUTE_TYPE && delete window.__PRELOADED_STATE__[ROUTE_DATA_KEY][name];
    }
};

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

interface P {
    initialData: any
}

const Wrapper = (option: {type: ContainerType, name: string}) => {

    return (Comp) => {

        const compType: string = option.type || PAGE_TYPE;
        const routeName: string = option.name || Comp.displayName || Comp.name;

        class Container extends React.Component<P> {
            isClient: boolean;
            state: {
                initialData: any
            };

            static defautProps = {
                initialData: {}
            }

            static propTypes = {
                initialData: PropTypes.any
            }


            static displayName = routeName;

            constructor(props) {
                super(props);

                this.isClient = _isClient();


                // 对window.__PRELOADED_STATE__.routeProps做处理
                // 对window.__PRELOADED_STATE__.pageProps做处理
                // pageProps由于是顶级组件，可以放一些全部不变的数据
                const propsData = this.props.initialData;
                const windowData = this.isClient ? _getClientData(compType, routeName) : '';

                this.state  = {
                    initialData: this.isClient && windowData ?
                        windowData :
                        propsData
                }


            }

            componentDidMount() {
                if (this.state.initialData) {
                    _deleteClientData(compType, routeName)
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

export {
    Wrapper
}
