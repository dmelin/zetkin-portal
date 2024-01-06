
bd.helper.registerAppComponent(class AppCanvasElement extends React.Component {
    constructor(props) {
        super(props);

        this.element = React.createRef();
    }

    render() {
        const edit = this.props.edit === true;
        const {domnode, selectedNode, onSelectNode, onHoverNode, onUnhoverNode} = this.props;
        const [nodeName, attributes, ...children] = domnode;

        if (edit) {
            if (domnode.element !== this.element) {
                domnode.element = this.element;
                this.element.BDdomnode = domnode;
            }
            if (selectedNode?.element === this.element && selectedNode !== domnode) {
                onSelectNode(domnode);
            }
        }

        // prepare attributes
        var canvasElementAttributes = {};
        if (edit) {
            canvasElementAttributes.ref = this.element;
            Object.assign(canvasElementAttributes, {
                onClick: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    onSelectNode(domnode);
                },
                onMouseOver: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    onHoverNode(domnode);
                },
                onMouseOut: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    onUnhoverNode(domnode);
                }
            });
        }

        const isRoot = domnode === domnode.root;

        const result = domnode.handler ? domnode.handler.renderDesignerCanvas({
            canvasElementAttributes: canvasElementAttributes,
            props: this.props,
            renderChildren: (children) => {
                return children.map((child) => {
                    return React.createElement(bd.app.components.AppCanvasElement,
                        Object.assign({}, this.props, {
                            domnode: child
                        })
                    )
                });
            }
        }) : null;

        if (isRoot) {
            const block = domnode.ownerBlock;
            const blockClassName = 'wp-block-' + block.blockNamespace + '--- wp-block-' + block.blockFullName?.replace(/\//, '-') + ' bd-resizeobserve';
            result.props.className = blockClassName + (result.props.className ? ' ' + result.props.className : '');
            return [
                React.createElement('style', null, BDData.generalBlockStyles),
                React.createElement('style', null, bd.helper.getBlockStyle(block, { ...(this.props.showThemeStyles ? {prefix: '.editor-styles-wrapper '} : {}), doubleClassName: true })),
                React.createElement(bd.components.ResizeObserver, null, result)
            ];
        }

        return result;
    }
});
