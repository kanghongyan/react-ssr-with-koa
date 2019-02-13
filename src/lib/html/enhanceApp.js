import React from 'react'


const enhanceApp = ({
                        initialData,
                        ...routeProps
                    }) => {
    return (Component) =>
        class InnerApp extends React.Component {
            render() {
                return (
                    <Component
                        initialData={initialData}
                        {...routeProps}
                    />
                )
            }

    }
};



module.exports =  enhanceApp