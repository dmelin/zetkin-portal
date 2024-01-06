
bd.helper.registerAppComponent(class AppBaseControl extends React.Component {
    render() {
        const { onReset, isSet, ...props } = this.props;

        props.label = React.createElement('div',
            {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            },
            props.label,
            React.createElement('div',
                {
                    style: {
                        display: 'flex',
                        gap: '4px'
                    }
                },
                onReset ? wp.element.createElement(wp.components.Button,
                    {
                        variant: 'secondary',
                        isSmall: true,
                        disabled: !isSet,
                        onClick: onReset
                    },
                    wp.i18n.__('Reset', 'block-designer')
                ) : null,
                props.toolPanel ? props.toolPanel : null
            )
        );

        return wp.element.createElement(wp.components.BaseControl, props);
    }
});
