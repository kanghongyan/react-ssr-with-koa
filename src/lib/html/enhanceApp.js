import React from 'react'


const enhanceApp = ({
                        initialData,
                        ...routeProps
                    }) => {
    return (Component) => {

        // 将initialData注入到App中
        if (Component.App) {
            Component.App.defaultProps = {};
            Component.App.defaultProps['initialData'] = initialData;
        }

        return class InnerApp extends React.Component {
            render() {
                return (
                    <Component
                        {...routeProps}
                    />
                )
            }

        }
    }
};



module.exports =  enhanceApp;