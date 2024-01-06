



bd.helper.registerAppComponent(class AppOverviewPreviewCanvas extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mountNode: null
        }
        /* this.setContentRef = (contentRef) => {
            this.setMountPoint(contentRef?.contentWindow?.document);
        } */
        this.iframeElement = React.createRef();
        this.setMountPoint = this.setMountPoint.bind(this);
    }

    componentDidMount() {
        this.setMountPoint(this.iframeElement?.current?.contentDocument);
    }

    setMountPoint(iframeDocument) {
        if (iframeDocument?.body !== this.state.mountNode) {
            this.setState({
                mountNode: iframeDocument?.body
            });
        }
        //console.log(iframeDocument?.body?.outerHTML);
    }

    render() {
        const { children, ...props } = this.props;
        const { mountNode } = this.state;

        const showThemeStyles = bd.helper.storageGet('showThemeStyles', true);

        return [
            children ? React.createElement('iframe',
                {
                    title: '',
                    className: 'bd-overview--preview bd-overview--preview-filled',
                    ...props,
                    //ref: this.setContentRef,
                    ref: this.iframeElement,
                    onLoad: (e) => {
                        if (e.target === this.iframeElement.current) {
                            this.setMountPoint(e.target.contentDocument);
                        }
                    }
                },
                mountNode && ReactDOM.createPortal(
                    [
                        React.createElement('style',
                            null,
                            'html, body { padding: 0; margin: 0; height: 100vh; overflow: hidden; }'
                        ),
                        wp.element.createElement(wp.blockEditor.EditorStyles || wp.blockEditor.__unstableEditorStyles, {
                            styles: [
                                ...BDData.defaultBlockEditorSettings.defaultEditorStyles,
                                ...BDData.defaultBlockEditorSettings.styles
                            ]
                        }),
                        React.createElement('div',
                            {
                                className: showThemeStyles ? 'editor-styles-wrapper' : '',
                                style: {
                                    boxSizing: 'border-box',
                                    minHeight: '100%'
                                }
                            },
                            React.createElement('div',
                                {
                                    style: {
                                        transform: 'scale(0.596)',
                                        transformOrigin: 'left top',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0
                                    }
                                },
                                React.createElement('div',
                                    {
                                        style: {
                                            width: '500px',
                                            minHeight: '400px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            padding: '20px',
                                            boxSizing: 'border-box',
                                        }
                                    },
                                    children
                                )
                            )
                        )
                    ],
                mountNode)
            ) : React.createElement('em', {
                className: 'bd-overview--preview bd-overview--preview-empty'
            }, wp.i18n.__('empty', 'block-designer'))
        ];
    }
});





