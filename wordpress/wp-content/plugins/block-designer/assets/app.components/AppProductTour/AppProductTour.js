
bd.helper.registerAppComponent(class AppProductTour extends React.Component {

    componentDidUpdate() {

    }

    render() {
        const { steps } = this.props;

        const stepCount = steps.length;

        return steps.map((step, index) => {
            return React.createElement(bd.app.components.AppProductTourStep, {
                ...this.props,
                ...step,
                stepIndex: index,
                stepCount: stepCount,
                style: {
                    ...this.props.style,
                    ...step.style
                }
            });
        });
    }
});
