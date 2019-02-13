const React = require('react');
const StaticRouter = require('react-router-dom').StaticRouter;

// only for ssr
class Container extends React.Component {
    render() {

        const {
            children,
            basename,
            location,
            context
        } = this.props;

        return (
            <StaticRouter
                basename={basename}
                location={location}
                context={context}
            >
                {children}
            </StaticRouter>
        )
    }

}

module.exports = Container;
