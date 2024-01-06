
bd.helper.registerCanvasElement(class authorimage extends bd.CanvasElementPrototype {

    name = wp.i18n.__('Author Image', 'block-designer')
    icon = 'image'
    description = wp.i18n.__('Allows authors in the WordPress Block Editor to add an individual image.', 'block-designer')
    color = '#8a61ff'
    authorInput = true
    allowChildren = false
    allowRoot = false
    allowMultiple = true
    initialContent = ['bd-authorimage',{}]
    
    supportsHTMLTagName = false
    supportsHTMLAttributes = true
    supportsCSSStyle = true
    supportsCSSStyleObjectFit = true
    rendersOnlyText = false

    constructor(node) {
        super(node);
        this.node = node;
        
        this.imageElement = React.createRef();
    }

    _getPlaceholderSrc(backgroundColor) {
        const {backColor, iconColor} = (() => {
            const match = backgroundColor.match(/^rgba?\(([0-9]+),\s*([0-9]+),\s*([0-9]+)(?:,\s*([0-9\.]+))?\)$/);

            if (!match) return {
                backColor: 'rgba(255, 255, 255, .5)',
                iconColor: 'rgba(0, 0, 0, .5)'
            };

            const rgbIntArray = match.slice(1, 4).map((x) => parseInt(x));
            // Get the highest and lowest out of red green and blue
            const highest = Math.max(...rgbIntArray);
            const lowest = Math.min(...rgbIntArray);
            // Return the average divided by 255
            const lightness = (highest + lowest) / 2 / 255;
            const alphaMin = .5;
            const alpha = alphaMin + ((1 - parseFloat(match[4] !== undefined ? match[4] : 1)) * (1 - alphaMin));
            return {
                backColor: 'transparent',//'rgba(' + (lightness < .5 ? [0, 0, 0, alpha] : [255, 255, 255, alpha]).join(', ') + ')',
                iconColor: 'rgba(' + (lightness < .5 ? [255, 255, 255, alpha] : [0, 0, 0, alpha]).join(', ') + ')'
            };
        })();

        return 'data:image/svg+xml;base64,' + encodeURIComponent(btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="-10 -10 44 44" style="background-color: ' + backColor + '; box-shadow: inset 0 0 0 3px ' + iconColor + '; "><path fill="' + iconColor + '" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" /></svg>'));
    }

    _getPlaceholderStyle() {
        const style1 = Object.assign(document.createElement('div').style, {
            minWidth: '100px',
            minHeight: '100px',
        });
        const style2 = document.createElement('div').style;
        style2.cssText = this.node[1].style || '';
        return Object.assign(style1, bd.helper.getObjectFromStyle(style2));
    }

    _renderImageComponent({mediaId, generalProps, imageProps, placeholderProps, that}) {
        const media = wp.data.useSelect((select) => {
            return select('core').getMedia(mediaId);
        });

        const isImageSet = mediaId > 0;
        const isImageLoaded = isImageSet && media !== undefined;

        // If image is loading
        /* if (isImageSet && !isImageLoaded)
        {
            return React.createElement('div',
                {
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                },
                wp.element.createElement(wp.components.Spinner,
                    {
                        style: {
                            width: '20px',
                            height: '20px'
                        }
                    }
                )
            );
        } */
        const props = isImageLoaded ? {
            ...generalProps,
            ...imageProps,
            src: media.source_url
        } : {
            ...generalProps,
            ...placeholderProps
        };

        if (!isImageLoaded) {
            props.src = that._getPlaceholderSrc(props?.style?.backgroundColor || '');
        }

        return React.createElement('img', props);
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

        return React.createElement(this._renderImageComponent,
            {
                mediaId: this.node?.[1]?.bd?.attributeValueExample,
                imageProps: {
                    ...attr,
                    ...canvasElementAttributes,
                },
                placeholderProps: {
                    ...attr,
                    style: bd.helper.getObjectFromStyle(this._getPlaceholderStyle()),
                    ...canvasElementAttributes,
                },
                that: this
            }
        );
    }

    renderDesignerElementPanel({props}) {
        const { MediaUpload, MediaUploadCheck } = bd.mediaUtils;

        const exampleImageId = this.node[1]?.bd?.attributeValueExample;
        const isExampleImageSet = !!exampleImageId;

        const placeholderImageId = this.node[1]?.bd?.attributeValuePlaceholder;
        const isPlaceholderImageSet = !!placeholderImageId;

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
                wp.element.createElement('div',
                    {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem'
                        }
                    },
                    [
                        {
                            label: wp.i18n.__('Placeholder Image', 'block-designer'),
                            help: wp.i18n.__('Shown in the Block Editor when no image is set', 'block-designer'),
                            imageId: placeholderImageId,
                            isImageSet: isPlaceholderImageSet,
                            propertyName: 'attributeValuePlaceholder'
                        },
                        {
                            label: wp.i18n.__('Example Image', 'block-designer'),
                            help: wp.i18n.__('Shown as an example image in the block preview', 'block-designer'),
                            imageId: exampleImageId,
                            isImageSet: isExampleImageSet,
                            propertyName: 'attributeValueExample'
                        }
                    ].map(({label, help, imageId, isImageSet, propertyName}) => {
                        return wp.element.createElement(wp.components.BaseControl,
                            {
                                label: label,
                                help: help
                            },
                            wp.element.createElement(MediaUploadCheck,
                                {},
                                wp.element.createElement(MediaUpload,
                                    {
                                        onSelect: (media) => {
                                            if (media && media.id) {
                                                if (this.node[1].bd === undefined) {
                                                    this.node[1].bd = {};
                                                }
                                                this.node[1].bd[propertyName] = media.id;
                                                props.edit.handleChange();
                                            }
                                        },
                                        value: imageId || 0,
                                        allowedTypes: ['image'],
                                        render: ({open}) => {
                                            return wp.element.createElement('div',
                                                {
                                                    style: {
                                                        position: 'relative',
                                                        aspectRatio: '1',
                                                    }
                                                },
                                                wp.element.createElement(wp.components.Button,
                                                    {
                                                        style: {
                                                            border: 'none',
                                                            borderRadius: 0,
                                                            padding: 0,
                                                            margin: 0,
                                                            height: 'auto',
                                                            width: 'auto',
                                                            verticalAlign: 'middle'
                                                        },
                                                        showTooltip: true,
                                                        tooltipPosition: 'top',
                                                        label: isImageSet ? wp.i18n.__('Change Image', 'block-designer') : wp.i18n.__('Set Image', 'block-designer'),
                                                        onClick: open
                                                    },
                                                    React.createElement(this._renderImageComponent,
                                                        {
                                                            mediaId: imageId,
                                                            generalProps: {
                                                                style: {
                                                                    width: '100%',
                                                                    aspectRatio: '1',
                                                                    objectFit: 'contain',
                                                                    boxSizing: 'border-box',
                                                                    border: 'currentColor 1px solid',
                                                                    backgroundImage: 'url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>\')',
                                                                    backgroundSize: '16px 16px'
                                                                }
                                                            },
                                                            that: this
                                                        }
                                                    )
                                                ),
                                                isImageSet ? wp.element.createElement(wp.components.Button,
                                                    {
                                                        style: {
                                                            position: 'absolute',
                                                            right: '5px',
                                                            bottom: '5px'
                                                        },
                                                        variant: 'primary',
                                                        icon: 'trash',
                                                        showTooltip: true,
                                                        tooltipPosition: 'top',
                                                        label: wp.i18n.__('Remove Image', 'block-designer'),
                                                        onClick: () => {
                                                            delete this.node[1].bd[propertyName];
                                                            if (JSON.stringify(this.node[1].bd) === '{}') {
                                                                delete this.node[1].bd;
                                                            }
                                                            props.edit.handleChange();
                                                        }
                                                    }
                                                ) : null
                                            );
                                        }
                                    }
                                )
                            )
                        );
                    })
                )
            )
        ];
    }

    getMediaIds(blockAttributes) {
        const ids = [];
        if (this.node[1]?.bd?.attributeValuePlaceholder > 0) {
            ids.push(this.node[1].bd.attributeValuePlaceholder);
        }
        if (blockAttributes?.[this.node[1]?.bd?.attributeName] > 0) {
            ids.push(blockAttributes[this.node[1].bd.attributeName]);
        }
        return ids;
    }

    getBlockExampleAttributes() {
        const attributes = {};
        if (this.node[1]?.bd?.attributeName && this.node[1]?.bd?.attributeValueExample > 0) {
            attributes[this.node[1]?.bd?.attributeName] = this.node[1]?.bd?.attributeValueExample;
        }
        return attributes;
    }

    getBlockAttibuteDefinitions({recursively}) {
        const attributes = {};
        if (this.node[1]?.bd?.attributeName) {
            attributes[this.node[1]?.bd?.attributeName] = {
                type: 'number'
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
        if (reservedAttributeNames.authorimage !== undefined) {
            for (number = 2; reservedAttributeNames['authorimage' + number] !== undefined; number++);
        }

        if (!this.node[1].bd) this.node[1].bd = {};
        this.node[1].bd.attributeName = 'authorimage' + number;
        reservedAttributeNames['authorimage' + number] = true;
    }

    renderBlockEdit({props}) {
        const { attributes, setAttributes } = props;
        const { MediaUpload, MediaUploadCheck } = wp.blockEditor;
        const { Button, ResponsiveWrapper } = wp.components;

        const attributeName = this.node[1]?.bd?.attributeName || null;
        const attributeValue = attributeName ? attributes[attributeName] : null;
        const attributeValuePlaceholder = this.node[1]?.bd?.attributeValuePlaceholder || null;

        const removeMedia = () => {
            const obj = {};
            obj[attributeName] = 0;
            setAttributes(obj);
        }

        const onSelectMedia = (media) => {
            const obj = {};
            obj[attributeName] = media.id;
            setAttributes(obj);
        }

        return [
            wp.element.createElement(MediaUploadCheck,
                {},
                wp.element.createElement(MediaUpload,
                    {
                        onSelect: onSelectMedia,
                        value: attributeValue,
                        allowedTypes: ['image'],
                        render: ({open}) => {
                            return (() => {
                                let style, src;
                                const isImageSet = attributeValue > 0;
                                const isImageLoaded = isImageSet && props.media[attributeValue] !== undefined;
                                const isPlaceholderSet = attributeValuePlaceholder > 0;
                                const isPlaceholderLoaded = isPlaceholderSet && props.media[attributeValuePlaceholder] !== undefined;
                                if (isImageLoaded) {
                                    src = props.media[attributeValue].source_url;
                                } else if (isPlaceholderLoaded) {
                                    src = props.media[attributeValuePlaceholder].source_url;
                                } else {
                                    style = this._getPlaceholderStyle();
                                    src = this._getPlaceholderSrc(style.backgroundColor);
                                }

                                const { ...attr } = this.node[1];
                                delete attr.bd;
                                const className = [(attr.class || ''), (attr.className || ''), ...(attr.classes || [])]?.join(' ').replace(/\s+/, ' ').trim();
                                if (className !== '') {
                                    attr.className = className;
                                }
                                delete attr.classes;
                                delete attr.style;
                        
                                return wp.element.createElement(bd.components.ImageControl,
                                    {
                                        imageAttributes: {
                                            ...attr,
                                            ...(style ? {style: bd.helper.getObjectFromStyle(style)} : {}),
                                            src: src,
                                            ref: this.imageElement
                                        },
                                        overlayStyles: {
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'center'
                                        }
                                    },
                                    wp.element.createElement('div',
                                        {
                                            style: {
                                                backgroundColor: 'rgba(255, 255, 255, .7)',
                                                padding: '5px',
                                                display: 'flex',
                                                gap: '5px'
                                            }
                                        },
                                        isImageSet ? wp.element.createElement(Button,
                                            {
                                                variant: 'secondary',
                                                icon: 'trash',
                                                showTooltip: true,
                                                tooltipPosition: 'top',
                                                label: wp.i18n.__('Remove Image', 'block-designer'),
                                                onClick: removeMedia
                                            }
                                        ) : null,
                                        wp.element.createElement(Button,
                                            {
                                                variant: 'primary',
                                                icon: 'edit',
                                                showTooltip: true,
                                                tooltipPosition: 'top',
                                                label: isImageSet ? wp.i18n.__('Change Image', 'block-designer') : wp.i18n.__('Set Image', 'block-designer'),
                                                onClick: open
                                            }
                                        )
                                    )
                                );
                            })();
                        }
                    }
                )
            )
        ];


    }
});
