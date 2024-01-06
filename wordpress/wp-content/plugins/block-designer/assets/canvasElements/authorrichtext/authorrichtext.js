
bd.helper.registerCanvasElement(class authorrichtext extends bd.CanvasElementPrototype {

    name = wp.i18n.__('Author RichText', 'block-designer')
    icon = 'format-text'
    description = wp.i18n.__('Allows authors in the WordPress Block Editor to add indivudual text.', 'block-designer')
    color = '#8a61ff'
    authorInput = true
    allowChildren = false
    allowRoot = false
    allowMultiple = true
    initialContent = ['bd-authorrichtext',{}]
    
    supportsHTMLTagName = false
    supportsHTMLAttributes = false
    supportsCSSStyle = false
    rendersOnlyText = true

    constructor(node) {
        super(node);
        this.node = node;
    }

    renderDesignerCanvas({canvasElementAttributes}) {
        const exampleText = this.node[1]?.bd?.attributeValueExample;
        const placeholderText = this.node[1]?.bd?.attributeValuePlaceholder;
        if (exampleText || placeholderText) {
            return React.createElement('span',
                {
                    ...canvasElementAttributes,
                    ...(!exampleText ? {
                        'data-placeholder': placeholderText,
                        style: {
                            opacity: .62
                        }
                    } : {})
                },
                exampleText ? exampleText.split(/(\r\n|\r|\n)/g).map((text, index) => {
                    return index % 2 ? React.createElement('br') : text;
                }) : placeholderText
            );
        } else {
            return super.renderDesignerCanvas({canvasElementAttributes});
        }
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
                        label: wp.i18n.__('Placeholder Text', 'block-designer'),
                        help: wp.i18n.__('Shown in the Block Editor when field is empty', 'block-designer'),
                        value: this.node[1]?.bd?.attributeValuePlaceholder || '',
                        onChange: (newValue) => {
                            if (this.node[1].bd === undefined) {
                                this.node[1].bd = {};
                            }
                            this.node[1].bd.attributeValuePlaceholder = newValue;
                            props.edit.handleChange();
                        }
                    }
                ),
                wp.element.createElement(wp.components.TextareaControl,
                    {
                        label: wp.i18n.__('Example Text', 'block-designer'),
                        help: wp.i18n.__('Shown as an example text in the block preview', 'block-designer'),
                        value: this.node[1]?.bd?.attributeValueExample || '',
                        onChange: (newValue) => {
                            if (this.node[1].bd === undefined) {
                                this.node[1].bd = {};
                            }
                            this.node[1].bd.attributeValueExample = newValue;
                            props.edit.handleChange();
                        }
                    }
                )
            )
        ];
    }

    getBlockExampleAttributes() {
        const attributes = {};
        if (this.node[1]?.bd?.attributeName && this.node[1]?.bd?.attributeValueExample) {
            attributes[this.node[1]?.bd?.attributeName] = this.node[1]?.bd?.attributeValueExample.replace(/(\r\n|\r|\n)/g, '<br>');
        }
        return attributes;
    }

    getBlockAttibuteDefinitions({recursively}) {
        const attributes = {};
        if (this.node[1]?.bd?.attributeName) {
            attributes[this.node[1]?.bd?.attributeName] = {
                type: 'string'
            }
        }
        return attributes;
    }

    resolveAttributeNameConflicts(reservedAttributeNames)
    {
        if (this.node?.[1]?.bd?.attributeName && reservedAttributeNames[this.node?.[1]?.bd?.attributeName] === undefined) {
            reservedAttributeNames[this.node[1].bd.attributeName] = true;
            return;
        }

        let number = '';
        if (reservedAttributeNames.authorrichtext !== undefined) {
            for (number = 2; reservedAttributeNames['authorrichtext' + number] !== undefined; number++);
        }

        if (!this.node[1].bd) this.node[1].bd = {};
        this.node[1].bd.attributeName = 'authorrichtext' + number;
        reservedAttributeNames['authorrichtext' + number] = true;
    }

    renderBlockEdit({props}) {
        const {attributes, setAttributes} = props;

        const attributeName = this.node[1]?.bd?.attributeName || null;
        const attributeValue = attributeName ? attributes?.[attributeName] : '';
        const attributeValuePlaceholder = this.node[1]?.bd?.attributeValuePlaceholder || null;

        return wp.element.createElement(wp.blockEditor.RichText,
            {
                value: attributeValue,
                ...(attributeValuePlaceholder ? {placeholder: attributeValuePlaceholder} : {}),
                onChange: (newValue) => {
                    const obj = {};
                    obj[attributeName] = newValue;
                    setAttributes( obj )
                }
            }
        );
    }
});
