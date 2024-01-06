
bd.helper.registerCanvasElement(class htmlelement extends bd.CanvasElementPrototype {

    name = wp.i18n.__('HTML Element', 'block-designer')
    icon = 'code-tags'
    description = wp.i18n.__('Static HTML element to structure and design your block.', 'block-designer')
    color = null
    authorInput = false
    allowChildren
    allowRoot = true
    allowMultiple = true
    initialContent = ['div',{}]

    supportsHTMLTagName = true
    supportsHTMLAttributes = true
    supportsCSSStyle = true
    rendersOnlyText = false

    constructor(node) {
        super(node);
        this.node = node;

        if (this.node?.[0]) {
            this.name = this.node[0].toUpperCase();//'<' + this.node[0] + '>';
            this.allowChildren = document.createElement(this.node[0]).outerHTML.indexOf('</') > -1;
        }
    }

    renderDesignerCanvas({canvasElementAttributes, props, renderChildren}) {
        const [,,...children] = this.node;
        
        const { ...attr } = this.node[1];
        const className = [(attr.class || ''), (attr.className || ''), ...(attr.classes || [])]?.join(' ').replace(/\s+/, ' ').trim();
        if (className !== '') {
            attr.className = className;
        }
        delete attr.classes;
        delete attr.style;

        return React.createElement(this.node[0],
            {
                ...attr || {},
                ...canvasElementAttributes
            },
            this.allowChildren ? renderChildren(children) : null
        );
    }

    renderBlockEdit({renderChildren}) {
        return this.renderDesignerCanvas({
            renderChildren: renderChildren
        })
    }
});