bd.helper.registerAppComponent(class AppOverview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hoverBlock: null,
            hoverBlockContent: null,
            listView: localStorage.getItem('bdOverviewListview') || 'previews' // icons/previews
        };
    }

    changeListView(listView) {
        this.setState({listView});
        localStorage.setItem('bdOverviewListview', listView);
    }

    render() {

        const { Icon } = bd.components;

        //console.log(this.state.hoverBlockContent);
        return React.createElement('div',
            {
                className: 'bd-overview'
            },
            this.props.blocks === null ? React.createElement('div',
                {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        height: '100%'
                    }
                },
                wp.element.createElement('span', {style:{flexGrow:(2 - 1.61803399)}}),
                wp.element.createElement(wp.components.Spinner)
            ) : React.createElement('div',
                {
                    className: 'bd-overview--main',
                    style: {
                        display: 'flex',
                        flexDirection: 'column'
                    }
                },
                bd.helper.getBlocksCount() === 0 ? null :
                [
                    /* React.createElement('div',
                        {
                            className: 'bd-overview--main-top'
                        },
                        wp.element.createElement(wp.components.BaseControl,
                            {
                                //label: 'View'
                            },
                            wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                {
                                    onChange: (newValue) => { this.changeListView(newValue); },
                                    checked: this.state.listView
                                },
                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                    {
                                        icon: React.createElement(Icon, {icon:'dock-bottom'}),
                                        variant: this.state.listView === 'previews' ? 'primary' : 'secondary',
                                        value: 'previews',
                                        //isSmall: true
                                    },
                                    'Previews'
                                ),
                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                    {
                                        icon: React.createElement(Icon, {icon:'dots-grid'}),
                                        variant: this.state.listView !== 'previews' ? 'primary' : 'secondary',
                                        value: 'icons',
                                        //isSmall: true
                                    },
                                    'Icons'
                                )
                            )
                        )
                    ), */
                    React.createElement('ul',
                        {
                            className: 'bd-overview--list bd-overview--list-' + this.state.listView
                        },
                        this.props.blocks.map((block) => {
                            const blockContent = block.contentObject;//JSON.parse(block.content.raw);

                            /* if (block?.contentObject?.domtree?.handler) {

                                console.log(wp.blocks.getBlockFromExample(block.blockFullName, {
                                    attributes: {
                                        ...block.contentObject.domtree.handler.getBlockExampleAttributes({recursively:true})
                                    }
                                }));

                                console.log(React.createElement(bd.app.components.AppCanvasElement,
                                    {
                                        domnode: blockContent.domtree
                                    }
                                ));
                            } */

                            //console.log(block);
                            return React.createElement('li',
                                {
                                    className: 'bd-overview--list-item',
                                    onMouseEnter: () => {
                                        this.setState({hoverBlock: block, hoverBlockContent: blockContent});
                                    },
                                    onMouseLeave: () => {
                                        this.setState({hoverBlock: null, hoverBlockContent: null});
                                    }
                                },
                                /* this.state.listView === 'previews' ? [
                                    blockContent.domtree ? wp.element.createElement(wp.blockEditor.BlockPreview,
                                        {
                                            //__experimentalPadding: 16,
                                            //viewportWidth: (_hoveredItemBlockType = (_hoveredItemBlockType2 = hoveredItemBlockType.example) === null || _hoveredItemBlockType2 === void 0 ? void 0 : _hoveredItemBlockType2.viewportWidth) !== null && _hoveredItemBlockType !== void 0 ? _hoveredItemBlockType : 500,
                                            //blocks: hoveredItemBlockType.example ? (0,external_wp_blocks_namespaceObject.getBlockFromExample)(item.name, {
                                            //    attributes: { ...hoveredItemBlockType.example.attributes,
                                            //        ...initialAttributes
                                            //    },
                                            //    innerBlocks: hoveredItemBlockType.example.innerBlocks
                                            //}) : (0,external_wp_blocks_namespaceObject.createBlock)(name, initialAttributes)
                                            __experimentalPadding: 16,
                                            viewportWidth: 500,
                                            //blocks: wp.blocks.createBlock(block.blockFullName, {})
                                            blocks: wp.blocks.getBlockFromExample(block.blockFullName, {
                                                attributes: {
                                                    ...block.contentObject.domtree.handler.getBlockExampleAttributes({recursively:true})
                                                }
                                            })
                                        }
                                    ) : null
                                ] : null, */
                                this.state.listView === 'previews' ? React.createElement(bd.app.components.AppOverviewPreviewCanvas,
                                    null,
                                    blockContent.domtree ? React.createElement(bd.app.components.AppCanvasElement,
                                        {
                                            domnode: blockContent.domtree
                                        }
                                    ) : null
                                ) : null,
                                /* wp.element.createElement(wp.blockEditor.BlockPreview,
                                    {
                                        blocks: ['Super Test']
                                    },
                                    
                                ), */
                                wp.element.createElement(wp.components.Button,
                                    {
                                        className: 'bd-overview--list-item-button',
                                        variant: this.state.listView === 'previews' ? 'secondary' : null,
                                        onClick: (event) => {
                                            event.preventDefault();
                                            this.props.setEditBlockId(block.id);
                                        }
                                    },
                                    React.createElement('span',
                                        {
                                            className: 'bd-overview--list-item-button-content'
                                        },
                                        blockContent.icon ? wp.element.createElement(wp.components.Dashicon,
                                            {
                                                icon: blockContent.icon
                                            }
                                        ) : React.createElement(Icon, {icon: '', style: {color:'#ccc'}}),
                                        React.createElement('span',
                                            {
                                                className: 'bd-overview--list-item--title'
                                            },
                                            block.title.rendered ? block.title.rendered : React.createElement('em', {style: {color:'#999'}}, 'untitled')
                                        ),
                                        React.createElement('span',
                                            {
                                                className: 'bd-overview--list-item--indicators'
                                            },
                                            this.props.unsavedBlocks.indexOf(block.id) > -1 ? React.createElement('span',
                                                {
                                                    title: 'unsaved changes'
                                                },
                                                React.createElement(bd.components.Icon,
                                                    {
                                                        icon: 'circle-medium',
                                                        color: '#f60'
                                                    }
                                                )
                                            ) : null,
                                            React.createElement('span',
                                                {
                                                    title: block.status === 'publish' ? 'enabled' : 'disabled'
                                                },
                                                React.createElement(bd.components.Icon,
                                                    {
                                                        icon: 'circle-medium',
                                                        color: block.status === 'publish' ? '#0f0' : '#ccc'
                                                    }
                                                )
                                            )
                                        )
                                    )
                                )
                            );
                        })
                    )
                ]
            ),
            this.state.listView === 'icons' ? React.createElement('div',
                {
                    className: 'bd-overview--panel'
                },
                this.state.hoverBlock ? [
                    wp.element.createElement(wp.components.PanelBody,
                        {
                            title: this.state.hoverBlock.title.rendered ? this.state.hoverBlock.title.rendered : React.createElement('em', {style: {color:'#999'}}, 'untitled'),
                            icon: this.state.hoverBlockContent.icon ? wp.element.createElement(wp.components.Dashicon,
                                {
                                    icon: this.state.hoverBlockContent.icon
                                }
                            ) : React.createElement(Icon, {icon: '', style: {color:'#ccc'}})
                        },
                        React.createElement(bd.app.components.AppOverviewPreviewCanvas,
                            null,
                            this.state.hoverBlockContent.domtree ? React.createElement(bd.app.components.AppCanvasElement,
                                {
                                    domnode: this.state.hoverBlockContent.domtree
                                }
                            ) : null
                        )
                    )
                ] : null
            ) : null
        );
    }
});
