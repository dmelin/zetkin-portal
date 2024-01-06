
bd.helper.registerAppComponent(class AppElementTreeItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: true
        };

        this.element = React.createRef();
        this.contentElement = React.createRef();
    }

    render() {
        const { domnode, dragInfo } = this.props;
        const [nodeName, attributes, ...children] = domnode;
        const { handler } = domnode;

        const hoveredNode = this.props.hoveredNode === domnode;
        const selectedNode = this.props.selectedNode === domnode;
        const draggedNode = this.props.draggedNode === domnode;

        const dragging = dragInfo && (Math.abs(dragInfo.pointer.x - dragInfo.pointerStart.x) > 3 || Math.abs(dragInfo.pointer.y - dragInfo.pointerStart.y) > 3);

        const result = [
            React.createElement('div',
                {
                    ref: this.contentElement,
                    className: 'bd-edit--tools--tree-row' + (this.state.open ? ' bd-edit--tools--tree-row-open' : '') + (selectedNode ? ' bd-edit--tools--tree-row-selected' : '') + (hoveredNode ? ' bd-edit--tools--tree-row-hovered' : ''),
                    'data-level': domnode.level,
                    style: {
                        '--level': domnode.level,
                        backgroundColor: selectedNode ? handler.color : ''
                    }
                },
                children.length > 0 ? React.createElement('button',
                    {
                        className: 'bd-edit--tools--tree-row-arrow',
                        style: this.state.open ? {transform:'rotate(90deg)'} : {},
                        onClick: (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.setState((oldState) => ({open: !oldState.open}));
                        }
                    },
                    React.createElement(bd.components.Icon,
                        {
                            icon: 'chevron-right'
                        }
                    )
                ) : React.createElement('span',
                    {
                        className: 'bd-edit--tools--tree-row-arrow-placeholder'
                    }
                ),
                React.createElement('a',
                    {
                        className: 'bd-edit--tools--tree-row-title',
                        style: handler.color ? {
                            color: handler.color
                        } : {},
                        onClick: (event) => {
                            event.bd_domnode = domnode;
                        },
                        onMouseDown: (event) => {
                            event.stopPropagation();
                            this.props.onDragNode({event, domnode, elementRect: this.element.current?.getBoundingClientRect()});
                        },
                        onMouseOver: (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.props.onHoverNode(domnode);
                        },
                        onMouseOut: (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.props.onUnhoverNode(domnode);
                        }
                    },
                    handler.icon ? React.createElement(bd.components.Icon,
                        {
                            icon: handler.icon
                        }
                    ) : null,
                    handler.name,
                    //nodeName,
                    this.props.root === false ? '' : React.createElement('em', {style:{opacity:.5,marginLeft:'1em'}}, ' ' + wp.i18n.__('root element', 'block-designer'))
                )
            ),
            this.state.open && children.length ? React.createElement('ul',
                {
                    className: 'bd-edit--tools--tree-childlist'
                },
                children.map((child) => {
                    return React.createElement(bd.app.components.AppElementTreeItem,
                        Object.assign({}, this.props, {
                            domnode: child,
                            root: false
                        })
                    )
                })
            ) : null
        ];

        if (this.props.root === false) {
            return [
                dragging && draggedNode ? React.createElement('li',
                    {
                        className: 'bd-edit--tools--tree-childlist-item--dragging-placeholder',
                        style: {
                            height: dragInfo.elementRect.height + 'px',
                            margin: 0,
                            marginLeft: 'calc(' + domnode.level + ' * var(--indent))',
                            padding: 0,
                            position: 'relative',
                            zIndex: 1
                        }
                    }
                ) : null,
                React.createElement('li',
                    {
                        ref: this.element,
                        className: 'bd-edit--tools--tree-childlist-item ' + 'test-level' + domnode.level + '-' + domnode[0],
                        style: {
                            ...(dragging && draggedNode ? {
                                position: 'fixed',
                                zIndex: 2,
                                //left: (dragInfo.pointer.x - (dragInfo.pointerStart.x - dragInfo.elementRect.left)) + 'px',
                                left: dragInfo.elementRect.left + 'px',
                                top: (dragInfo.pointer.y - (dragInfo.pointerStart.y - dragInfo.elementRect.top)) + 'px',
                                width: dragInfo.elementRect.width + 'px',
                                boxShadow: '.25rem .25rem .5rem rgba(0, 0, 0, .5)',
                                background: '#fff',
                                opacity: .8,
                                pointerEvents: 'none'
                            } : {})
                        }
                    },
                    dragging && !draggedNode ? [
                        React.createElement('div', {
                            style: {
                                position: 'absolute',
                                width: 'calc(100% - (' + domnode.level + ' * var(--indent)))',
                                height: '50%',
                                right: 0,
                                top: 0,
                                zIndex: 1
                            },
                            onMouseEnter: (event) => {
                                event.stopPropagation();
                                this.props.onMoveNode(this.props.draggedNode, domnode, 'before');
                            }
                        }),
                        React.createElement('div', {
                            style: {
                                position: 'absolute',
                                width: 'calc(100% - (' + domnode.level + ' * var(--indent)))',
                                height: '50%',
                                right: 0,
                                bottom: 0,
                                zIndex: 1
                            },
                            onMouseEnter: (event) => {
                                event.stopPropagation();
                                this.props.onMoveNode(this.props.draggedNode, domnode, 'after');
                            }
                        }),
                        handler.allowChildren ? React.createElement('div', {
                            style: {
                                position: 'absolute',
                                width: 'calc(100% - (' + (domnode.level + 1) + ' * var(--indent)))',
                                height: (this.state.open ? Math.round(this.contentElement.current?.offsetHeight * 3 / 4) : Math.round(this.contentElement.current?.offsetHeight / 2)) + 'px',
                                right: 0,
                                zIndex: 1,
                                top: Math.round(this.contentElement.current?.offsetHeight / 4) + 'px'
                            },
                            onMouseEnter: (event) => {
                                event.stopPropagation();
                                this.props.onMoveNode(this.props.draggedNode, domnode, 'inner');
                            }
                        }) : null
                    ] : null,
                    result
                )
            ];
        }
        
        return result;
    }
});
