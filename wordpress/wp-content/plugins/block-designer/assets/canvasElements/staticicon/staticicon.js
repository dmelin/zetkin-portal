
bd.helper.registerCanvasElement(class staticicon extends bd.CanvasElementPrototype {

    name = wp.i18n.__('Icon', 'block-designer')
    icon = 'dashicons-star-filled'
    description = wp.i18n.__('Static icon that can only be changed by admins here in the Block Designer.', 'block-designer')
    color = null
    authorInput = false
    allowChildren = false
    allowRoot = false
    allowMultiple = true
    initialContent = ['bd-staticicon',{bd:{icon: 'star-filled'}}]
    
    supportsHTMLTagName = false
    supportsHTMLAttributes = true
    supportsCSSStyle = true
    supportsCSSStyleObjectFit = false
    rendersOnlyText = false

    constructor(node) {
        super(node);
        this.node = node;

        if (this.node?.[1]?.bd?.icon) {
            this.icon = 'dashicons-' + this.node[1].bd.icon;
        }
    }

    renderDesignerCanvas({canvasElementAttributes}) {
        const { ...attr } = this.node[1];
        delete attr.bd;
        const className = [(attr.class || ''), (attr.className || ''), ...(attr.classes || [])]?.join(' ').replace(/\s+/, ' ').trim();
        if (className !== '') {
            attr.className = className;
        }
        delete attr.classes;
        delete attr.style;

        const icon = this.node[1]?.bd?.icon || 'smiley';
        const size = this.node[1]?.bd?.size || 20;
        return React.createElement('svg',
            {
                ...attr || {},
                viewBox: '0 0 20 20',
                ...canvasElementAttributes,
            }, React.createElement('path',
                {
                    fill: 'currentColor',
                    d: (window.BDData || window.BDEditorData).dashicons[icon]
                }
            )
            
        );
    }

    renderDesignerElementPanel({props}) {
        return [
            wp.element.createElement(wp.components.PanelBody,
                null,
                React.createElement(bd.app.components.AppIconControl,
                    {
                        label: wp.i18n.__('Icon', 'block-designer'),
                        value: this.node[1]?.bd?.icon || '',
                        allowEmpty: false,
                        onChange: (newValue) => {
                            lodash.set(this, 'node[1].bd.icon', newValue);
                            this.icon = 'dashicons-' + newValue;
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
