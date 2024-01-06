
(function() {
    'use strict';

    // Skip everything if Block Designer data is not available
    if (!BDEditorData?.blocksData) {
        return;
    }

    function mediaLoader(props) {

    }

    // Iterate over all Block Designer blocks
    for (const blockName in BDEditorData.blocksData) {
        (function(blockName, block) {

            // Skip block if title is not set
            if (!block.post_title) return;

            // Initialize block
            bd.helper.settleBlock(block);

            // Skip block if content is empty or not valid
            if (typeof block.contentObject !== 'object') return;

            // Register block
            wp.blocks.registerBlockType(blockName, {

                title: block.post_title,

                icon: block.contentObject.icon || null,

                description: block.contentObject.description || null,

                ...(block.contentObject.category ? {category: block.contentObject.category} : {}),

                supports: {
                    align: ['wide', 'full'],
                    //className: false,
                    customClassName: false
                },

                example: {
                    attributes: block.contentObject?.domtree?.handler?.getBlockExampleAttributes({recursively:true}) || {}
                },

                attributes: block.contentObject?.domtree?.handler?.getBlockAttibuteDefinitions({recursively:true}) || {},

                edit: wp.data.withSelect((select, props) => {

                    // Get all needed media IDs
                    const mediaIds = block.contentObject?.domtree?.handler?.getMediaIds(props.attributes) || [];
                    const media = {};

                    // Load media
                    const resultMedia = select('core').getMediaItems({
                        include: mediaIds.join(','),
                        per_page: -1
                    });

                    // make media easy accessible via id
                    if (resultMedia) {
                        resultMedia.forEach((mediaItem) => {
                            media[mediaItem.id] = mediaItem;
                        });
                    }

                    const itemIds = block.contentObject?.domtree?.handler?.getItemIds(props.attributes) || [];
                    const items = {};

                    // Load pages
                    const resultPages = select( wp.coreData.store ).getEntityRecords('postType', 'page', {
                        include: itemIds.filter((o) => o.type === 'page').map((o) => o.id).join(','),
                        per_page: -1,
                        status: 'any'
                    });

                    // make pages easy accessible via id
                    if (resultPages) {
                        resultPages.forEach((item) => {
                            items[item.id] = item;
                        });
                    }

                    // Load posts
                    const resultPosts = select( wp.coreData.store ).getEntityRecords('postType', 'post', {
                        include: itemIds.filter((o) => o.type === 'post').map((o) => o.id).join(','),
                        per_page: -1,
                        status: 'any'
                    });

                    // make posts easy accessible via id
                    if (resultPosts) {
                        resultPosts.forEach((item) => {
                            items[item.id] = item;
                        });
                    }

                    return { media: media, items: items };

                })((props) => {
                    var blockProps = wp.blockEditor.useBlockProps();

                    // Skip rendering if handler is not available (should actually never happen here)
                    /* if (!block.contentObject?.domtree?.handler) {
                        return null;
                    } */

                    // Function to render elements of the block
                    const renderElement = (domnode) => {
                        return domnode?.handler?.renderBlockEdit({
                            blockProps,
                            props,
                            block,
                            domnode: domnode,
                            renderChildren: (children) => {
                                return children.map(renderElement);
                            }
                        });
                    };

                    // render block
                    const result = renderElement(block.contentObject.domtree);


                    // Function to render toolbar of the block
                    const blockControls = [];
                    const renderBlockControls = (domnode) => {

                        const controls = domnode?.handler?.render_BlockEditor_BlockControls({
                            blockProps,
                            props,
                            block,
                            domnode: domnode,
                        });

                        if (controls !== null) {
                            blockControls.push(controls);
                        }

                        if (domnode?.handler?.allowChildren && domnode.length > 2) {
                            const [,,...children] = domnode;
                            children.forEach(renderBlockControls);
                        }
                    };
                    // render toolbar
                    renderBlockControls(block.contentObject.domtree);


                    // Function to render right side panels of the block
                    const inspectorControls = [];
                    const renderInspectorControls = (domnode) => {

                        const controls = domnode?.handler?.render_BlockEditor_InspectorControls({
                            blockProps,
                            props,
                            block,
                            domnode: domnode,
                        });

                        if (controls !== null) {
                            inspectorControls.push(controls);
                        }

                        if (domnode?.handler?.allowChildren && domnode.length > 2) {
                            const [,,...children] = domnode;
                            children.forEach(renderInspectorControls);
                        }
                    };
                    // render right side panels
                    renderInspectorControls(block.contentObject.domtree);


                    // Add general block classes
                    const blockClassName = 'wp-block-' + block.blockNamespace + '--- wp-block-' + block.blockFullName?.replace(/\//, '-') + ' bd-resizeobserve';
                    result.props.className = blockClassName + (result.props.className ? ' ' + result.props.className : '');

                    return [
                        // general block styles
                        React.createElement('style', null, BDEditorData.generalBlockStyles), // needed for block preview
                        
                        // block styles
                        React.createElement('style', null, bd.helper.getBlockStyle(block, { prefix: '.editor-styles-wrapper ', doubleClassName: true })),

                        // block
                        React.createElement(bd.components.ResizeObserver, null, result),

                        // toolbar buttons
                        blockControls.length > 0 ? wp.element.createElement(wp.blockEditor.BlockControls,
                            null,
                            wp.element.createElement(wp.components.ToolbarGroup,
                                null,
                                blockControls
                            )
                        ) : null,

                        // side panels
                        inspectorControls.length > 0 ? wp.element.createElement(wp.blockEditor.InspectorControls,
                            null,
                            inspectorControls
                        ) : null,
                    ];
                }),

                save: function(props) {
                    var blockProps = wp.blockEditor.useBlockProps.save();
                    
                    //return block.contentObject?.domtree?.handler?.renderBlockSave({blockProps});
                    return wp.element.createElement( wp.blockEditor.InnerBlocks.Content );

                    // The block has server side rendering, so we return null here
                    //return null;
                }
            });

        })(blockName, BDEditorData.blocksData[blockName]);
    }

})();
