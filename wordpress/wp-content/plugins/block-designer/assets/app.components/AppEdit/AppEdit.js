
bd.helper.registerAppComponent(class AppEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openElementPanel: null,
            openLibrary: false,
            selectedNodePath: null,
            draggedNode: null,
            dragInfo: null,
            hoveredNode: null,
            showThemeStyles: bd.helper.storageGet('showThemeStyles', true),
            layoutView: 'full', //bd.helper.storageGet('layoutView', 'content')
        };

        this.canvasIFrame = React.createRef();
        this.canvasScrollContainer = React.createRef();
        this.tabPanel = React.createRef();

        this.onDragNode = this.onDragNode.bind(this);
        this.onMoveNode = this.onMoveNode.bind(this);
        this.onHoverNode = this.onHoverNode.bind(this);
        this.onUnhoverNode = this.onUnhoverNode.bind(this);
        this.onSelectNode = this.onSelectNode.bind(this);
        this.onSetActivePanel = this.onSetActivePanel.bind(this);
        this.onUnselectNode = this.onUnselectNode.bind(this);
        this.onRemoveSelectedNode = this.onRemoveSelectedNode.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onCut = this.onCut.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onCopySelectedNode = this.onCopySelectedNode.bind(this);
        this.onCutSelectedNode = this.onCutSelectedNode.bind(this);
        this.onPasteIntoSelectedNode = this.onPasteIntoSelectedNode.bind(this);
    }

    getSelectedNode() {
        const domtree = this.props.edit.block?.contentObject?.domtree;
        const selectedNode = bd.helper.getDomNodeFromPath(domtree, this.state.selectedNodePath);
        return selectedNode;
    }

    getDomTree() {
        return this.props.edit.block?.contentObject?.domtree;
    }

    onSetActivePanel(tabName) {
        this.tabPanel?.current?.querySelector('.components-tab-panel__tabs .bd-edit--panel-tab-' + tabName)?.click();
    }

    onDragNode({event, domnode, elementRect}) {

        var mouseup = (event) => {
            window.removeEventListener('mouseup', mouseup);
            window.removeEventListener('mousemove', mousemove);

            this.setState({
                draggedNode: null,
                dragInfo: null
            });
        };

        var mousemove = (event) => {
            this.setState((oldState) => {
                oldState.dragInfo.pointer = {
                    x: event.clientX,
                    y: event.clientY
                };
                return oldState;
            });
        };

        window.addEventListener('mouseup', mouseup);
        window.addEventListener('mousemove', mousemove);

        this.setState({
            draggedNode: domnode,
            dragInfo: {
                elementRect: elementRect,
                pointerStart: {
                    x: event.clientX,
                    y: event.clientY
                },
                pointer: {
                    x: event.clientX,
                    y: event.clientY
                }
            }
        });
    }

    onHoverNode(node) {
        this.setState({hoveredNode: node});
    }

    onUnhoverNode(node) {
        if (node === undefined || this.state.hoveredNode === node) {
            this.setState({hoveredNode: null});
        }
    }

    onSelectNode(node) {
        const selectedNode = this.getSelectedNode();
        if (selectedNode !== node) {
            this.setState({
                ...(selectedNode === node?.parent && this.state.openElementPanel === 'layout' && bd.helper.getMergedStyleVariantsFromNode(selectedNode, { stopAtIncl: bd.helper.getCurrentCanvasDevice().widthName }).display === 'flex' ? {openElementPanel:'flexchild'} : {}),
                ...(selectedNode?.parent === node && this.state.openElementPanel === 'flexchild' && bd.helper.getMergedStyleVariantsFromNode(node, { stopAtIncl: bd.helper.getCurrentCanvasDevice().widthName }).display === 'flex' ? {openElementPanel:'layout'} : {}),
                selectedNodePath: bd.helper.getPathFromDomNode(node)
            });
        }
        this.onSetActivePanel('element');
    }

    onUnselectNode(node) {
        if (node === undefined || JSON.stringify(this.state.selectedNodePath) === JSON.stringify(bd.helper.getPathFromDomNode(node))) {
            this.setState({selectedNodePath: null});
            this.onSetActivePanel('block');
        }
    }

    onRemoveSelectedNode() {
        if (document.activeElement !== document.body && document.activeElement !== this.canvasIFrame.current) {
            return;
        }
        const selectedNode = this.getSelectedNode();
        const block = this.props.edit.block;
        if (selectedNode) {
            const styleIds = bd.helper.collectStylesFromNodeTree(block.contentObject.payload, selectedNode).map(style => style.id);

            if (selectedNode.parent) {
                selectedNode.parent.splice(selectedNode.parent.indexOf(selectedNode), 1);
            } else {
                delete block.contentObject.domtree;
            }
            const payload = block.contentObject.payload;
            let pos = payload.styles.length;
            while (pos--) {
                if (styleIds.indexOf(payload.styles[pos].id) > -1) {
                    payload.styles.splice(pos, 1);
                }
            }
            pos = block.CSSStyleSheet.cssRules.length;
            while (pos--) {
                let cssRule = block.CSSStyleSheet.cssRules[pos];
                if (styleIds.indexOf(cssRule.bd_classId) > -1) {
                    block.CSSStyleSheet.deleteRule(pos);
                }
            }
            this.props.edit.handleChange();
            this.setState({selectedNodePath: null});
        }
    }

    onCopySelectedNode(event) {
        if (document.activeElement !== document.body && document.activeElement !== this.canvasIFrame.current) {
            return;
        }
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            const obj = {
                type: '@blockdesigner/domnode-v' + this.props.edit.block.contentObject.version,
                domnode: selectedNode,
                payload: {
                    styles: bd.helper.collectStylesFromNodeTree(this.props.edit.block.contentObject.payload, selectedNode)
                }
            };
            event.preventDefault();
            event.stopPropagation();
            event.clipboardData && event.clipboardData.setData('text/plain', JSON.stringify(obj));
            event.clipboardData && event.clipboardData.setData('application/json', JSON.stringify(obj));
        }
    }

    onCutSelectedNode(event) {
        this.onCopySelectedNode(event);
        this.onRemoveSelectedNode();
    }

    onMoveNode(node, relatedNode, position) {
        let n = relatedNode;
        do {
            if (n === node) return;
        } while(n = n.parent);

        switch(position) {
            case 'before':
                if (relatedNode.parent.indexOf(node) === relatedNode.parent.indexOf(relatedNode) - 1) return;
                relatedNode.parent.splice(relatedNode.parent.indexOf(relatedNode), 0, node.parent.splice(node.parent.indexOf(node), 1)[0]);
                break;
            case 'after':
                if (relatedNode.parent.indexOf(node) === relatedNode.parent.indexOf(relatedNode) + 1) return;
                relatedNode.parent.splice(relatedNode.parent.indexOf(relatedNode) + 1, 0, node.parent.splice(node.parent.indexOf(node), 1)[0]);
                break;
            case 'inner':
                if (relatedNode.indexOf(node) === 2) return;
                if (relatedNode.handler.allowChildren) {
                    relatedNode.splice(2, 0, node.parent.splice(node.parent.indexOf(node), 1)[0]);
                }
                break;
        }
        bd.helper.initializeBlockDOMTree(relatedNode.root);
        this.props.edit.handleChange();
    }

    onPasteIntoSelectedNode({event,pasteContent}) {
        if (!pasteContent && event) {
            try {
                let text = (event.clipboardData || window.clipboardData).getData('text/plain');
                let json = (event.clipboardData || window.clipboardData).getData('application/json');
                let content = JSON.parse(json || text);
                if (typeof content === 'object' && content.type === '@blockdesigner/domnode-v' + this.props.edit.block.contentObject.version) {
                    pasteContent = content;
                    event.preventDefault();
                    event.stopPropagation();
                }
            } catch(x) {}
        }
        if (!pasteContent) {
            return;
        }
        pasteContent = JSON.parse(JSON.stringify(pasteContent));

        const selectedNode = this.getSelectedNode();
        const block = this.props.edit.block;
        const domtree = block.contentObject.domtree;
        const newDomNode = pasteContent.domnode;
        const styles = pasteContent.payload.styles;

        bd.helper.resetIdsOfNodeTree(pasteContent.payload, newDomNode);

        newDomNode.ownerBlock = block;
        block.contentObject.payload.styles.push(...styles);
        bd.helper.initializeBlockDOMTree(newDomNode);
        newDomNode.handler.resolveAttributeNameConflicts(domtree?.handler?.getBlockAttibuteDefinitions({recursively:true}) || {});
        if (newDomNode && (selectedNode || !domtree)) {
            if (selectedNode) {
                if (selectedNode.handler.allowChildren) {
                    selectedNode.push(newDomNode);
                } else if (selectedNode.parent) {
                    selectedNode.parent.splice(selectedNode.parent.indexOf(selectedNode) + 1, 0, newDomNode);
                }
            } else {
                if (newDomNode.handler.allowRoot) {
                    block.contentObject.domtree = newDomNode;
                } else {
                    alert(sprintf(wp.i18n.__('Sorry, the "%1$s" element can\'t be used as root element. Please insert an HTML element first and then paste your "%1$s" element into it.', 'block-designer'), newDomNode.handler.name));
                }
            }
            bd.helper.initializeBlockDOMTree(domtree);
            this.props.edit.handleChange();
            if (this.state.openLibrary !== false) {
                this.setState({openLibrary: false});
            }
            this.onSelectNode(newDomNode);
        }
    }

    onCopy(event) {
        this.onCopySelectedNode(event);
    }

    onCut(event) {
        this.onCutSelectedNode(event);
    }

    onPaste(event) {
        this.onPasteIntoSelectedNode({event});
    }

    onKeyUp(event) {
        if (document.activeElement !== document.body && document.activeElement !== this.canvasIFrame.current) {
            return;
        }
        switch (event.keyCode) {
            case 46: // Remove
                this.onRemoveSelectedNode();
                event.preventDefault();
                break;
        }
    }

    componentDidMount() {
        window.addEventListener('copy', this.onCopy);
        window.addEventListener('cut', this.onCut);
        window.addEventListener('paste', this.onPaste);
        window.addEventListener('keyup', this.onKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('copy', this.onCopy);
        window.removeEventListener('cut', this.onCut);
        window.removeEventListener('paste', this.onPaste);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    render() {

        const domtree = this.props.edit.block?.contentObject?.domtree;
        const selectedNode = this.getSelectedNode();
        const showThemeStyles = bd.helper.storageGet('showThemeStyles', true);

        const { device: canvasDevice, width: canvasDeviceWidth, widthName: canvasDeviceWidthName } = bd.helper.getCurrentCanvasDevice();

        const canvasScrollContainerWidth = this.canvasScrollContainer.current?.clientWidth;
        const canvasScrollContainerScrollbarWidth = this.canvasScrollContainer.current?.offsetWidth - canvasScrollContainerWidth;
        const canvasZoomLevel = canvasScrollContainerWidth && canvasScrollContainerWidth < canvasDeviceWidth ? canvasScrollContainerWidth / canvasDeviceWidth : 1;

        const {
            AppElementTreeItem,
            AppCanvas,
            AppCanvasElement,
            AppIconControl,
            AppBaseControl,
            AppControlUnits,
            AppControlUnit,
            AppControlColor,
            AppControlGradient
        } = bd.app.components;

        const {
            Icon
        } = bd.components;




        return React.createElement('fieldset',
            {
                className: 'bd-edit',
                disabled: this.props.edit.block.contentObject === null,
            },
            React.createElement('div',
                {
                    className: 'bd-edit--tools'
                },
                React.createElement('div',
                    {
                        className:'bd-edit--tools-header'
                    },
                    this.state.openLibrary ? '' : React.createElement(Icon, {icon: 'file-tree'}),
                    React.createElement('h2', null, this.state.openLibrary ? wp.i18n.__('Element Library', 'block-designer') : wp.i18n.__('Element Tree', 'block-designer')),
                    wp.element.createElement(wp.components.Button,
                        {
                            variant: 'primary',
                            title: wp.i18n.__('Element Library', 'block-designer'),
                            style: {
                                backgroundColor: this.state.openLibrary ? '#000' : ''
                            },
                            icon: React.createElement(Icon, {icon:this.state.openLibrary ? 'close' : 'plus'}),
                            onClick: () => {
                                this.setState((oldState) => ({openLibrary:!oldState.openLibrary}));
                                setTimeout(this.props.appForceRepaint, 0);
                            }
                        }
                    )
                ),
                this.state.openLibrary ? React.createElement('div',
                    {
                        className: 'bd-edit--tools--library'
                    },
                    /* domtree && !selectedNode ? React.createElement(bd.components.Notice,
                        null,
                        'Please select an existing element into which you want to insert the new element.'
                    ) :  */(() => {
                        const result = [];

                        const categories = [
                            {
                                name: wp.i18n.__('Static Elements', 'block-designer'),
                                match: (component) => !component.authorInput
                            },
                            {
                                name: wp.i18n.__('Author Input Elements', 'block-designer'),
                                match: (component) => !!component.authorInput
                            }
                        ];

                        for (let pos = 0; pos < categories.length; pos++) {
                            let category = categories[pos];

                            result.push(React.createElement('h3',
                                {
                                    className:'bd-edit--tools--library-category'
                                },
                                category.name
                            ));

                            
                            let items = [];

                            for (let canvasElementClassName in bd.canvasElements) {
                                let canvasElement = new bd.canvasElements[canvasElementClassName];
                                if (category.match(canvasElement)) {
                                    let disabled = false;
                                    let message = null;

                                    if (!domtree && !canvasElement.allowRoot) {
                                        disabled = true;
                                        message = sprintf(wp.i18n.__('"%s" can not be used as root element.', 'block-designer'), canvasElement.name);
                                    }
                                    else if (domtree && !selectedNode) {
                                        disabled = true;
                                        message = wp.i18n.__('Please select an existing element into which you want to insert the new element.', 'block-designer');
                                    }
                                    else if (canvasElement.allowMultiple === false && domtree?.list?.filter((item) => item[0] === canvasElement.initialContent[0]).length > 0) {
                                        disabled = true;
                                        message = sprintf(wp.i18n.__('"%s" can only be used once in a block.\nThis is a technical limitation of WordPress.', 'block-designer'), canvasElement.name);
                                    }

                                    //let enabled = !domtree && canvasElement.allowRoot || domtree && selectedNode && selectedNode.handler.allowChildren;
                                    //enabled = !domtree && canvasElement.allowRoot || domtree && selectedNode/*  && selectedNode.handler.allowChildren */;
                                    //let disabled = !enabled;

                                    items.push(React.createElement('button',
                                            {
                                                className: 'bd-edit--tools--library-item' + (disabled ? ' bd-edit--tools--library-item-disabled' : '') + ' bd-edit--tools--library-item--' + canvasElementClassName,
                                                disabled: disabled,
                                                style: { '--color': canvasElement.color },
                                                title: message || canvasElement.description,
                                                onClick: (event) => {
                                                    event.preventDefault();
                                                    if (!disabled) {
                                                        this.onPasteIntoSelectedNode({pasteContent:{domnode: canvasElement.initialContent, payload: {styles: []}}});
                                                    }
                                                }
                                            },
                                            React.createElement(Icon, {icon: canvasElement.icon}),
                                            canvasElement.name
                                        )
                                    );
                                }
                            }

                            result.push(React.createElement('div',
                                {
                                    className:'bd-edit--tools--library-items'
                                },
                                items
                            ));
                        }

                        return result;
                    })(),
                ) : React.createElement('div',
                    {
                        className: 'bd-edit--tools--tree',
                        style: {
                            userSelect: this.state.draggedNode ? 'none' : ''
                        },
                        onClick: (event) => {
                            if (event.bd_domnode) {
                                this.onSelectNode(event.bd_domnode);
                            } else {
                                this.onUnselectNode();
                            }
                        }
                    },
                    domtree ? [
                        React.createElement('div',
                            {
                                style: {
                                    paddingBottom: '2rem'
                                }
                            },
                            React.createElement(AppElementTreeItem,
                                {
                                    domnode: domtree,
                                    onDragNode: this.onDragNode,
                                    draggedNode: this.state.draggedNode,
                                    dragInfo: this.state.dragInfo,
                                    onMoveNode: this.onMoveNode,
                                    selectedNode: selectedNode,
                                    hoveredNode: this.state.hoveredNode,
                                    onHoverNode: this.onHoverNode,
                                    onUnhoverNode: this.onUnhoverNode,
                                    onSelectNode: this.onSelectNode,
                                    onUnselectNode: this.onUnselectNode
                                }
                            )
                        )
                    ] : null
                ),
                React.createElement('div',
                    {
                        style: {
                            padding: '1rem',
                            borderTop: '#ddd solid 1px'
                        }
                    },
                    wp.element.createElement(wp.components.Tip,
                        {},
                        (() => {
                            const mac = bd.helper.operatingSystem() === 'MacOS';
                            const cmd = mac ? '⌘' : wp.i18n.__('Ctrl', 'block-designer');
                            const style = mac ? {fontSize:'15px'} : {};
                            return [
                                wp.element.createElement(bd.components.Html,
                                    null,
                                    sprintf(
                                        bd.helper.escapeHtml(wp.i18n.__('To reorganize elements use shortcuts:\n%1$s copy\n%2$s cut\n%3$s paste\n%4$s delete', 'block-designer')).replace(/\n/g, '<br />'),
                                        wp.element.renderToString([React.createElement('kbd', {style}, cmd), '+', React.createElement('kbd', null, 'C')]),
                                        wp.element.renderToString([React.createElement('kbd', {style}, cmd), '+', React.createElement('kbd', null, 'X')]),
                                        wp.element.renderToString([React.createElement('kbd', {style}, cmd), '+', React.createElement('kbd', null, 'V')]),
                                        wp.element.renderToString([React.createElement('kbd', null, wp.i18n.__('Del', 'block-designer'))])
                                    )
                                )
                            ]
                        })()
                    ),
                )
            ),
            React.createElement('div',
                {
                    className: 'bd-edit--canvas--outer'
                },
                React.createElement('div',
                    {
                        className: 'bd-edit--canvas--header'
                    },
                    React.createElement('div',
                        {
                            className: 'bd-edit--canvas--header--left'
                        }
                    ),
                    React.createElement('div',
                        {
                            className: 'bd-edit--canvas--header--center'
                        },
                        wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                            {
                                onChange: (device) => {
                                    bd.helper.storageSet('canvasDevice', device);
                                    this.setState({});
                                    setTimeout(() => {
                                        this.setState({});
                                        //this.props.appForceRepaint();
                                    }, 200);
                                },
                                checked: canvasDevice
                            },
                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                {
                                    value: 'desktop',
                                    title: wp.i18n.__('Desktop\n⭐ Base breakpoint\n\nDesktop styles apply at all widths,\nunless they are edited at a smaller\nwidth.\n\nStart your styling here.', 'block-designer')
                                },
                                React.createElement(bd.components.Icon, {icon:'monitor-star'})
                            ),
                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                {
                                    value: 'tablet',
                                    title: wp.i18n.__('Tablet\n991px and down\n\nStyles added here will apply at\n991px and down, unless they\nare edited at a smaller width.', 'block-designer')
                                },
                                React.createElement(bd.components.Icon, {icon:'tablet', style: {transform: 'rotate(90deg)'}})
                            ),
                            /* wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                {
                                    value: 'mobile-landscape',
                                    title: wp.i18n.__('Mobile Landscape\n767px and down\n\nStyles added here will apply at\n767px and down, unless they\nare edited at a smaller width.', 'block-designer')
                                },
                                React.createElement(bd.components.Icon, {icon:'cellphone', style: {transform: 'rotate(90deg) scaleX(.9)'}})
                            ), */
                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                {
                                    value: 'mobile',
                                    title: wp.i18n.__('Mobile\n478px and down\n\nStyles added here will apply at\n478px and down.', 'block-designer')
                                },
                                React.createElement(bd.components.Icon, {icon:'cellphone'})
                            )
                        ),
                        React.createElement('div',
                            {
                                style: {
                                    textTransform: 'uppercase',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    lineHeight: '1.4',
                                    letterSpacing: '.04em',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-around',
                                }
                            },
                            React.createElement('div', null, /* 'Canvas Width: ' +  */canvasDeviceWidth + ' PX'),
                            React.createElement('div', null, /* 'Zoom Level: ' +  */(Math.round(canvasZoomLevel * 10000) / 100) + ' %'),
                        )
                    ),
                    React.createElement('div',
                        {
                            className: 'bd-edit--canvas--header--right'
                        },
                        wp.element.createElement(wp.components.Dropdown,
                            {
                                className: 'my-container-class-name',
                                contentClassName: 'bd-edit--canvas--header--canvasSettings',
                                position: 'bottom left',
                                renderToggle: ( { isOpen, onToggle } ) => (
                                    wp.element.createElement(wp.components.Button,
                                        {
                                            variant: 'tertiary',
                                            onClick: onToggle,
                                            ariaExpanded: isOpen,
                                            title: wp.i18n.__('Canvas Settings', 'block-designer'),
                                            icon: React.createElement(bd.components.Icon, {icon: 'dashicons-admin-generic'})
                                        }
                                    )
                                ),
                                renderContent: () => {
                                    return React.createElement('div',
                                        {
                                            style: {
                                                minWidth: '100px'
                                            }
                                        },
                                        React.createElement('h4', {style:{marginTop:0}}, wp.i18n.__('Canvas Settings', 'block-designer')),
                                        wp.element.createElement(wp.components.ToggleControl,
                                            {
                                                label: wp.i18n.__('Apply Theme Styles', 'block-designer'),
                                                checked: !!showThemeStyles,
                                                onChange: (showThemeStyles) => {
                                                    bd.helper.storageSet('showThemeStyles', !!showThemeStyles);
                                                    this.setState({showThemeStyles});
                                                }
                                            }
                                        )/* ,
                                        React.createElement('div',
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '12px',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }
                                            },
                                            React.createElement('div', showThemeStyles ? null : {style:{opacity:.5}}, 'Apply Width'),
                                            wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                {
                                                    onChange: (layoutView) => {
                                                        bd.helper.storageSet('layoutView', layoutView);
                                                        this.setState({layoutView});
                                                    },
                                                    checked: this.state.layoutView || '',
                                                    disabled: !showThemeStyles
                                                },
                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                    {
                                                        ...(showThemeStyles ? {} : {variant: 'secondary'}),
                                                        value: 'content',
                                                        title: 'Content width',
                                                        isSmall: true,
                                                        style: {padding: 0}
                                                    },
                                                    React.createElement(bd.components.Icon, {icon:'wp-aligncontent'})
                                                ),
                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                    {
                                                        ...(showThemeStyles ? {} : {variant: 'secondary'}),
                                                        value: 'wide',
                                                        title: 'Wide width',
                                                        isSmall: true,
                                                        style: {padding: 0}
                                                    },
                                                    React.createElement(bd.components.Icon, {icon:'wp-alignwide'})
                                                ),
                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                    {
                                                        ...(showThemeStyles ? {} : {variant: 'secondary'}),
                                                        value: 'full',
                                                        title: 'Full width',
                                                        isSmall: true,
                                                        style: {padding: 0}
                                                    },
                                                    React.createElement(bd.components.Icon, {icon:'wp-alignfull'})
                                                )
                                            )
                                        ) */
                                    );
                                }
                            }
                        )
                    )
                ),
                React.createElement(AppCanvas,
                    {
                        canvasIFrame: this.canvasIFrame,
                        className: 'bd-edit--canvas',
                        selectedNode: selectedNode,
                        hoveredNode: this.state.hoveredNode,
                        showThemeStyles: this.state.showThemeStyles,
                        layoutView: this.state.layoutView,
                        block: this.props.edit.block,
                        canvasDeviceWidth: canvasDeviceWidth,
                        canvasZoomLevel: canvasZoomLevel,
                        canvasScrollContainer: this.canvasScrollContainer,
                        canvasScrollContainerScrollbarWidth: canvasScrollContainerScrollbarWidth,
                        onClick: (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.onUnselectNode();
                        },
                        onCopy: this.onCopy,
                        onCut: this.onCut,
                        onPaste: this.onPaste,
                        onKeyUp: this.onKeyUp
                    },
                    domtree ? [
                        React.createElement(AppCanvasElement,
                            {
                                domnode: domtree,
                                edit: true,
                                selectedNode: selectedNode,
                                canvasDeviceWidthName: canvasDeviceWidthName,
                                showThemeStyles: this.state.showThemeStyles,
                                hoveredNode: this.state.hoveredNode,
                                onHoverNode: this.onHoverNode,
                                onUnhoverNode: this.onUnhoverNode,
                                onSelectNode: this.onSelectNode,
                                onUnselectNode: this.onUnselectNode
                            }
                        )
                    ] : null
                )
            ),
            React.createElement('div',
                {
                    ref: this.tabPanel,
                    className: 'bd-edit--panel'
                },
                wp.element.createElement(wp.components.TabPanel,
                    {
                        tabs: [
                            {
                                name: 'block',
                                title: wp.i18n.__('Block', 'block-designer'),
                                className: 'bd-edit--panel-tab-block',
                                content: wp.element.createElement(wp.components.Panel,
                                    {
                                        className: 'bd-edit--panel-tab-block-content',
                                        //header: 'Block: ' + (this.props.edit.block.id || 'new')
                                    },
                                    wp.element.createElement(wp.components.PanelBody,
                                        {
                                            className: 'bd-edit--panel-tab-block-content--general'
                                            // title: 'title'
                                        },
                                        wp.element.createElement(AppIconControl,
                                            {
                                                label: wp.i18n.__('Icon', 'block-designer'),
                                                value: this.props.edit.block?.contentObject?.icon || '',
                                                onChange: (newValue) => {
                                                    this.props.edit.block.contentObject.icon = newValue;
                                                    this.props.edit.handleChange();
                                                }
                                            }
                                        ),
                                        wp.element.createElement(wp.components.TextControl,
                                            {
                                                className: 'bd-edit--panel--block-title-input',
                                                label: wp.i18n.__('Title', 'block-designer'),
                                                value: this.props.edit.block.title,
                                                onChange: (title) => {
                                                    this.props.edit.handleChange({title})
                                                },
                                                onBlur: () => {
                                                    // triggers rerendering (needed for the AppProductTour)
                                                    this.props.edit.handleChange({});
                                                }
                                            }
                                        ),
                                        this.props.edit.block.status === 'publish' && this.props.edit.block.title === '' ? React.createElement(bd.components.Notice,
                                            {
                                                status: 'warning',
                                                style: {
                                                    margin: '0 0 1rem'
                                                }
                                            },
                                            wp.i18n.__('The block must have a title to appear in the block editor', 'block-designer')
                                        ) : null,
                                        wp.element.createElement(wp.components.TextControl,
                                            {
                                                label: wp.i18n.__('Description', 'block-designer'),
                                                value: this.props.edit.block?.contentObject?.description,
                                                onChange: (newValue) => {
                                                    this.props.edit.block.contentObject.description = newValue;
                                                    this.props.edit.handleChange();
                                                }
                                            }
                                        ),
                                        wp.element.createElement(wp.components.SelectControl,
                                            {
                                                label: wp.i18n.__('Category', 'block-designer'),
                                                value: this.props.edit.block?.contentObject?.category || null,
                                                options: [{ value: null, label: '' }].concat(BDData.blockCategories.map((category) => ({ value: category.slug, label: category.title }))),
                                                onChange: (newValue) => {
                                                    this.props.edit.block.contentObject.category = newValue;
                                                    this.props.edit.handleChange();
                                                }
                                            }
                                        )
                                    ),
                                    wp.element.createElement(wp.components.PanelBody,
                                        {
                                            title: [
                                                wp.i18n.__('Status', 'block-designer'),
                                                /* React.createElement(bd.components.Icon,
                                                    {
                                                        icon: 'circle-medium',
                                                        color: this.props.edit.storedBlock?.status === 'publish' ? '#0f0' : '#ccc'
                                                    }
                                                ) */
                                            ]
                                        },
                                        /* React.createElement('p', null,
                                            React.createElement('span',
                                                {
                                                    style: {
                                                        vertialAlign: 'middle'
                                                    }
                                                },
                                                'Block is ' + (this.props.edit.storedBlock?.status === 'publish' ? 'enabled' : 'disabled')
                                            ),
                                            React.createElement(bd.components.Icon,
                                                {
                                                    icon: 'circle-medium',
                                                    color: this.props.edit.storedBlock?.status === 'publish' ? '#0f0' : '#ccc'
                                                }
                                            ),
                                        ), */
                                        wp.element.createElement(wp.components.ToggleControl,
                                            {
                                                className: 'bd-edit--panel--block-enable',
                                                label: wp.i18n.__('enable', 'block-designer'),
                                                //help: 'Enable the block here to use it on your site.',
                                                checked: this.props.edit.block.status === 'publish',
                                                onChange: (newValue) => {
                                                    this.props.edit.handleChange({status: newValue ? 'publish' : 'draft'})
                                                }
                                            }
                                        ),
                                        this.props.edit.block.status !== 'publish' ? React.createElement(bd.components.Notice,
                                            null,
                                            wp.i18n.__('Enable the block here to use it on your site.', 'block-designer')
                                        ) : null,
                                        /* this.props.edit.block.status === 'publish' && this.props.edit.storedBlock.status !== 'publish' ? React.createElement(bd.components.Notice,
                                            null,
                                            'Save the block now to use it on your site.'
                                        ) : null, */
                                        /* this.props.edit.block.id > 0 ? wp.element.createElement(wp.components.Button,
                                            {
                                                onClick: () => {
                                                    const result = confirm('Are you sure you want to permanently delete this entire block? This cannot be undone.');
                                                    console.log(result);
                                                },
                                                style: {
                                                    color: '#b32d2e'
                                                }
                                            },
                                            'Delete block'
                                        ) : null */
                                    ),
                                    this.props.edit.block.id > 0 ? wp.element.createElement(wp.components.PanelBody,
                                        {
                                            title: wp.i18n.__('Danger Zone', 'block-designer'),
                                            initialOpen: false,
                                        },
                                        wp.element.createElement(wp.components.Button,
                                            {
                                                onClick: () => {
                                                    let result = null;
                                                    const remove = () => {
                                                        const deleteWord = wp.i18n.__('DELETE', 'block-designer');
                                                        let text = this.props.edit.block.title
                                                            ? sprintf(wp.i18n.__('If you are sure you want to delete the block "%1$s", enter "%2$s" here:', 'block-designer'), this.props.edit.block.title, deleteWord)
                                                            : sprintf(wp.i18n.__('If you are sure you want to delete this block, enter "%1$s" here:', 'block-designer'), deleteWord);
                                                        if (result !== null) {
                                                            text = '\n' + sprintf(wp.i18n.__('You wrote "%1$s" instead of "%2$s"', 'block-designer'), result, deleteWord) + '\n\n' + text;
                                                        }
                                                        result = prompt(text);

                                                        if (result === null) {
                                                            return;
                                                        }
                                                        if (result === deleteWord) {
                                                            this.props.edit.handleDelete(this.props.edit.block.id);
                                                            return;
                                                        }
                                                        remove();
                                                    }
                                                    remove();
                                                },
                                                variant: 'secondary',
                                                className: 'bd-components-button-red'
                                            },
                                            wp.i18n.__('Delete block', 'block-designer')
                                        ),
                                        React.createElement('div',
                                            {
                                                style: {
                                                    color: '#b32d2e'
                                                }
                                            },
                                            React.createElement('h2', {
                                                style: {
                                                    color: '#b32d2e'
                                                }
                                            }, wp.i18n.__('ATTENTION:', 'block-designer')),
                                            React.createElement('p', null, React.createElement('strong', null, wp.i18n.__('If you delete a block that is in use on your site, it will no longer work afterwards.', 'block-designer'))),
                                            React.createElement('p', null, wp.i18n.__('Any usage will disappear from the frontend and will show a message in the WordPress Block Editor that the block is not supported.', 'block-designer')),
                                            React.createElement('p', null, React.createElement('strong', {style:{fontSize:'1rem'}}, wp.i18n.__('This cannot be undone! The deletion is permanent!', 'block-designer')))
                                        )
                                    ) : null,
                                    // Fields to change the block namespace and name
                                    /* wp.element.createElement(wp.components.PanelBody,
                                        {
                                            title: 'Advanced',
                                            initialOpen: false,
                                        },
                                        React.createElement('div',
                                            {
                                                style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '10px'
                                                }
                                            },
                                            wp.element.createElement(wp.components.TextControl,
                                                {
                                                    label: 'Namespace',
                                                    //help: '',
                                                    value: this.props.edit.block?.contentObject?.namespace || '',
                                                    placeholder: 'bd',
                                                    onChange: (newValue) => {
                                                        newValue = newValue.toLowerCase().replace(/^[^a-z]+/, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
                                                        this.props.edit.block.contentObject.namespace = newValue;
                                                        this.props.edit.handleChange();
                                                    }
                                                }
                                            ),
                                            wp.element.createElement(wp.components.TextControl,
                                                {
                                                    label: 'Name',
                                                    //help: '',
                                                    value: this.props.edit.block?.contentObject?.name || '',
                                                    placeholder: this.props.edit.block?.id ? 'block-' + this.props.edit.block?.id : 'block-{ID}',
                                                    onChange: (newValue) => {
                                                        newValue = newValue.toLowerCase().replace(/^[^a-z]+/, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
                                                        this.props.edit.block.contentObject.name = newValue;
                                                        this.props.edit.handleChange();
                                                    }
                                                }
                                            )
                                        )
                                    ) */
                                )
                            },
                            {
                                name: 'element',
                                title: wp.i18n.__('Element', 'block-designer'),
                                className: 'bd-edit--panel-tab-element',
                                content: !selectedNode ? React.createElement('div',
                                    {
                                        className: 'bd-edit--panel-tab-element--empty'
                                    },
                                    React.createElement(Icon, {icon:'code-tags'}),
                                    wp.i18n.__('no element selected', 'block-designer')
                                ) : (() => {
                                    return wp.element.createElement(wp.components.Panel,
                                    {
                                        className: 'bd-edit--panel-tab-element-content block-editor-block-inspector',
                                        style: {
                                            overflow: 'auto'
                                        }
                                    },
                                    React.createElement(bd.app.components.AppElementCard,
                                        {
                                            node: selectedNode
                                        }
                                    ),
                                    selectedNode.handler.renderDesignerElementPanel({props:this.props}),
                                    selectedNode.handler.supportsHTMLTagName || selectedNode.handler.supportsHTMLAttributes ? wp.element.createElement(wp.components.PanelBody,
                                        null,
                                        selectedNode.handler.supportsHTMLTagName ? wp.element.createElement(wp.components.SelectControl,
                                            {
                                                label: wp.i18n._x('Tag', 'HTML tag', 'block-designer'),
                                                value: selectedNode[0],
                                                options: [
                                                    //selectedNode[0],
                                                    'a',
                                                    'abbr',
                                                    'address',
                                                    'area',
                                                    'article',
                                                    'aside',
                                                    'audio',
                                                    'bdi',
                                                    'bdo',
                                                    'blockquote',
                                                    'br',
                                                    'button',
                                                    'caption',
                                                    'cite',
                                                    'code',
                                                    'col',
                                                    'colgroup',
                                                    'data',
                                                    'datalist',
                                                    'dd',
                                                    'del',
                                                    'details',
                                                    'dfn',
                                                    'dialog',
                                                    'div',
                                                    'dl',
                                                    'dt',
                                                    'em',
                                                    'fieldset',
                                                    'figcaption',
                                                    'figure',
                                                    'footer',
                                                    'form',
                                                    'header',
                                                    'h1',
                                                    'h2',
                                                    'h3',
                                                    'h4',
                                                    'h5',
                                                    'h6',
                                                    'hr',
                                                    'img',
                                                    'input',
                                                    'ins',
                                                    'kbd',
                                                    'label',
                                                    'legend',
                                                    'li',
                                                    'main',
                                                    'map',
                                                    'mark',
                                                    'meter',
                                                    'nav',
                                                    'ol',
                                                    'optgroup',
                                                    'option',
                                                    'p',
                                                    'picture',
                                                    'pre',
                                                    'q',
                                                    'rp',
                                                    'rt',
                                                    'ruby',
                                                    's',
                                                    'samp',
                                                    'script',
                                                    'section',
                                                    'small',
                                                    'source',
                                                    'span',
                                                    'strong',
                                                    'sub',
                                                    'summary',
                                                    'sup',
                                                    'table',
                                                    'tbody',
                                                    'td',
                                                    'template',
                                                    'textarea',
                                                    'tfoot',
                                                    'th',
                                                    'thead',
                                                    'time',
                                                    'tr',
                                                    'track',
                                                    'ul',
                                                    'var',
                                                    'video',
                                                ].map((type) => ({ value: type, label: type.toUpperCase() })),
                                                onChange: (newValue) => {
                                                    selectedNode[0] = newValue.toLowerCase();
                                                    this.props.edit.handleChange();
                                                    //this.setState({selectedNode: selectedNode});
                                                },
                                                help: [
                                                    //'See definitions on ', React.createElement('a', {href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element', target: '_blank'}, 'MDN Web Docs'), '.',
                                                    React.createElement(bd.components.Html, null, wp.i18n.__('See definitions on <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element">MDN Web Docs</a>.', 'block-designer').replace(/\<a /, '<a target="_blank" '))
                                                ]
                                            }
                                        ) : null,
                                        selectedNode.handler.supportsHTMLAttributes ? wp.element.createElement(AppBaseControl,
                                            {
                                                label: wp.i18n.__('Attributes', 'block-designer'),
                                                ...(selectedNode?.[1]?.className !== undefined ? {} : {help: wp.i18n.__('To set custom CSS classes, add "class" attribute', 'block-designer')}),
                                                toolPanel: React.createElement('button',
                                                    {
                                                        style: {
                                                            cursor: 'pointer',
                                                            border: 0,
                                                            background: 'transparent'
                                                        },
                                                        title: wp.i18n.__('add attribute', 'block-designer'),
                                                        onClick: () => {
                                                            let name = null;
                                                            let jsName = null;
                                                            let errorText = '';
                                                            const add = () => {
                                                                let text = wp.i18n.__('Enter the name of the attribute you want to add:', 'block-designer');
                                                                if (name !== null) {
                                                                    text = '\n' + errorText + '\n\n' + text;
                                                                }
                                                                errorText = '';
                                                                name = prompt(text);

                                                                if (name === null) {
                                                                    return null;
                                                                }

                                                                name = name.toLowerCase() === 'classname' ? 'class' : name.toLowerCase();
                                                                jsName = name.toLowerCase() === 'class' ? 'className' : name.toLowerCase();

                                                                if (!jsName.match(/^[a-z][a-z0-9\-]*$/i)) {
                                                                    errorText = wp.i18n.__('The attribute name must start with a letter (a-z) and may only contain the following characters: a-z, 0-9, "-".', 'block-designer');
                                                                }
                                                                else if (jsName === 'style') {
                                                                    errorText = sprintf(wp.i18n.__('The "%s" attribute can not be added or changed manually.', 'block-designer'), 'style')
                                                                }
                                                                else if (['bd', 'classes'].indexOf(jsName) > -1) {
                                                                    errorText = sprintf(wp.i18n.__('The attribute name "%s" is reserved and can not be added.', 'block-designer'), name)
                                                                }
                                                                else if (typeof selectedNode[1][jsName] !== 'undefined') {
                                                                    errorText = sprintf(wp.i18n.__('The attribute "%s" already exists.', 'block-designer'), name)
                                                                }

                                                                if (errorText) {
                                                                    jsName = add();
                                                                }

                                                                return jsName;
                                                            }
                                                            jsName = add();

                                                            if (jsName !== null) {
                                                                selectedNode[1][jsName] = '';
                                                                this.props.edit.handleChange();
                                                                //this.props.appForceRepaint();
                                                            }
                                                        }
                                                    },
                                                    React.createElement(bd.components.Icon, {icon: 'plus'})
                                                )
                                            },
                                            (() => {
                                                const attributeNames = Object.keys(selectedNode[1] || {}).filter((name) => {
                                                    return ['bd', 'style', 'classes'].indexOf(name) === -1
                                                });
                                                
                                                if (attributeNames.length === 0) {
                                                    return null;
                                                }

                                                return React.createElement('ul',
                                                    null,
                                                    attributeNames.map((name) => {
                                                        const jsName = name;
                                                        name = name === 'className' ? 'class' : name;

                                                        return React.createElement('li',
                                                            {
                                                                style: {
                                                                    display: 'flex'
                                                                }
                                                            },
                                                            React.createElement('strong',
                                                                {
                                                                    style: {
                                                                        whiteSpace: 'nowrap',
                                                                        padding: '3px',
                                                                        flexBasis: '5em',
                                                                        flexGrow: 0,
                                                                        flexShrink: 0,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    },
                                                                    title: name
                                                                },
                                                                name
                                                            ),
                                                            ' ',
                                                            React.createElement('input',
                                                                {
                                                                    style: {
                                                                        flexGrow: 1,
                                                                        padding: '3px',
                                                                        border: 0,
                                                                        background: '#eee'
                                                                    },
                                                                    value: selectedNode[1][jsName],
                                                                    onChange: (newValue) => {
                                                                        selectedNode[1][jsName] = newValue.target.value;
                                                                        this.props.edit.handleChange();
                                                                    }
                                                                }
                                                            ),
                                                            React.createElement('button',
                                                                {
                                                                    style: {
                                                                        cursor: 'pointer',
                                                                        border: 0,
                                                                        background: 'transparent'
                                                                    },
                                                                    title: sprintf(wp.i18n.__('delete attribute "%s"', 'block-designer'), name),
                                                                    onClick: () => {
                                                                        delete selectedNode[1][jsName];
                                                                        this.props.edit.handleChange();
                                                                        //this.props.appForceRepaint();
                                                                    }
                                                                },
                                                                React.createElement(bd.components.Icon, {icon: 'close', title: 'delete'})
                                                            )
                                                        );
                                                    })
                                                );
                                            })()
                                        ) : null
                                    ) : null,
                                    selectedNode.handler.rendersOnlyText ? wp.element.createElement(wp.components.PanelBody,
                                        null,
                                        wp.element.createElement(bd.components.Notice,
                                            {
                                                //isDismissible: true
                                            },
                                            wp.i18n.__('Text elements cannot be styled directly. Typography styles are automatically inherited from parent elements.', 'block-designer')
                                        )
                                    ) : null,
                                    selectedNode.handler.supportsCSSStyle ? (() => {

                                        if (selectedNode === selectedNode.root && canvasDeviceWidthName !== 'main') {
                                            return wp.element.createElement(wp.components.PanelBody,
                                                null,
                                                React.createElement(bd.components.Notice,
                                                    null,
                                                    wp.i18n.__('The root element can not have device specific styles.', 'block-designer'),
                                                    React.createElement('br'),
                                                    React.createElement('br'),
                                                    React.createElement('small', null, wp.i18n.__('Add your device specific styles to an inner element or switch to "Desktop" mode and add general styles for all devices (smaller devices always inherit styles from bigger devices)', 'block-designer'))
                                                )
                                            );
                                        }

                                        if (canvasDeviceWidthName !== 'main' && !selectedNode.payloadStyle.variants?.[canvasDeviceWidthName]) {
                                            lodash.set(selectedNode.payloadStyle, 'variants.' + canvasDeviceWidthName, {style: ''});
                                        }
    
                                        const selectedNodeCSSStyleRule = selectedNode.CSSStyleRules[canvasDeviceWidthName];
                                        const selectedNodePayloadStyle = canvasDeviceWidthName === 'main' ? selectedNode.payloadStyle : selectedNode.payloadStyle.variants[canvasDeviceWidthName];
                                        const parentStyle = selectedNode.parent ? bd.helper.getMergedStyleVariantsFromNode(selectedNode.parent, { stopAtIncl: canvasDeviceWidthName}) : null;

                                        return [
                                            parentStyle?.display === 'flex' ? React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Flex Child', 'block-designer'),
                                                    icon: React.createElement(Icon, {icon: 'checkbox-blank-outline'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['flex', 'alignSelf']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'flexchild',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'flexchild' : null});
                                                    }
                                                },
                                                wp.element.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Shrink & Grow', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.flex,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.flex = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    React.createElement('div',
                                                        {
                                                            style: {
                                                                display: 'block'
                                                            }
                                                        },
                                                        wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                            {
                                                                onChange: (newValue) => {
                                                                    selectedNodeCSSStyleRule.style.flex = newValue;
                                                                    selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                    //this.setState({selectedNode: selectedNode});
                                                                    this.props.edit.handleChange();
                                                                },
                                                                checked: selectedNodeCSSStyleRule.style.flex || null
                                                            },
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: '0 1 auto',
                                                                    title: wp.i18n.__('Shrink if needed', 'block-designer')
                                                                },
                                                                React.createElement(Icon, {icon:parentStyle.flexDirection?.replace(/\-reverse$/, '') === 'column' ? 'arrow-collapse-vertical' : 'arrow-collapse-horizontal'})
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: '1 1 0%',
                                                                    title: wp.i18n.__('Grow if possible', 'block-designer')
                                                                },
                                                                React.createElement(Icon, {icon:parentStyle.flexDirection?.replace(/\-reverse$/, '') === 'column' ? 'arrow-expand-vertical' : 'arrow-expand-horizontal'})
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: '0 0 auto',
                                                                    title: wp.i18n.__('Don\'t shrink or grow', 'block-designer')
                                                                },
                                                                React.createElement(Icon, {icon:'close'})
                                                            )
                                                        )
                                                    )
                                                ),
                                                wp.element.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Align Self', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.alignSelf,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.alignSelf = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    React.createElement('div',
                                                        {
                                                            style: {
                                                                display: 'block'
                                                            }
                                                        },
                                                        wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                            {
                                                                onChange: (newValue) => {
                                                                    selectedNodeCSSStyleRule.style.alignSelf = newValue;
                                                                    selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                    //this.setState({selectedNode: selectedNode});
                                                                    this.props.edit.handleChange();
                                                                },
                                                                checked: selectedNodeCSSStyleRule.style.alignSelf || null
                                                            },
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'flex-start',
                                                                    title: wp.i18n._x('Start', 'CSS flex', 'block-designer')
                                                                },
                                                                React.createElement(Icon, {icon:'bd-alignItems', type: 'flex-start', dir: parentStyle?.flexDirection, elem2exist: false})
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'center',
                                                                    title: wp.i18n._x('Center', 'CSS flex', 'block-designer')
                                                                },
                                                                React.createElement(Icon, {icon:'bd-alignItems', type: 'center', dir: parentStyle?.flexDirection, elem2exist: false})
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'flex-end',
                                                                    title: wp.i18n._x('End', 'CSS flex', 'block-designer')
                                                                },
                                                                React.createElement(Icon, {icon:'bd-alignItems', type: 'flex-end', dir: parentStyle?.flexDirection, elem2exist: false})
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'stretch',
                                                                    title: wp.i18n.__('Stretch', 'block-designer')
                                                                },
                                                                React.createElement(Icon, {icon:'bd-alignItems', type: 'stretch', dir: parentStyle?.flexDirection, elem2exist: false})
                                                            )
                                                        )
                                                    )
                                                )
                                            ) : null,
                                            React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Layout', 'block-designer'),
                                                    icon: React.createElement(Icon, {icon: 'border-all'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['display', 'flexDirection', 'alignItems', 'justifyContent', 'columnGap', 'rowGap', 'flexWrap']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'layout',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'layout' : null});
                                                    }
                                                },
                                                wp.element.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Display', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.display,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.display = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                        {
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.display = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            },
                                                            checked: selectedNodeCSSStyleRule.style.display || null
                                                        },
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'block'
                                                            }, wp.i18n._x('Block', 'CSS display', 'block-designer')
                                                        ),
                                                        selectedNode.handler.allowChildren ? wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'flex'
                                                            }, wp.i18n._x('Flex', 'CSS display', 'block-designer')
                                                        ) : null,
                                                        /* wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'grid'
                                                            }, wp.i18n._x('Grid', 'CSS display', 'block-designer')
                                                        ), */
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'inline-block'
                                                            }, wp.i18n._x('Inline Block', 'CSS display', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'inline'
                                                            }, wp.i18n._x('Inline', 'CSS display', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'none'
                                                            }, wp.i18n._x('None', 'CSS display', 'block-designer')
                                                        )
                                                    )
                                                ),
                                                selectedNodeCSSStyleRule.style.display === 'flex' ? [
                                                    wp.element.createElement(AppBaseControl,
                                                        {
                                                            label: wp.i18n.__('Flex Direction', 'block-designer'),
                                                            isSet: !!selectedNodeCSSStyleRule.style.flexDirection,
                                                            onReset: () => {
                                                                selectedNodeCSSStyleRule.style.flexDirection = '';
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        },
                                                        React.createElement('div',
                                                            {
                                                                style: {
                                                                    display: 'flex',
                                                                    gridGap: '10px'
                                                                }
                                                            },
                                                            wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                                {
                                                                    onChange: (newValue) => {
                                                                        const reverseValue = !!selectedNodeCSSStyleRule.style.flexDirection?.match(/\-reverse$/);
                                                                        selectedNodeCSSStyleRule.style.flexDirection = newValue + (reverseValue ? '-reverse' : '');
                                                                        selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                        //this.setState({selectedNode: selectedNode});
                                                                        this.props.edit.handleChange();
                                                                    },
                                                                    checked: selectedNodeCSSStyleRule.style.flexDirection?.replace(/\-reverse$/, '') || null
                                                                },
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'row',
                                                                        title: wp.i18n.__('Row', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'table-row'})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'column',
                                                                        title: wp.i18n.__('Column', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'table-column'})
                                                                )
                                                            ),
                                                            wp.element.createElement(wp.components.ToggleControl,
                                                                {
                                                                    label: wp.i18n.__('Reverse', 'block-designer'),
                                                                    checked: !!selectedNodeCSSStyleRule.style.flexDirection?.match(/\-reverse$/),
                                                                    onChange: (newValue) => {
                                                                        const mainValue = selectedNodeCSSStyleRule.style.flexDirection?.replace(/\-reverse$/, '') || 'row';
                                                                        selectedNodeCSSStyleRule.style.flexDirection = newValue ? mainValue + '-reverse' : mainValue;
                                                                        selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                        //this.setState({selectedNode: selectedNode});
                                                                        this.props.edit.handleChange();
                                                                    }
                                                                }
                                                            )
                                                        )
                                                    ),
                                                    wp.element.createElement(AppBaseControl,
                                                        {
                                                            label: wp.i18n.__('Align Items', 'block-designer'),
                                                            isSet: !!selectedNodeCSSStyleRule.style.alignItems,
                                                            onReset: () => {
                                                                selectedNodeCSSStyleRule.style.alignItems = '';
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        },
                                                        React.createElement('div',
                                                            {
                                                                style: {
                                                                    display: 'block'
                                                                }
                                                            },
                                                            wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                                {
                                                                    onChange: (newValue) => {
                                                                        selectedNodeCSSStyleRule.style.alignItems = newValue;
                                                                        selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                        //this.setState({selectedNode: selectedNode});
                                                                        this.props.edit.handleChange();
                                                                    },
                                                                    checked: selectedNodeCSSStyleRule.style.alignItems || null
                                                                },
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'flex-start',
                                                                        title: wp.i18n._x('Start', 'CSS flex', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-alignItems', type: 'flex-start', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'center',
                                                                        title: wp.i18n._x('Center', 'CSS flex', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-alignItems', type: 'center', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'flex-end',
                                                                        title: wp.i18n._x('End', 'CSS flex', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-alignItems', type: 'flex-end', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'stretch',
                                                                        title: wp.i18n.__('Stretch', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-alignItems', type: 'stretch', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                )
                                                            )
                                                        )
                                                    ),
                                                    wp.element.createElement(AppBaseControl,
                                                        {
                                                            label: wp.i18n.__('Justify Content', 'block-designer'),
                                                            isSet: !!selectedNodeCSSStyleRule.style.justifyContent,
                                                            onReset: () => {
                                                                selectedNodeCSSStyleRule.style.justifyContent = '';
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        },
                                                        React.createElement('div',
                                                            {
                                                                style: {
                                                                    display: 'block'
                                                                }
                                                            },
                                                            wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                                {
                                                                    onChange: (newValue) => {
                                                                        selectedNodeCSSStyleRule.style.justifyContent = newValue;
                                                                        selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                        //this.setState({selectedNode: selectedNode});
                                                                        this.props.edit.handleChange();
                                                                    },
                                                                    checked: selectedNodeCSSStyleRule.style.justifyContent || null
                                                                },
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'flex-start',
                                                                        title: wp.i18n._x('Start', 'CSS flex', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-justifyContent', type: 'flex-start', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'center',
                                                                        title: wp.i18n._x('Center', 'CSS flex', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-justifyContent', type: 'center', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'flex-end',
                                                                        title: wp.i18n._x('End', 'CSS flex', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-justifyContent', type: 'flex-end', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'space-between',
                                                                        title: wp.i18n.__('Space between', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-justifyContent', type: 'space-between', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                ),
                                                                wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                    {
                                                                        value: 'space-around',
                                                                        title: wp.i18n.__('Space around', 'block-designer')
                                                                    },
                                                                    React.createElement(Icon, {icon:'bd-justifyContent', type: 'space-around', dir: selectedNodeCSSStyleRule.style.flexDirection})
                                                                )
                                                            )
                                                        )
                                                    ),
                                                    React.createElement(AppControlUnits,
                                                        {
                                                            label: wp.i18n.__('Gap', 'block-designer'),
                                                            propertyName: 'gap',
                                                            fields: [
                                                                {
                                                                    label: wp.i18n.__('Columns', 'block-designer'),
                                                                    value: selectedNodeCSSStyleRule.style.columnGap,
                                                                    propertyName: 'column-gap'
                                                                },
                                                                {
                                                                    label: wp.i18n.__('Rows', 'block-designer'),
                                                                    value: selectedNodeCSSStyleRule.style.rowGap,
                                                                    propertyName: 'row-gap'
                                                                }
                                                            ],
                                                            onChange: (newValue) => {
                                                                Object.assign(selectedNodeCSSStyleRule.style, newValue);
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                    wp.element.createElement(AppBaseControl,
                                                        {
                                                            label: wp.i18n.__('Flex Wrap', 'block-designer'),
                                                            isSet: !!selectedNodeCSSStyleRule.style.flexWrap,
                                                            onReset: () => {
                                                                selectedNodeCSSStyleRule.style.flexWrap = '';
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        },
                                                        wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                            {
                                                                onChange: (newValue) => {
                                                                    selectedNodeCSSStyleRule.style.flexWrap = newValue;
                                                                    selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                    //this.setState({selectedNode: selectedNode});
                                                                    this.props.edit.handleChange();
                                                                },
                                                                checked: selectedNodeCSSStyleRule.style.flexWrap || null
                                                            },
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'nowrap'
                                                                },
                                                                wp.i18n.__('No Wrap', 'block-designer')
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'wrap'
                                                                },
                                                                wp.i18n.__('Wrap', 'block-designer')
                                                            )
                                                        )
                                                    )
                                                ] : null
                                            ),
                                            React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Spacing', 'block-designer'),
                                                    icon: React.createElement(Icon, {icon: 'arrow-expand-horizontal'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'spacing',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'spacing' : null});
                                                    }
                                                },
                                                wp.element.createElement(wp.components.BoxControl || wp.components.__experimentalBoxControl,
                                                    {
                                                        label: wp.i18n.__('Margin', 'block-designer'),
                                                        inputProps: {
                                                            min: -10000
                                                        },
                                                        values: {
                                                            top: selectedNodeCSSStyleRule.style.marginTop,
                                                            right: selectedNodeCSSStyleRule.style.marginRight,
                                                            bottom: selectedNodeCSSStyleRule.style.marginBottom,
                                                            left: selectedNodeCSSStyleRule.style.marginLeft
                                                        },
                                                        onChange: (newValue) => {
                                                            selectedNodeCSSStyleRule.style.marginTop = newValue.top === undefined ? '' : newValue.top;
                                                            selectedNodeCSSStyleRule.style.marginRight = newValue.right === undefined ? '' : newValue.right;
                                                            selectedNodeCSSStyleRule.style.marginBottom = newValue.bottom === undefined ? '' : newValue.bottom;
                                                            selectedNodeCSSStyleRule.style.marginLeft = newValue.left === undefined ? '' : newValue.left;
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    }
                                                ),
                                                wp.element.createElement(wp.components.BoxControl || wp.components.__experimentalBoxControl,
                                                    {
                                                        label: wp.i18n.__('Padding', 'block-designer'),
                                                        values: {
                                                            top: selectedNodeCSSStyleRule.style.paddingTop,
                                                            right: selectedNodeCSSStyleRule.style.paddingRight,
                                                            bottom: selectedNodeCSSStyleRule.style.paddingBottom,
                                                            left: selectedNodeCSSStyleRule.style.paddingLeft
                                                        },
                                                        onChange: (newValue) => {
                                                            selectedNodeCSSStyleRule.style.paddingTop = newValue.top === undefined ? '' : newValue.top;
                                                            selectedNodeCSSStyleRule.style.paddingRight = newValue.right === undefined ? '' : newValue.right;
                                                            selectedNodeCSSStyleRule.style.paddingBottom = newValue.bottom === undefined ? '' : newValue.bottom;
                                                            selectedNodeCSSStyleRule.style.paddingLeft = newValue.left === undefined ? '' : newValue.left;
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    }
                                                )
                                            ),
                                            React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Size', 'block-designer'),
                                                    className: 'bd-edit--panel-tab-element--size',
                                                    icon: React.createElement(Icon, {icon: 'arrow-left-right-bold'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight', 'overflow', 'objectFit']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'size',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'size' : null});
                                                    }
                                                },
                                                React.createElement('div',
                                                    {
                                                        style: {
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr 1fr',
                                                            gap: '10px'
                                                        }
                                                    },
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Width', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.width,
                                                            min: 0,
                                                            //labelPosition: 'bottom',
                                                            //className: 'bd-edit--labelPositionEdge',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.width = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Min Width', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.minWidth,
                                                            min: 0,
                                                            //labelPosition: 'edge',
                                                            //className: 'bd-edit--labelPositionEdge',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.minWidth = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Max Width', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.maxWidth,
                                                            min: 0,
                                                            //labelPosition: 'edge',
                                                            //className: 'bd-edit--labelPositionEdge',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.maxWidth = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                ),
                                                React.createElement('div',
                                                    {
                                                        style: {
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr 1fr',
                                                            gap: '10px'
                                                        }
                                                    },
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Height', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.height,
                                                            min: 0,
                                                            //labelPosition: 'bottom',
                                                            //className: 'bd-edit--labelPositionEdge',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.height = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Min Height', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.minHeight,
                                                            min: 0,
                                                            //labelPosition: 'edge',
                                                            //className: 'bd-edit--labelPositionEdge',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.minHeight = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Max Height', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.maxHeight,
                                                            min: 0,
                                                            //labelPosition: 'edge',
                                                            //className: 'bd-edit--labelPositionEdge',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.maxHeight = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                ),
                                                wp.element.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Overflow', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.overflow,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.overflow = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                        {
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.overflow = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            },
                                                            checked: selectedNodeCSSStyleRule.style.overflow || null
                                                        },
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'visible'
                                                            },
                                                            wp.i18n.__('visible', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'hidden'
                                                            },
                                                            wp.i18n.__('hidden', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'scroll'
                                                            },
                                                            wp.i18n.__('scroll', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'auto'
                                                            },
                                                            wp.i18n.__('auto', 'block-designer')
                                                        )
                                                    )
                                                ),
                                                selectedNode.handler.supportsCSSStyleObjectFit === true ? [
                                                    wp.element.createElement(AppBaseControl,
                                                        {
                                                            label: wp.i18n.__('Object Fit', 'block-designer'),
                                                            isSet: !!selectedNodeCSSStyleRule.style.objectFit,
                                                            onReset: () => {
                                                                selectedNodeCSSStyleRule.style.objectFit = '';
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        },
                                                        wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                            {
                                                                onChange: (newValue) => {
                                                                    selectedNodeCSSStyleRule.style.objectFit = newValue;
                                                                    selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                    //this.setState({selectedNode: selectedNode});
                                                                    this.props.edit.handleChange();
                                                                },
                                                                checked: selectedNodeCSSStyleRule.style.objectFit || null
                                                            },
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'fill',
                                                                    title: wp.i18n.__('Fill', 'block-designer')
                                                                }, wp.i18n.__('Fill', 'block-designer')
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'contain',
                                                                    title: wp.i18n.__('Contain', 'block-designer')
                                                                }, wp.i18n.__('Contain', 'block-designer')
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'cover',
                                                                    title: wp.i18n.__('Cover', 'block-designer')
                                                                }, wp.i18n.__('Cover', 'block-designer')
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'none',
                                                                    title: wp.i18n.__('None', 'block-designer')
                                                                }, wp.i18n.__('None', 'block-designer')
                                                            ),
                                                            wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                                {
                                                                    value: 'scale-down',
                                                                    title: wp.i18n.__('Scale Down', 'block-designer')
                                                                }, wp.i18n.__('Scale Down', 'block-designer')
                                                            )
                                                        )
                                                    )
                                                ] : null,
                                            ),
                                            React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Typography', 'block-designer'),
                                                    icon: React.createElement(Icon, {icon: 'format-letter-case'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['fontWeight', 'fontStyle', 'fontSize', 'lineHeight', 'color', 'textAlign', 'textDecoration']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'typography',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'typography' : null});
                                                    }
                                                },
                                                React.createElement('div',
                                                    {
                                                        style: {
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr',
                                                            gap: '10px'
                                                        }
                                                    },
                                                    wp.element.createElement(wp.components.SelectControl,
                                                        {
                                                            label: wp.i18n.__('Font Weight', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.fontWeight || null,
                                                            options: [
                                                                { value: null, label: '' },
                                                                { value: 100, label: '100 - Thin' },
                                                                { value: 200, label: '200 - Extra Light' },
                                                                { value: 300, label: '300 - Light' },
                                                                { value: 400, label: '400 - Normal' },
                                                                { value: 500, label: '500 - Medium' },
                                                                { value: 600, label: '600 - Semi Bold' },
                                                                { value: 700, label: '700 - Bold' },
                                                                { value: 800, label: '800 - Extra Bold' },
                                                                { value: 900, label: '900 - Black' },
                                                            ],
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.fontWeight = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                this.props.edit.handleChange();
                                                                //this.setState({selectedNode: selectedNode});
                                                            }
                                                        }
                                                    ),
                                                    wp.element.createElement(wp.components.SelectControl,
                                                        {
                                                            label: wp.i18n.__('Font Style', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.fontStyle || null,
                                                            options: [
                                                                { value: null, label: '' },
                                                                { value: 'normal', label: 'Normal' },
                                                                { value: 'italic', label: 'Italic' }
                                                            ],
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.fontStyle = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                this.props.edit.handleChange();
                                                                //this.setState({selectedNode: selectedNode});
                                                            }
                                                        }
                                                    ),
                                                ),
                                                React.createElement('div',
                                                    {
                                                        style: {
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr',
                                                            gap: '10px'
                                                        }
                                                    },
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Font Size', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.fontSize,
                                                            min: 0,
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.fontSize = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Line Height', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.lineHeight,
                                                            min: 0,
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.lineHeight = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    )
                                                ),
                                                React.createElement(AppControlColor,
                                                    {
                                                        label: wp.i18n.__('Color', 'block-designer'),
                                                        value: selectedNodeCSSStyleRule.style.color || '',
                                                        onChange: (newValue) => {
                                                            selectedNodeCSSStyleRule.style.color = newValue;
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    }
                                                ),
                                                wp.element.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Text Align', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.textAlign,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.textAlign = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                        {
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.textAlign = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            },
                                                            checked: selectedNodeCSSStyleRule.style.textAlign || null
                                                        },
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'left',
                                                                title: wp.i18n._x('Left', 'text alignment', 'block-designer')
                                                            },
                                                            React.createElement(Icon, {icon: 'format-align-left'})
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'center',
                                                                title: wp.i18n._x('Center', 'text alignment', 'block-designer')
                                                            },
                                                            React.createElement(Icon, {icon: 'format-align-center'})
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'right',
                                                                title: wp.i18n._x('Right', 'text alignment', 'block-designer')
                                                            },
                                                            React.createElement(Icon, {icon: 'format-align-right'})
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'justify',
                                                                title: wp.i18n._x('Justify', 'text alignment', 'block-designer')
                                                            },
                                                            React.createElement(Icon, {icon: 'format-align-justify'})
                                                        )
                                                    )
                                                ),
                                                wp.element.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Text Decoration', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.textDecoration,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.textDecoration = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                        {
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.textDecoration = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            },
                                                            checked: selectedNodeCSSStyleRule.style.textDecoration || null
                                                        },
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'line-through',
                                                                title: wp.i18n.__('Line Through', 'block-designer')
                                                            },
                                                            React.createElement(Icon, {icon: 'format-strikethrough'})
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'underline',
                                                                title: wp.i18n.__('Underline', 'block-designer')
                                                            },
                                                            React.createElement(Icon, {icon: 'format-underline'})
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'overline',
                                                                title: wp.i18n.__('Overline', 'block-designer')
                                                            },
                                                            React.createElement(Icon, {icon: 'format-overline'})
                                                        )
                                                    )
                                                ),
                                            ),
                                            React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Border', 'block-designer'),
                                                    icon: React.createElement(Icon, {icon: 'border-radius'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['borderRadius', 'borderStyle', 'borderWidth', 'borderColor']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'border',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'border' : null});
                                                    }
                                                },
                                                wp.element.createElement(AppControlUnit,
                                                    {
                                                        label: wp.i18n.__('Border Radius', 'block-designer'),
                                                        value: selectedNodeCSSStyleRule.style.borderRadius,
                                                        min: 0,
                                                        /* labelPosition: 'side', */
                                                        onChange: (newValue) => {
                                                            selectedNodeCSSStyleRule.style.borderRadius = newValue;
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    }
                                                ),
                                                /* wp.element.createElement(wp.components.RangeControl,
                                                    {
                                                        label: 'Border Radius',
                                                        min: 0,
                                                        max: 100,
                                                        onChange: (newValue) => {
                                                            selectedNodeCSSStyleRule.style.borderRadius = newValue + 'px';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        },
                                                        value: parseInt(selectedNodeCSSStyleRule.style.borderRadius || 0)
                                                    }
                                                ), */
                                                wp.element.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Border Style', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.borderStyle,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.border = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    wp.element.createElement(wp.components.RadioGroup || wp.components.__experimentalRadioGroup,
                                                        {
                                                            label: 'style',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.borderStyle = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            },
                                                            checked: selectedNodeCSSStyleRule.style.borderStyle || null
                                                        },
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'solid'
                                                            }, wp.i18n.__('solid', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'dashed'
                                                            }, wp.i18n.__('dashed', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'dotted'
                                                            }, wp.i18n.__('dotted', 'block-designer')
                                                        ),
                                                        wp.element.createElement(wp.components.Radio || wp.components.__experimentalRadio,
                                                            {
                                                                value: 'none'
                                                            }, wp.i18n.__('none', 'block-designer')
                                                        )
                                                    )
                                                ),
                                                selectedNodeCSSStyleRule.style.borderStyle !== '' && selectedNodeCSSStyleRule.style.borderStyle !== 'none' ? [
                                                    wp.element.createElement(AppControlUnit,
                                                        {
                                                            label: wp.i18n.__('Border Width', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.borderWidth,
                                                            min: 0,
                                                            /* labelPosition: 'side', */
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.borderWidth = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    ),
                                                    React.createElement(AppControlColor,
                                                        {
                                                            label: wp.i18n.__('Border Color', 'block-designer'),
                                                            value: selectedNodeCSSStyleRule.style.borderColor || '',
                                                            onChange: (newValue) => {
                                                                selectedNodeCSSStyleRule.style.borderColor = newValue;
                                                                selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                                //this.setState({selectedNode: selectedNode});
                                                                this.props.edit.handleChange();
                                                            }
                                                        }
                                                    )
                                                ] : null
                                                /* ,
                                                wp.element.createElement(wp.components.__experimentalBorderBoxControl,
                                                    {
                                                        onChange: (newValue) => {
                                                            if (newValue.width) {
                                                                newValue
                                                            }
                                                            console.log(newValue);
                                                        },
                                                        label: 'Border',
                                                        value: (() => {

                                                        })()
                                                    }
                                                ) */
                                            ),
                                            React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Background', 'block-designer'),
                                                    icon: React.createElement(Icon, {icon: 'checkerboard'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['backgroundColor', 'backgroundImage']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'background',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'background' : null});
                                                    }
                                                },
                                                React.createElement(AppControlColor,
                                                    {
                                                        label: wp.i18n.__('Background Color', 'block-designer'),
                                                        value: selectedNodeCSSStyleRule.style.backgroundColor,
                                                        onChange: (newValue) => {
                                                            selectedNodeCSSStyleRule.style.backgroundColor = newValue;
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    }
                                                ),
                                                React.createElement(AppControlGradient,
                                                    {
                                                        label: wp.i18n.__('Background Gradient', 'block-designer'),
                                                        value: selectedNodeCSSStyleRule.style.backgroundImage,
                                                        onChange: (newValue) => {
                                                            selectedNodeCSSStyleRule.style.backgroundImage = newValue;
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    }
                                                )
                                            ),
                                            React.createElement(bd.app.components.AppPanelBody,
                                                {
                                                    title: wp.i18n.__('Effects', 'block-designer'),
                                                    icon: React.createElement(Icon, {icon: 'auto-fix'}),
                                                    isSet: bd.helper.stylesSet(selectedNodeCSSStyleRule.style, ['boxShadow']),
                                                    initialOpen: false,
                                                    opened: this.state.openElementPanel === 'effects',
                                                    onToggle: (opened) => {
                                                        this.setState({openElementPanel: opened ? 'effects' : null});
                                                    }
                                                },
                                                React.createElement(AppBaseControl,
                                                    {
                                                        label: wp.i18n.__('Box Shadow', 'block-designer'),
                                                        isSet: !!selectedNodeCSSStyleRule.style.boxShadow,
                                                        onReset: () => {
                                                            selectedNodeCSSStyleRule.style.boxShadow = '';
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        }
                                                    },
                                                    (() => {
                                                        const m = selectedNodeCSSStyleRule.style.boxShadow.match(/[^\s\(]+(\(.+\))?/g);
                                                        let lengths = [0, 0, 0, 0];
                                                        let color = 'rgba(0, 0, 0, 1)';
                                                        if (m) {
                                                            if (m.indexOf(',') > -1) {
                                                                m.splice(m.indexOf(','));
                                                            }
                                                            lengths = [...m.filter((item) => !!item.match(/^\-?[0-9]+.*/)), 0, 0, 0, 0].slice(0, 4);
                                                            color = [...m.filter((item) => !item.match(/(^\-?[0-9]+.*|inset)/)), color][0];
                                                        }

                                                        const setShadow = () => {
                                                            selectedNodeCSSStyleRule.style.boxShadow = lengths.join(' ') + ' ' + color;
                                                            selectedNodePayloadStyle.style = selectedNodeCSSStyleRule.style.cssText;
                                                            //this.setState({selectedNode: selectedNode});
                                                            this.props.edit.handleChange();
                                                        };


                                                        return [
                                                            React.createElement(AppControlColor,
                                                                {
                                                                    label: wp.i18n.__('Color', 'block-designer'),
                                                                    value: color,
                                                                    onChange: (newValue) => {
                                                                        color = newValue;
                                                                        setShadow();
                                                                    }
                                                                }
                                                            ),
                                                            React.createElement('div',
                                                                {
                                                                    style: {
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr 1fr',
                                                                        gap: '10px'
                                                                    }
                                                                },
                                                                wp.element.createElement(AppControlUnit,
                                                                    {
                                                                        label: wp.i18n.__('Radius', 'block-designer'),
                                                                        value: lengths[2],
                                                                        min: 0,
                                                                        onChange: (newValue) => {
                                                                            lengths[2] = newValue;
                                                                            setShadow();
                                                                        }
                                                                    }
                                                                ),
                                                                wp.element.createElement(AppControlUnit,
                                                                    {
                                                                        label: wp.i18n.__('Offset X', 'block-designer'),
                                                                        value: lengths[0],
                                                                        onChange: (newValue) => {
                                                                            lengths[0] = newValue;
                                                                            setShadow();
                                                                        }
                                                                    }
                                                                ),
                                                                wp.element.createElement(AppControlUnit,
                                                                    {
                                                                        label: wp.i18n.__('Offset Y', 'block-designer'),
                                                                        value: lengths[1],
                                                                        onChange: (newValue) => {
                                                                            lengths[1] = newValue;
                                                                            setShadow();
                                                                        }
                                                                    }
                                                                ),
                                                            )
                                                        ];
                                                    })()
                                                )
                                            )
                                        ];
                                    })() : null,
                                )})()
                            },
                        ]
                    },
                    (tab) => {
                        return tab.content;
                    }
                )
            )
        );
    }
});
