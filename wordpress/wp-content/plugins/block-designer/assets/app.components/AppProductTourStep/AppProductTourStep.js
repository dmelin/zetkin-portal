
bd.helper.registerAppComponent(class AppProductTourStep extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            referenceRect: null,
            referenceRectJSON: null
        };

        this.mutationObserver = null;
    }

    getReferenceRect() {
        if (this.props.selector) {

            const { selector } = this.props;
            const rect = typeof selector === 'string' ? document.querySelector(selector)?.getBoundingClientRect() : null;
            //const rect = this.getReferenceRect();
            if (!rect) {
                this.setState({referenceRect: null, referenceRectJSON: null});
                return;
            }

            const rectJSON = JSON.stringify(rect);
            if (this.state.referenceRectJSON === null || rectJSON !== this.state.referenceRectJSON) {
                this.setState({referenceRect: rect, referenceRectJSON: rectJSON});
            }
        }
    }

    /* componentDidUpdate() {
        this.getReferenceRect();
    } */

    componentWillUnmount() {
        this.mutationObserver.disconnect();
    }

    componentDidMount() {
        //this.getReferenceRect();
        this.mutationObserver = new MutationObserver((mutations) => {
            /* mutations.forEach((mutation) => {
                console.log(mutation);
            }); */
            this.getReferenceRect();
        });
        this.mutationObserver.observe(bd.app.rootDOMNode, {
            childList: true,
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });
    }

    render() {
        const { condition, selector, content } = this.props;
        const { referenceRect } = this.state;

        if (typeof selector === 'string' && referenceRect === null) {
            return null;
        }

        if (typeof condition === 'function' && !condition()) {
            return null;
        }

        this.getReferenceRect();

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const style = document.createElement('div').style;
        //console.log(this.props.style);

        let transformOrigin = ['',''];

        Object.assign(style, {
            //position: 'fixed',
            /* width: '200px',
            height: '100px', */
            //background: '#fff',
            //borderWidth: '3px',
            /* borderStyle: 'solid',
            borderTopColor: 'var(--wp-admin-theme-color)',
            borderRightColor: 'var(--wp-admin-theme-color)',
            borderBottomColor: 'var(--wp-admin-theme-color)',
            borderLeftColor: 'var(--wp-admin-theme-color)', */
            //borderRadius: '4px',
            //boxSizing: 'border-box',
            //zIndex: 100000000,
            //padding: '1rem',
            //boxShadow: '.25rem .25rem 1rem rgba(0, 0, 0, .1)'
        }, this.props.style);

        const borderWidth = this.props.borderWidth || parseInt(style.borderWidth) || 3;

        let arrowStyle = null;
        let arrowWidth = this.props.arrowWidth || 20;
        let posStyle = null;

        if (referenceRect) {
            let spacePos = null;
            const spaces = {
                left: referenceRect.left,
                right: viewportWidth - referenceRect.right,
                top: referenceRect.top,
                bottom: viewportHeight - referenceRect.bottom
            };
            Object.keys(spaces).forEach((pos) => {
                if (spacePos === null || spaces[pos] > spaces[spacePos]) {
                    spacePos = pos;
                }
            });
            //spacePos = 'top';
            
            /* posStyle = {
                right: '50%',
                bottom: '50%',
                transform: 'translate(50%, 50%)'
            }; */
            
            arrowStyle = {
                position: 'absolute',
                //background: style.background,
                /* borderWidth: borderWidth + 'px',
                borderStyle: style.borderStyle,
                borderTopColor: style.borderTopColor,
                borderRightColor: style.borderRightColor,
                borderBottomColor: style.borderBottomColor,
                borderLeftColor: style.borderLeftColor, */
                width: arrowWidth + 'px',
                height: arrowWidth + 'px',
                boxSizing: 'border-box',
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%)',
                display: 'none',
                //borderWidth:'1px'
            };

            [
                'border',
                'borderWidth',
                'borderStyle',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'background',
                'backgroundColor',
                'outline',
                'outlineWidth',
                'outlineStyle',
                'outlineColor',
            ].forEach((propertyName) => {
                if (style[propertyName]) {
                    arrowStyle[propertyName] = style[propertyName];
                }
            });

    
            //const borderWidth = parseInt(style.borderWidth);
            const arrowRadius = Math.sqrt(arrowWidth * arrowWidth / 2);
            const margin = (arrowRadius - borderWidth) + 'px';

            if (['top', 'right', 'bottom', 'left'].indexOf(spacePos)) {
                posStyle = {
                    position: 'fixed',
                    zIndex: 100000000,
                };
            }

            //console.log('RENDER THE TOUR', viewportHeight, referenceRect.top, referenceRect.height);
            //console.log('translateY(calc(' + ((viewportHeight - referenceRect.height - referenceRect.top) * 100 / (viewportHeight - referenceRect.height)) + '%))');

            if (['left', 'right'].indexOf(spacePos) > -1) {
                if (this.props.centerArrow) {
                    posStyle.bottom = (viewportHeight - referenceRect.bottom + (referenceRect.height / 2)) + 'px';
                    posStyle.transform = 'translateY(50%)';
                    posStyle['margin-' + (spacePos === 'left' ? 'right' : 'left')] = margin;
                    transformOrigin = [(spacePos === 'left' ? 'calc(100% + ' + margin + ')' : '-' + margin), '50%'];
                    //posStyle.transformOrigin = transformOrigin.join(' ');

                    arrowStyle.bottom = '50%';
                    arrowStyle[spacePos] = '100%';
                    arrowStyle.transform = 'translate(' + (spacePos === 'left' ? '-' : '') + '50%, 50%) rotate(' + (spacePos === 'left' ? 45 : -135) + 'deg)';
                } else {
                    const elementCenter = (viewportHeight - referenceRect.bottom + (referenceRect.height / 2));
                    const per = ((viewportHeight - referenceRect.height - referenceRect.top) / (viewportHeight - referenceRect.height));
                    posStyle.bottom = (viewportHeight - referenceRect.bottom + (referenceRect.height * per)) + 'px';
                    posStyle.transform = 'translateY(' + (per * 100) + '%)';// translateY(' + ((elementCenter / viewportHeight / 2) * (arrowRadius * -2)) + 'px)';
                    posStyle['margin-' + (spacePos === 'left' ? 'right' : 'left')] = margin;
                    //posStyle.transformOrigin = (spacePos === 'left' ? 'calc(100% + ' + margin + ')' : '-' + margin) + ' calc(' + ((1 - per) * 100) + '% + ' + ((arrowRadius - (arrowWidth / 2)) * (per - .5)) + 'px + ' + ((per - .5) * arrowWidth) + 'px)';
                    transformOrigin = [(spacePos === 'left' ? 'calc(100% + ' + margin + ')' : '-' + margin), 'calc(' + ((1 - per) * 100) + '% + ' + ((arrowRadius * 2) * (per - .5)) + 'px)'];
                    //posStyle.transformOrigin = transformOrigin.join(' ');

                    arrowStyle.bottom = 'calc(' + (per * 100) + '% + ' + ((arrowRadius - (arrowWidth / 2)) * -(per - .5)) + 'px)';
                    arrowStyle[spacePos] = '100%';
                    arrowStyle.transform = 'translate(' + (spacePos === 'left' ? '-' : '') + '50%, ' + (per * 100) + '%)' + ' rotate(' + (spacePos === 'left' ? 45 : -135) + 'deg)';
                }
            }

            if (['top', 'bottom'].indexOf(spacePos) > -1) {
                if (this.props.centerArrow) {
                    posStyle.right = (viewportWidth - referenceRect.right + (referenceRect.width / 2)) + 'px';
                    posStyle.transform = 'translateX(50%)';
                    posStyle['margin-' + (spacePos === 'top' ? 'bottom' : 'top')] = margin;
                    transformOrigin = ['50%', (spacePos === 'top' ? 'calc(100% + ' + margin + ')' : '-' + margin)];
                    //posStyle.transformOrigin = transformOrigin.join(' ');

                    arrowStyle.right = '50%';
                    arrowStyle[spacePos] = '100%';
                    arrowStyle.transform = 'translate(50%, ' + (spacePos === 'top' ? '-' : '') + '50%) rotate(' + (spacePos === 'top' ? 135 : -45) + 'deg)';
                } else {
                    const per = ((viewportWidth - referenceRect.width - referenceRect.left) / (viewportWidth - referenceRect.width));
                    posStyle.right = (viewportWidth - referenceRect.right + (referenceRect.width * per)) + 'px';
                    posStyle.transform = 'translateX(' + (per * 100) + '%)';
                    posStyle['margin-' + (spacePos === 'top' ? 'bottom' : 'top')] = margin;
                    transformOrigin = ['calc(' + ((1 - per) * 100) + '% + ' + ((arrowRadius * 2) * (per - .5)) + 'px)', (spacePos === 'top' ? 'calc(100% + ' + margin + ')' : '-' + margin)];
                    //posStyle.transformOrigin = transformOrigin.join(' ');

                    arrowStyle.right = 'calc(' + (per * 100) + '% + ' + ((arrowRadius - (arrowWidth / 2)) * -(per - .5)) + 'px)';
                    arrowStyle[spacePos] = '100%';
                    arrowStyle.transform = 'translate(' + (per * 100) + '%, ' + (spacePos === 'top' ? '-' : '') + '50%)' + ' rotate(' + (spacePos === 'top' ? 135 : -45) + 'deg)';
                }
            }
            arrowStyle.display = '';


            switch (spacePos) {
                case 'left':
                    posStyle.right = (viewportWidth - referenceRect.right + referenceRect.width) + 'px';
                break;
                case 'right':
                    posStyle.left = referenceRect.right + 'px';
                break;
                case 'top':
                    posStyle.bottom = (viewportHeight - referenceRect.bottom + referenceRect.height) + 'px';
                    /* arrowStyle = {
                        ...arrowStyle,
                        right: '50%',
                        top: '100%',
                        transform: 'translate(50%, -50%) rotate(135deg)',
                        display: ''
                    }; */
                break;
                case 'bottom':
                    posStyle.top = referenceRect.bottom + 'px';
                    /* arrowStyle = {
                        ...arrowStyle,
                        right: '50%',
                        bottom: '100%',
                        transform: 'translate(50%, 50%) rotate(-45deg)',
                        display: ''
                    }; */
                break;
            }
            //Object.assign(style, posStyle, this.props.style || {}/* , {borderWidth:'1px'} */);
            Object.assign(style, {
                transformOrigin: transformOrigin.join(' ')
            }, this.props.style || {}/* , {borderWidth:'1px'} */);
        }

        //console.log(transformOrigin);

        return React.createElement('div',
            {
                className: 'AppProductTourStep' + (this.props.className ? ' ' + this.props.className : ''),
                style: posStyle,
                //style: bd.helper.getObjectFromStyle(style)
            },
            /* React.createElement('div',
                {
                    style: {
                        pointerEvents: 'none',
                        position: 'absolute',
                        left: '-3px',
                        top: '-3px',
                        width: 'calc(100% + 6px)',
                        height: 'calc(100% + 6px)',
                        //border: 'solid 1px rgba(0, 0, 0, .3)',
                        boxSizing: 'border-box',
                        transform: 'translate(' + transformOrigin.join(', ') + ')'
                        //transform: 'translate()'
                    }
                },
                React.createElement('div', {
                    style: {
                        position: 'absolute',
                        left: '-1px',
                        top: '-1px',
                        width: '2px',
                        height: '2px',
                        background: '#000'
                    }
                })
            ), */
            React.createElement('div',
                {
                    className: 'AppProductTourStep--content',
                    style: bd.helper.getObjectFromStyle(style)
                },
                arrowStyle !== null ? React.createElement('div', {className: 'AppProductTourStep--arrow', style: arrowStyle}) : null,
                content || null,
                React.createElement('div',
                    {
                        style: {
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            width: '100%',
                            textAlign: 'center'
                        }
                    },
                    this.props.steps.map((step, index, ok) => {
                        const currentStepIndex = this.props.stepIndex;
                        return React.createElement(bd.components.Icon,
                            {
                                icon: 'circle-medium',
                                color: currentStepIndex === index ? 'var(--wp-admin-theme-color)' : (currentStepIndex > index ? 'var(--wp-admin-theme-color-darker-20)' : '#ccc')
                            }
                        );
                    })
                )
            )
        );
    }
});
