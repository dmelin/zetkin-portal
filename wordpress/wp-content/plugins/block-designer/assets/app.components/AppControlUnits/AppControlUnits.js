
bd.helper.registerAppComponent(class AppControlUnits extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLinked: true
        };
    }

    render() {
        const result = React.createElement('div',
            {
                style: {
                    display: 'flex'
                }
            },
            wp.element.createElement(bd.app.components.AppControlUnit,
                {
                    label: this.props.fields[0].label,
                    value: this.props.fields[0].value,
                    labelPosition: 'bottom',
                    min: 0,
                    onChange: (newValue) => {
                        this.props.onChange(this.state.isLinked ? {
                            [this.props.propertyName]: newValue
                        } : {
                            [this.props.fields[0].propertyName]: newValue
                        });
                    }
                }
            ),
            wp.element.createElement(wp.components.Button,
                {
                    onClick: () => {
                        this.setState((oldState) => ({isLinked: !oldState.isLinked}));
                    }
                },
                React.createElement(bd.components.Icon, {icon: this.state.isLinked ? 'link' : 'link-off'})
            ),
            wp.element.createElement(bd.app.components.AppControlUnit,
                {
                    label: this.props.fields[1].label,
                    value: this.props.fields[1].value,
                    labelPosition: 'bottom',
                    min: 0,
                    onChange: (newValue) => {
                        this.props.onChange(this.state.isLinked ? {
                            [this.props.propertyName]: newValue
                        } : {
                            [this.props.fields[1].propertyName]: newValue
                        });
                    }
                }
            )
        );

        if (!this.props.label) {
            return result;
        }

        return wp.element.createElement(bd.app.components.AppBaseControl,
            {
                label: this.props.label
            },
            result
        );
    }
});
