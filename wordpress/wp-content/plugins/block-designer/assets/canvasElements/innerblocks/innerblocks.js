
bd.helper.registerCanvasElement(class innerblocks extends bd.CanvasElementPrototype {

    name = wp.i18n.__('Inner Blocks', 'block-designer')
    icon = 'plus-box'
    description = wp.i18n.__('Allows authors in the WordPress Block Editor to add other blocks in this area.', 'block-designer')
    color = '#8a61ff'
    authorInput = true
    allowChildren = false
    allowRoot = false
    allowMultiple = false
    initialContent = ['bd-innerblocks',{}]
    
    supportsHTMLTagName = false
    supportsHTMLAttributes = false
    supportsCSSStyle = false
    rendersOnlyText = false

    constructor(node) {
        super(node);
        this.node = node;
    }

    renderBlockEdit({blockProps}) {
        return wp.element.createElement( 'div', blockProps, wp.element.createElement( wp.blockEditor.InnerBlocks ) );
    }

    /* renderBlockSave({blockProps}) {
        return wp.element.createElement( 'div', blockProps, wp.element.createElement( wp.blockEditor.InnerBlocks.Content ) );
        //return wp.element.createElement( wp.blockEditor.InnerBlocks.Content );
    } */
});
