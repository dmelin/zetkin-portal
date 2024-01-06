
bd.helper.registerAppComponent(class AppPanelBody extends React.Component {
    render() {
        return wp.element.createElement(wp.components.PanelBody,
            {
                ...this.props,
                ...(this.props.title && this.props.isSet ? {
                    title: [
                        React.createElement(bd.components.Icon,
                            {
                                icon: 'circle-medium',
                                color: 'var(--wp-admin-theme-color)',
                                title: 'There are styles set',
                                'aria-hidden': 'false'
                            }
                        ),
                        this.props.title,
                    ]
                } : {}),
            }
        );
    }
});
