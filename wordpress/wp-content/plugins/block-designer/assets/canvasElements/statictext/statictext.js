
bd.helper.registerCanvasElement(class statictext extends bd.CanvasElementPrototype {

    name = wp.i18n.__('Static Text', 'block-designer')
    icon = 'format-text'
    description = wp.i18n.__('Static text that can only be changed by admins here in the Block Designer.', 'block-designer')
    color = null
    authorInput = false
    allowChildren = false
    allowRoot = false
    allowMultiple = true
    initialContent = ['bd-statictext',{}]
    
    supportsHTMLTagName = false
    supportsHTMLAttributes = false
    supportsCSSStyle = false
    rendersOnlyText = true

    constructor(node) {
        super(node);
        this.node = node;
    }

    renderDesignerCanvas({canvasElementAttributes}) {
        const nodeValue = React.createElement('span', {...canvasElementAttributes}, this.node[1]?.nodeValue ? this.node[1].nodeValue.split(/(\r\n|\r|\n)/g).map((text, index) => { return index % 2 ? React.createElement('br') : text; }) : null);
        return nodeValue;
    }

    renderDesignerElementPanel({props}) {
        return [
            wp.element.createElement(wp.components.PanelBody,
                null,
                wp.element.createElement(wp.components.TextareaControl,
                    {
                        label: wp.i18n.__('Text', 'block-designer'),
                        value: this.node[1]?.nodeValue || '',
                        onChange: (newValue) => {
                            this.node[1].nodeValue = newValue;
                            props.edit.handleChange();
                        }
                    }
                )
            )
        ];
    }

    renderBlockEdit() {
        return this.renderDesignerCanvas({})
    }
});
