
bd.helper.registerAppComponent(class AppControlUnit extends React.Component {
    render() {
        const props = {...this.props};
        if (props.units === undefined) {
            props.units = [
                { value: 'px', label: 'px' },
                { value: '%', label: '%', step: .1 },
                { value: 'em', label: 'em', step: .01 },
                { value: 'rem', label: 'rem', step: .01 },
                { value: 'ch', label: 'ch', step: .1 },
                { value: 'vw', label: 'vw', step: .1 },
                { value: 'vh', label: 'vh', step: .1 },
            ];
        }

        return wp.element.createElement(wp.components.UnitControl || wp.components.__experimentalUnitControl, props );
    }
});
