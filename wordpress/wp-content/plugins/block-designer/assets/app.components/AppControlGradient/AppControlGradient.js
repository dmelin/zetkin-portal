
bd.helper.registerAppComponent(class AppControlGradient extends React.Component {
    render() {

        const result = wp.element.createElement(wp.components.GradientPicker,
            {
                gradients: [], // even it is not market as required in the documentation, it throws an error if it is not specified
                className: 'bd-AppControlGradient',
                value: (() => {
                    return this.props.value?.match(/(?:linear|radial)\-gradient\([^\(\)]*(?:\([^\(\)]*\)[^\(\)]*)*\)/)?.[0] || null;
                })(),
                onChange: (newValue) => {
                    this.props.onChange(newValue || '');
                }
            }
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
