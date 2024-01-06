
lodash.set(window, 'bd.CanvasElementPrototype', class CanvasElementPrototype {

    name = 'Unknown'
    icon = ''
    description = ''
    color = '#000'
    authorInput = false
    allowChildren = false
    allowRoot = false
    allowMultiple = true
    initialContent = null

    supportsHTMLTagName = false
    supportsHTMLAttributes = false
    supportsCSSStyle = false
    supportsCSSStyleObjectFit = false
    rendersOnlyText = false

    // Renders the canvas element itself in the Block Designer
    renderDesignerCanvas({canvasElementAttributes}) {
        return React.createElement('div',
            {
                ...this.node[1] || {},
                style: {
                    display: 'flex',
                    minWidth: '100px',
                    minHeight: '100px',
                    padding: '5px',
                    background: '#eee',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#000',
                    //gap: '10px',
                    //height: '100px',
                    border: '#999 solid 1px',
                    boxSizing: 'border-box',
                    fontSize: '13px',
                    lineHeight: '1.2',
                    fontWeight: '400',
                    textDecoration: 'none !important',
                    fontStyle: 'normal',
                    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
                },
                ...canvasElementAttributes
            },
            React.createElement(bd.components.Icon, {icon: this.icon}),
            this.name
        );
    }

    // Renders the individual part of the panel on the right side of the Block Designer
    renderDesignerElementPanel() {
        
    }
    
    // Collects all media IDs that are used in the block (needed for preloading images, ...)
    getMediaIds(blockAttributes) {
        const mediaIds = [];
        if (this.allowChildren === true && this.node.length > 2) {
            this.node.slice(2).forEach((item) => {
                mediaIds.push(...item.handler.getMediaIds(blockAttributes));
            });
        }
        return mediaIds;
    }

    // Collects all post IDs that are used in the block (needed for preloading post titles, ...)
    getItemIds(blockAttributes) {
        const itemIds = [];
        if (this.allowChildren === true && this.node.length > 2) {
            this.node.slice(2).forEach((item) => {
                itemIds.push(...item.handler.getItemIds(blockAttributes));
            });
        }
        return itemIds;
    }

    // Collects all the example contents and returns them as one attribute object that can be assigned directly to a block example property
    getBlockExampleAttributes({recursively}) {
        const attributes = {};
        if (recursively === true && this.allowChildren === true && this.node.length > 2) {
            this.node.slice(2).forEach((item) => {
                Object.assign(attributes, item.handler.getBlockExampleAttributes({recursively}));
            });
        }
        return attributes;
    }

    // Collects all attribute definitions and returns them as one attribute definition object that can be assigned directly to a block attributes property
    getBlockAttibuteDefinitions({recursively}) {
        const attributes = {};
        if (recursively === true && this.allowChildren === true && this.node.length > 2) {
            this.node.slice(2).forEach((item) => {
                //console.log(item.handler.getBlockAttibuteDefinitions({recursively}));
                Object.assign(attributes, item.handler.getBlockAttibuteDefinitions({recursively}));
            });
        }
        return attributes;
    }

    // Resolves block attribute name conflicts (Avoids using names more than once)
    resolveAttributeNameConflicts(reservedAttributeNames) {
        if (this.allowChildren === true && this.node.length > 2) {
            this.node.slice(2).forEach((item) => {
                item.handler.resolveAttributeNameConflicts(reservedAttributeNames);
            });
        }
    }

    // Renderer for the block controls (block toolbar)
    render_BlockEditor_BlockControls() { return null; }

    // Renderer for the inspector controls (right side panels)
    render_BlockEditor_InspectorControls() { return null; }

    // Renderer for the "edit" function of the block
    renderBlockEdit() { return null; }

    //renderBlockSave() { return null; }
});

