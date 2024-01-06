
bd.helper.registerAppComponent(class AppIconControl extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            hover: null
        }
    }

    render() {
        return wp.element.createElement(wp.components.BaseControl,
            {
                label: this.props.label || null
            },
            React.createElement('style', null, `
                .BDAppIconControl > .components-button-group {
                    --grid-layout-gap: 3px;
                    --grid-column-count: 5;
                    --grid-item--min-width: 40px;
                    --gap-count: calc(var(--grid-column-count) - 1);
                    --total-gap-width: calc(var(--gap-count) * var(--grid-layout-gap));
                    --grid-item--max-width: calc((100% - var(--total-gap-width)) / var(--grid-column-count));
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(max(var(--grid-item--min-width), var(--grid-item--max-width)), 1fr));
                    grid-gap: var(--grid-layout-gap);
                }
                .BDAppIconControl > .components-button-group .components-button {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .BDAppIconControl > .components-button-group .components-button+.components-button {
                    margin: 0;
                }
            `),
            React.createElement('div',
                {
                    style: {
                        display: 'flex',
                        gridGap: '10px',
                        alignItems: 'flex-end',
                        marginBottom: '10px'
                    }
                },
                this.props.value || this.state.open ? React.createElement('div',
                    {
                        style: {
                            width: '40px',
                            height: '40px',
                            padding: '10px',
                            border: '#ccc solid 1px',
                            boxSizing: 'content-box',
                        }
                    },
                    this.props.value /* || this.state.hover */ ? wp.element.createElement(wp.components.Dashicon,
                        {
                            icon: /* this.state.hover || */ this.props.value,
                            style: {
                                width: '40px',
                                height: '40px',
                                fontSize: '40px'
                            }
                        }
                    ) : null
                ) : null,
                this.state.open ? null : React.createElement('div',
                    {
                        style: {
                            display: 'flex',
                            gridGap: '10px'
                        }
                    },
                    this.props.value && this.props.allowEmpty !== false ? wp.element.createElement(wp.components.Button,
                        {
                            variant: 'secondary',
                            onClick: () => {
                                //this.setState({open: true});
                                this.props.onChange();
                                //this.setState((oldState) => ({open: !oldState.open}));
                            }
                        },
                        wp.i18n.__('Remove', 'block-designer')
                    ) : null,
                    wp.element.createElement(wp.components.Button,
                        {
                            variant: 'secondary',
                            onClick: () => {
                                this.setState({open: true});
                                //this.setState((oldState) => ({open: !oldState.open}));
                            }
                        },
                        this.props.value ? wp.i18n.__('Change', 'block-designer') : wp.i18n.__('Set Icon', 'block-designer')
                    )
                )
            ),
            this.state.open ? [
                React.createElement('div',
                    {
                        className: 'BDAppIconControl',
                        style: {
                            overflow: 'auto',
                            maxHeight: '250px',
                            marginBottom: '10px'
                        }
                    },
                    wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                        {
                            onChange: this.props.onChange,
                            /* onMouseOver: (event) => {
                                if (['BUTTON', 'SPAN'].indexOf(event.target.nodeName) > -1) {
                                    var icon = event.target.closest('button').firstElementChild?.className?.match(/dashicons\-([^\s]+)/)?.[1];
                                    if (icon) {
                                        this.setState({hover: icon});
                                    }
                                }
                            }, */
                            checked: this.props.value || null
                        },
                        Object.keys(BDData?.dashicons).map((iconName) => {
                            return wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                {
                                    value: iconName
                                }, wp.element.createElement(wp.components.Dashicon, {icon: iconName})
                            );
                        })
                    )
                ),
                React.createElement('div',
                    {
                        style: {
                            textAlign: 'right'
                        }
                    },
                    wp.element.createElement(wp.components.Button,
                        {
                            variant: 'secondary',
                            onClick: () => {
                                this.setState({open: false});
                            }
                        },
                        wp.i18n.__('Done', 'block-designer')
                    )
                )
            ] : null
        );
    }
});
