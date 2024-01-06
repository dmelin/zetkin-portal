import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, RichText, MediaUpload, InnerBlocks } from '@wordpress/block-editor';

registerBlockType('gutenreact/webkul-cards', {
    title: 'Multiple Choice',
    icon: 'columns',
    category: 'Zetkin Tests',
    attributes: {
        content: {
            type: 'string',
            source: 'html',
            selector: 'p',
        },
        description: {
            type: 'string',
            source: 'html',
            selector: 'p',
        },
        imgUrl: {
            type: 'string',
        },
    },
    edit: (props) => {
        const {
            attributes: { content, description, imgUrl },
            setAttributes,
        } = props;
        const blockProps = useBlockProps();
        const onChangeContent = (newContent) => {
            setAttributes({ content: newContent });
        };
        const onChangeDescription = (newDescription) => {
            setAttributes({ description: newDescription });
        };
        const onImageSelect = (newImgUrl) => {
            setAttributes({ imgUrl: newImgUrl.sizes.full.url });
        };
        const ALLOWED_BLOCKS = ['core/buttons'];
        return (
            <div className='webkul-card'>
                <MediaUpload onSelect={onImageSelect}
                    render={
                        ({ open }) => {
                            return imgUrl ? <img onClick={open} src={imgUrl} /> : <button onClick={open}> Upload Image </button>
                        }
                    }
                    title="Insert Image"
                />
                <RichText {...blockProps}
                    tagName='h3'
                    onChange={onChangeContent}
                    placeholder='title'
                    value={content} />
                <RichText {...blockProps}
                    tagName='p'
                    onChange={onChangeDescription}
                    placeholder='Short description'
                    value={description} />
                <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} />
            </div>
        )

    },
    save: (props) => {
        const blockProps = useBlockProps.save();
        return (
            <div className='webkul-card'>
                <img src={props.attributes.imgUrl} />
                <RichText.Content {...blockProps}
                    tagName='h3'
                    value={props.attributes.content} />
                <RichText.Content {...blockProps}
                    tagName='p'
                    value={props.attributes.description} />
                <InnerBlocks.Content />
            </div>
        )
    }
});