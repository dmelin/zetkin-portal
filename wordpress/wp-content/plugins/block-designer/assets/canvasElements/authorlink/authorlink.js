
bd.helper.registerCanvasElement(class authorlink extends bd.CanvasElementPrototype {

    name = wp.i18n.__('Author Link', 'block-designer')
    icon = 'link-variant'
    description = wp.i18n.__('Allows authors in the WordPress Block Editor to define a click target for this area.', 'block-designer')
    color = '#8a61ff'
    authorInput = true
    allowChildren = true
    allowRoot = true
    allowMultiple = true
    initialContent = ['bd-authorlink',{}]

    supportsHTMLTagName = false
    supportsHTMLAttributes = true
    supportsCSSStyle = true
    rendersOnlyText = false

    constructor(node) {
        super(node);
        this.node = node;
    }

    renderDesignerCanvas({canvasElementAttributes, renderChildren, props}) {
        const [,,...children] = this.node;
        
        const { ...attr } = this.node[1];
        delete attr.bd;
        const className = ['bd-authorlink', (attr.class || ''), (attr.className || ''), ...(attr.classes || [])]?.join(' ').replace(/\s+/, ' ').trim();
        if (className !== '') {
            attr.className = className;
        }
        delete attr.classes;
        delete attr.style;

        const {attributes, setAttributes} = props;

        const attributeName = this.node[1]?.bd?.attributeName || null;
        const attributeValue = attributeName ? attributes?.[attributeName] : '';

        const isLink = !!attributeValue?.url;
        const tagName = isLink ? 'a' : 'div';

        return React.createElement(tagName,
            {
                ...attr || {},
                ...(isLink ? {href: 'javascript:;'} : {}),
                ...canvasElementAttributes
            },
            this.allowChildren ? renderChildren(children) : null
        );
    }

    renderDesignerElementPanel({props}) {
        return [
            // Field to change the attribute name
            /* wp.element.createElement(wp.components.PanelBody,
                null,
                wp.element.createElement(wp.components.TextControl,
                    {
                        label: 'Block Attribute Name',
                        value: this.node[1]?.bd?.attributeName || '',
                        onChange: (newValue) => {
                            if (this.node[1].bd === undefined) {
                                this.node[1].bd = {};
                            }
                            this.node[1].bd.attributeName = newValue;
                            props.edit.handleChange();
                        }
                    }
                )
            ), */
            wp.element.createElement(wp.components.PanelBody,
                null,
                wp.element.createElement(wp.components.TextControl,
                    {
                        label: wp.i18n.__('Link Form Field Caption', 'block-designer'),
                        help: wp.i18n.__('Describes the form field in the WordPress Block Editor where the author can insert the link', 'block-designer'),
                        value: this.node[1]?.bd?.caption || '',
                        onChange: (newValue) => {
                            if (this.node[1].bd === undefined) {
                                this.node[1].bd = {};
                            }
                            this.node[1].bd.caption = newValue;
                            props.edit.handleChange();
                        }
                    }
                )
            )
        ];
    }

    getBlockAttibuteDefinitions({recursively}) {
        const attributes = {};
        if (this.node[1]?.bd?.attributeName) {
            attributes[this.node[1]?.bd?.attributeName] = {
                type: 'object'
            }
        }
        return {
            ...attributes,
            ...super.getBlockAttibuteDefinitions({recursively})
        };
    }

    resolveAttributeNameConflicts(reservedAttributeNames)
    {
        if (this.node?.[1]?.bd?.attributeName && reservedAttributeNames[this.node?.[1]?.bd?.attributeName] === undefined) {
            reservedAttributeNames[this.node[1].bd.attributeName] = true;
            return;
        }

        let number = '';
        if (reservedAttributeNames.authorlink !== undefined) {
            for (number = 2; reservedAttributeNames['authorlink' + number] !== undefined; number++);
        }

        if (!this.node[1].bd) this.node[1].bd = {};
        this.node[1].bd.attributeName = 'authorlink' + number;
        reservedAttributeNames['authorlink' + number] = true;

        super.resolveAttributeNameConflicts(reservedAttributeNames);
    }

    getItemIds(blockAttributes) {
        const ids = [];
        if (blockAttributes?.[this.node[1]?.bd?.attributeName]?.id > 0) {
            ids.push({
                id: blockAttributes[this.node[1].bd.attributeName].id,
                type: blockAttributes[this.node[1].bd.attributeName].type
            });
        }
        ids.push(...super.getItemIds(blockAttributes));
        return ids;
    }

    render_BlockEditor_InspectorControls({props})
    {
        const {attributes, setAttributes} = props;

        const attributeName = this.node[1]?.bd?.attributeName || null;
        const attributeValue = attributeName ? attributes?.[attributeName] : '';

        const targetItem = props?.items?.[attributeValue?.id];
        const value = targetItem ? 
            {
                ...attributeValue,
                title: targetItem.title.raw,
            } : (attributeValue || null);

        return wp.element.createElement(wp.components.PanelBody,
            {
                className: 'bd-authorlink-panel'
            },
            React.createElement('style',
                null,
                '.bd-authorlink-panel .block-editor-link-control { min-width: 0; }' +
                '.bd-authorlink-panel .block-editor-link-control__search-item.is-current { padding: 0; }' +
                '.bd-authorlink-panel .block-editor-link-control__field { margin: 0; }' +
                '.bd-authorlink-panel .block-editor-link-control__tools { padding-left: 0; padding-right: 0; border-top: 0; }' +
                '.bd-authorlink-panel .block-editor-link-control__search-results { padding: 0; }' +
                '.bd-authorlink-panel .block-editor-link-control__search-item .block-editor-link-control__search-item-title { line-break: anywhere; }' +
                '.bd-authorlink-panel .block-editor-link-control__search-results-wrapper { margin-top: 0; }'
            ),
            wp.element.createElement(wp.components.BaseControl,
                {
                    label: this.node[1]?.bd?.caption
                },
                wp.element.createElement(wp.blockEditor.LinkControl || wp.blockEditor.__experimentalLinkControl,
                    {
                        value: value,
                        onRemove: () => {
                            const obj = {};
                            obj[attributeName] = undefined;
                            setAttributes( obj );
                        },
                        onChange: (newValueRaw) => {
                            const newValue = bd.helper.filterObject(newValueRaw, (value, key) => !!value && ['type', 'id', 'url', 'opensInNewTab'].indexOf(key) > -1);
                            const obj = {};
                            obj[attributeName] = newValue;
                            setAttributes( obj );
                        }
                    }
                )
            )
        );
    }

    renderBlockEdit(args) {
        return this.renderDesignerCanvas({
            ...args,
            edit: true
        })
    }
});
