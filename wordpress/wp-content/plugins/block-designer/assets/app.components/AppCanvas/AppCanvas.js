
bd.helper.registerAppComponent(class AppCanvas extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mountNode: null,
            selectedRect: null
        }
        /* this.setContentRef = (contentRef) => {
            this.setMountPoint(contentRef?.contentWindow?.document);
        } */
        this.iframeElement = React.createRef();
        this.setMountPoint = this.setMountPoint.bind(this);
    }

    setMountPoint(iframeDocument) {
        if (!iframeDocument) return;

        iframeDocument.addEventListener('copy', this.props.onCopy);
        iframeDocument.addEventListener('cut', this.props.onCut);
        iframeDocument.addEventListener('paste', this.props.onPaste);
        iframeDocument.addEventListener('keyup', this.props.onKeyUp);

        if (iframeDocument?.body !== this.state.mountNode) {
            this.setState({
                mountNode: iframeDocument?.body
            });
        }
    }

    componentDidMount() {
        this.setMountPoint(this.props.canvasIFrame?.current?.contentDocument);
    }

    componentWillUnmount() {
        if (this.state.mountNode) {
            this.state.mountNode.ownerDocument.removeEventListener('copy', this.props.onCopy);
            this.state.mountNode.ownerDocument.removeEventListener('cut', this.props.onCut);
            this.state.mountNode.ownerDocument.removeEventListener('paste', this.props.onPaste);
            this.state.mountNode.ownerDocument.removeEventListener('keyup', this.props.onKeyUp);
        }
    }

    componentDidUpdate() {
        // if the selected node changed, we need to update the rect too
        const selectedNode = this.props.selectedNode;
        const selectedRect = selectedNode?.element?.current?.getBoundingClientRect();
        if (JSON.stringify(this.state.selectedRect) !== JSON.stringify(selectedRect))
        {
            /* setTimeout((() => {
                console.log(this.state.selectedRect, selectedRect, JSON.stringify(this.state.selectedRect), JSON.stringify(selectedRect));
                this.setState({selectedRect});
            }).bind(this), 500) */
            this.setState({selectedRect});
        }
    }

    render() {
        const { children, canvasZoomLevel, canvasDeviceWidth, canvasScrollContainer, canvasScrollContainerScrollbarWidth, showThemeStyles, ...props } = this.props;
        const { mountNode } = this.state;

        const hoveredNode = this.props.hoveredNode;
        const selectedNode = this.props.selectedNode;
        const hoveredRect = hoveredNode?.element?.current?.getBoundingClientRect();
        const selectedRect = selectedNode?.element?.current?.getBoundingClientRect();

        const canvaswindow = mountNode?.ownerDocument?.defaultView;
        const scrollPos = {
            left: canvaswindow ? canvaswindow.scrollX : 0,
            top: canvaswindow ? canvaswindow.scrollY : 0,
        };

        /* const canvasRect = this.state.canvas?.getBoundingClientRect(); */

        
        return [
            React.createElement('div',
                {
                    style: {
                        '--ruler-size': '20px',
                        '--color1': '#fff',
                        '--color2': '#eee',
                        width: '100%',
                        height: 'var(--ruler-size)',
                        overflow: 'hidden',
                        position: 'relative'
                    }
                },
                React.createElement('div',
                {
                    style: {
                        /* width: canvasDeviceWidth + 'px',
                        maxWidth: '100%', */
                        width: '400%',
                        position: 'absolute',
                        right: '50%',
                        top: 0,
                        transform: 'translateX(50%) translateX(-' + (Math.round(canvasScrollContainerScrollbarWidth / 2) || 0) + 'px) scaleX(' + canvasZoomLevel + ') translateX(-' + (Math.round(canvasDeviceWidth / 2) || 0) + 'px)',
                        transition: 'transform .15s',
                        boxSizing: 'border-box',
                        paddingTop: 'var(--ruler-size)',
                        backgroundColor: showThemeStyles ? '' : '#fff',
                        backgroundImage: [
                            'linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 100px)',
                            'linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 50px)',
                            'linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 10px)',
                            'linear-gradient(#fff 0%, #fff 100%)',
                            ...(showThemeStyles ? [] : ['url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>\')']),
                            //'conic-gradient(var(--color1) 90deg, var(--color2) 90deg 180deg, var(--color1) 180deg 270deg, var(--color2) 270deg)',
                        ].join(', '),
                        backgroundSize: [
                            '100px calc(var(--ruler-size) * 3 / 4)',
                            '50px calc(var(--ruler-size) / 2)',
                            '10px calc(var(--ruler-size) / 4)',
                            '100% var(--ruler-size)',
                            ...(showThemeStyles ? [] : ['16px 16px']),
                            //'10px 10px',
                        ].join(', '),
                        backgroundRepeat: [
                            'repeat-x',
                            'repeat-x',
                            'repeat-x',
                            'no-repeat',
                            ...(showThemeStyles ? [] : ['repeat']),
                            //'repeat',
                        ].join(', '),
                        backgroundPosition: [
                            'calc(50% + 50px) calc(var(--ruler-size) / 4)',
                            'calc(50% + 25px) calc(var(--ruler-size) / 2)',
                            'calc(50% + 5px) calc(var(--ruler-size) * 3 / 4)',
                            'left top',
                            ...(showThemeStyles ? [] : ['left top']),
                            //'left top',
                        ].join(', '),
                    }
                }
            )
            ),
            React.createElement('iframe',
                {
                    title: '',
                    ...props,
                    //ref: this.setContentRef,
                    ref: this.props.canvasIFrame,
                    style: {
                        width: '100%',
                        flexGrow: 1,
                    },
                    onLoad: (e) => {
                        if (e.target === this.props.canvasIFrame.current) {
                            this.setMountPoint(e.target.contentDocument);
                        }
                    }
                },
                mountNode && ReactDOM.createPortal(
                    [
                        React.createElement('style',
                            null,
                            'html, body { padding: 0; margin: 0; cursor: default; overflow: hidden; } /* html { overflow: scroll; } */'
                        ),
                        wp.element.createElement(wp.blockEditor.EditorStyles || wp.blockEditor.__unstableEditorStyles, {
                            styles: [
                                ...BDData.defaultBlockEditorSettings.defaultEditorStyles,
                                ...BDData.defaultBlockEditorSettings.styles
                            ]
                        }),
                        React.createElement('style', null, BDData.layoutStyle.replace(/SELECTOR/g, '.is-root-container.block-editor-block-list__layout')),
                        React.createElement('div',
                            {
                                ref: canvasScrollContainer,
                                className: showThemeStyles ? 'editor-styles-wrapper' : '',
                                style: {
                                    overflow: 'scroll',
                                    height: '100vh',
                                    ...(showThemeStyles ? {} : {
                                        backgroundColor: '#fff',
                                        backgroundImage: 'url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>\')',
                                        backgroundSize: '16px 16px',
                                        backgroundRepeat: 'repeat',
                                        backgroundPosition: 'left top',
                                    }),
                                }
                            },
                            showThemeStyles ? React.createElement('div',
                                {
                                    className: 'is-root-container block-editor-block-list__layout has-global-padding'
                                },
                                React.createElement('div',
                                    {
                                        className: this.props.layoutView ? 'align' + this.props.layoutView : '',
                                    },
                                    React.createElement('div',
                                        {
                                            style: {
                                                width: canvasDeviceWidth + 'px',
                                                transform: 'scale(' + canvasZoomLevel + ')',
                                                transformOrigin: 'left top',
                                                transition: 'width .15s, transform .15s',
                                                margin: '3rem auto',
                                            }
                                        },
                                        children
                                    )
                                )
                            ) : React.createElement('div',
                                {
                                    style: {
                                        width: canvasDeviceWidth + 'px',
                                        transform: 'scale(' + canvasZoomLevel + ')',
                                        transformOrigin: 'left top',
                                        transition: 'width .15s, transform .15s',
                                        margin: '3rem auto',
                                    }
                                },
                                children
                            )
                        ),
                        /* (() => {
                            console.log('RECT', selectedRect, selectedNode?.element?.current?.getBoundingClientRect());
                        })(), */
                        selectedRect ? React.createElement('div',
                            {
                                style: {
                                    border: '#f00 solid 1px',
                                    position: 'absolute',
                                    zIndex: '100000000',
                                    left: (scrollPos.left + selectedRect.left) + 'px',
                                    top: (scrollPos.top + selectedRect.top) + 'px',
                                    height: selectedRect.height + 'px',
                                    width: selectedRect.width + 'px',
                                    boxSizing: 'border-box',
                                    pointerEvents: 'none'
                                }
                            },
                            !hoveredRect || hoveredNode === selectedNode ? wp.element.createElement('div',
                                {
                                    style: {
                                        position: 'absolute',
                                        bottom: 'calc(100% + 2px)',
                                        left: '-1px',
                                        background: '#f00',
                                        color: '#fff',
                                        padding: '0 5px',
                                        borderRadius: '3px 3px 0 0',
                                        fontSize: '10px',
                                        fontFamily: 'Verdana, sans-serif',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '18px'
                                    }
                                },
                                this.props.selectedNode.handler.name + ' ( ' + (Math.round((selectedRect.width / canvasZoomLevel) * 1000) / 1000) + ' x ' + (Math.round((selectedRect.height / canvasZoomLevel) * 1000) / 1000) + ' )'
                            ) : null/* ,
                            wp.element.createElement(wp.components.ResizeTooltip) */
                        ) : null,
                        hoveredRect && hoveredNode !== selectedNode ? React.createElement('div',
                            {
                                style: {
                                    border: '#00f solid 1px',
                                    position: 'absolute',
                                    zIndex: '100000000',
                                    left: (scrollPos.left + hoveredRect.left) + 'px',
                                    top: (scrollPos.top + hoveredRect.top) + 'px',
                                    height: hoveredRect.height + 'px',
                                    width: hoveredRect.width + 'px',
                                    boxSizing: 'border-box',
                                    pointerEvents: 'none'
                                }
                            },
                            wp.element.createElement('div',
                                {
                                    style: {
                                        position: 'absolute',
                                        bottom: 'calc(100% + 2px)',
                                        left: '-1px',
                                        background: '#00f',
                                        color: '#fff',
                                        padding: '0 5px',
                                        borderRadius: '3px 3px 0 0',
                                        fontSize: '10px',
                                        fontFamily: 'Verdana, sans-serif',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '18px'
                                    }
                                },
                                this.props.hoveredNode.handler.name + ' ( ' + (Math.round((hoveredRect.width / canvasZoomLevel) * 1000) / 1000) + ' x ' + (Math.round((hoveredRect.height / canvasZoomLevel) * 1000) / 1000) + ' )'
                            )
                        ) : null
                    ],
                mountNode)
            )
        ];
    }
});
