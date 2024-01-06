
bd.helper.registerAppComponent(class AppControlColor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            inputValue: null
        }

        this.element = React.createRef();

        this.color2hex = this.color2hex.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    color2hex(rgba) {
        if (!rgba.match(/^\#[0-9a-f]{3}(?:[0-9a-f]{3}(?:[0-9a-f]{2})?)?$/i)) {
            const element = document.createElement('div');
            element.style.color = rgba;
            document.body.appendChild(element);
            const match = getComputedStyle(element)?.color?.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/);
            element.remove();
            rgba = match ? '#' + match.slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('') : null;
        }
        return rgba;
    }

    onClick(event) {
        if (event.target && this.element?.current?.contains(event.target)) {
            return;
        }
        this.setState({open:false});
    }

    componentDidMount() {
        document.addEventListener('click', this.onClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClick);
    }

    render() {
        const currentColor = (this.props.value ? this.color2hex(this.props.value) || '' : '');

        const result = React.createElement('div',
            {
                style: {
                    display: 'inline-block'
                },
                ref: this.element
            },
            React.createElement('div',
                {
                    style: {
                        display: 'flex',
                        verticalAlign: 'middle'
                    }
                },
                React.createElement('button',
                    {
                        style: {
                            cursor: 'pointer',
                            border: 0,
                            padding: 0,
                            margin: 0,
                            width: '60px',
                            height: '30px',
                            verticalAlign: 'middle',
                            border: 'solid #8c8f94',
                            borderWidth: '1px 1px 1px 1px',
                            borderRadius: this.state.open ? '4px 0 0 0' : '4px 0 0 4px',
                            backgroundColor: '#fff',
                            backgroundImage: [].concat(
                                currentColor !== '' ? ['linear-gradient(' + currentColor + ' 0, ' + currentColor + ' 100%)'] : [],
                                ['url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>\')']
                            ).join(', '),
                            backgroundSize: [].concat(
                                currentColor !== '' ? ['100% 100%'] : [],
                                ['16px 16px']
                            ).join(', ')
                        },
                        onClick: (event) => {
                            this.setState((oldState) => ({open:!oldState.open}));
                        }
                    }
                ),
                React.createElement('input',
                    {
                        style: {
                            border: 'solid #8c8f94',
                            borderWidth: '1px 1px 1px 0',
                            borderRadius: this.state.open ? '0 4px 0 0' : '0 4px 4px 0',
                            margin: 0
                        },
                        type: 'text',
                        value: this.state.inputValue !== null ? this.state.inputValue : currentColor,
                        readonly: true,
                        onChange: (event) => {
                            const value = event.target.value;
                            const hex = value === '' ? '' : this.color2hex(value);
                            if (hex !== null) {
                                this.props.onChange(hex);
                            }
                            this.setState({inputValue:value});
                        },
                        onBlur: (event) => {
                            const value = event.target.value;
                            const hex = value === '' ? '' : this.color2hex(value);
                            if (hex !== null) {
                                this.props.onChange(hex);
                            }
                            this.setState({inputValue:null});
                        }
                    }
                )
            ),
            this.state.open ? React.createElement('div',
                {
                    style: {
                        border: '1px solid #8c8f94',
                        borderTop: 0,
                        borderRadius: '0 0 4px 4px',
                        backgroundColor: '#fff',
                        display: 'flex',
                        verticalAlign: 'middle',
                        justifyContent: 'center',
                        padding: 'calc((100% - 216px) / 2) 0'
                    }
                },
                wp.element.createElement(wp.components.ColorPicker,
                    {
                        onChange: this.props.onChange,
                        enableAlpha: this.props.alpha !== undefined ? this.props.alpha : true,
                        color: this.props.value
                    }
                )
            ) : null
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
