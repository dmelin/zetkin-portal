
bd.helper.registerAppComponent(class AppElementCard extends React.Component {
    render() {
        const { node } = this.props;

        return React.createElement('div',
            {
                /* className: 'block-editor-block-card', */
                style: {
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start'
                }
            },
            React.createElement('span',
                {
                    /* className: 'block-editor-block-icon has-colors', */
                    style: {
                        flex: '0 0 24px',
                        marginLeft: 0,
                        marginRight: '12px',
                        width: '24px',
                        height: '24px'
                    }
                },
                React.createElement(bd.components.Icon,
                    {
                        icon: node.handler.icon
                    }
                )
            ),
            React.createElement('div',
                {
                    /* className: 'block-editor-block-card__content', */
                    style: {
                        flexGrow: 1,
                        marginBottom: '4px'
                    }
                },
                React.createElement('h2',
                    {
                        className: 'block-editor-block-card__title',
                        style: {
                            lineHeight: '24px',
                            margin: '0 0 4px',
                            fontSize: '13px'
                        }
                    },
                    node.handler.name
                ),
                React.createElement('span',
                    {
                        className: 'block-editor-block-card__description'
                    },
                    node.handler.description
                )
            )
        );
    }
});
