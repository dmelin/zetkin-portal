
bd.helper.registerAppComponent(function AppContainer() {
    //const { SearchControl, Spinner } = wp.components;
    const { useState, render } = wp.element;
    const { useSelect } = wp.data;
    const coreDataStore = wp.coreData.store;
    const { decodeEntities } = wp.htmlEntities;
    const props = {};


    const [ unsavedBlocks, setUnsavedBlocks ] = useState( [] );

    //const [ searchTerm, setSearchTerm ] = useState( '' );
    const { blocks, hasResolved } = useSelect(
        ( select ) => {
            const query = {
                per_page: -1,
                status: 'any'
            };
            const selectorArgs = [ 'postType', 'bd_block', query ];
            return {
                blocks: select( coreDataStore ).getEntityRecords(
                    ...selectorArgs
                ),
                hasResolved: select( coreDataStore ).hasFinishedResolution(
                    'getEntityRecords',
                    selectorArgs
                ),
            };
        }/* ,
        [ searchTerm ] */
    );
    props.blocks = blocks;
    bd.blocksHasResolved = hasResolved;



    if (props.blocks) {
        props.blocks.map((block) => {
            bd.helper.settleBlock(block);
        });
    }



    

    props.appForceRepaint = bd.helper.useForceRepaint();

    


    function getBlockTemplate() {
        const result = Object.assign({}, {title:'',status:'draft',content:'{"version":2,"payload":{"styles":[]}}'});
        bd.helper.settleBlock(result);
        return result;
    }
    // edit functionality
    (function() {
        /* const newBlockTemplate = {title:'',status:'draft',content:'{}'};
        bd.helper.settleBlock(newBlockTemplate); */
        const [ editBlockId, setEditBlockId ] = useState( null );
        const [ newBlock, editNewBlock ] = useState( getBlockTemplate() );
        const isEditBlockNew = editBlockId === true ? true : (editBlockId > 0 ? false : null);
        const isEditBlockOld = editBlockId === true ? false : (editBlockId > 0 ? true : null);
        props.setEditBlockId = setEditBlockId;
        //console.log('NEW?', isEditBlockNew, newBlock);
        //console.log('editBlockId',editBlockId);
        //const blockId = editBlockId;//props.app.blockId;
        //const coreDataStore = wp.coreData.store;
        const selectBlockResult = wp.data.useSelect(
            ( select ) => {
                const blockId = isEditBlockOld ? editBlockId : null;
//console.log('SELECT', blockId);
                // existing 
                const block = select( coreDataStore ).getEditedEntityRecord( 'postType', 'bd_block', blockId );
                bd.helper.settleBlock(block);
                return {
                    block: block,
                    //blockContent: block?.contentObject || null,
                    lastError: select( coreDataStore ).getLastEntitySaveError( 'postType', 'bd_block', blockId ),
                    isSaving: select( coreDataStore ).isSavingEntityRecord( 'postType', 'bd_block', blockId ),
                    hasEdits: select( coreDataStore ).hasEditsForEntityRecord( 'postType', 'bd_block', blockId ),
                };
            },
            [ editBlockId ]
        );
        const newBlockResult = (() => {
            bd.helper.settleBlock(newBlock);
            /* const blockContent = newBlock.content ? JSON.parse(newBlock.content) : null;
            if (blockContent && 'domtree' in blockContent) {
                bd.helper.initializeBlockDOMTree(blockContent.domtree);
            } */
            return Object.assign({
                block: newBlock,
                //blockContent: blockContent,
                hasEdits: JSON.stringify(newBlock) !== JSON.stringify(getBlockTemplate())
            }, wp.data.useSelect(
                ( select ) => ({
                    lastError: select( coreDataStore ).getLastEntitySaveError( 'postType', 'bd_block' ),
                    isSaving: select( coreDataStore ).isSavingEntityRecord( 'postType', 'bd_block' )
                }),
                []
            ));
        })();
        const { block, /* blockContent,  */lastError, isSaving, hasEdits } = isEditBlockOld ? selectBlockResult : newBlockResult;
        //console.log('BLOCK', block);
        //console.log('HERE IS THE BLOCK CONTENT', blockContent);
        //const blockContent = block.content ? JSON.parse(block.content) : {};
        if (hasEdits) {
            if (unsavedBlocks.indexOf(editBlockId) === -1 && editBlockId !== null) {
                setUnsavedBlocks((oldUnsavedBlocks) => {
                    oldUnsavedBlocks.push(editBlockId);
                    return oldUnsavedBlocks;
                });
            }
        } else {
            if (unsavedBlocks.indexOf(editBlockId) > -1) {
                setUnsavedBlocks((oldUnsavedBlocks) => {
                    oldUnsavedBlocks.splice(unsavedBlocks.indexOf(editBlockId), 1);
                    return oldUnsavedBlocks;
                });
            }
        }
        props.unsavedBlocks = unsavedBlocks;
        //console.log(unsavedBlocks);
        
        const { saveEntityRecord, saveEditedEntityRecord, editEntityRecord } = wp.data.useDispatch( coreDataStore );
        const handleSave = async () => {
            const savedRecord = typeof editBlockId === 'number'
                ? await saveEditedEntityRecord( 'postType', 'bd_block', editBlockId )
                : await saveEntityRecord( 'postType', 'bd_block', newBlock);

            if ( savedRecord && editBlockId === true ) {
                delete bd.blocks[undefined];
                editNewBlock(getBlockTemplate());
                setEditBlockId(savedRecord.id);
                //console.log('SAVED', savedRecord);
                //onSaveFinished(); // close Modal
            }
        };
        const handleChange = ( data ) => {
            if (data && data.content) {
                console.error('Don\'t set "content" directly. Change block.contentObject instead and then call the handleChange() without any arguments.');
                return;
            }

            // remove empty parameters from block.contentObject
            for (let parameter in block.contentObject) {
                if (!block.contentObject[parameter]) {
                    delete(block.contentObject[parameter]);
                }
            }
            // stringify block.contentObject
            const content = JSON.stringify(block.contentObject);
            // check if content has changed
            if (content !== block.content) {
                // if content has changed, assign it to changed data object
                data = data !== undefined ? data : {};
                data.content = content;
            }

            // Cancle if nothing changed
            if (data === undefined) {
                return;
            }


            if (typeof editBlockId === 'number') {
                editEntityRecord( 'postType', 'bd_block', block.id, data );
            } else {
                //console.log('SET DATA', Object.assign({}, newBlock, data));
                editNewBlock(Object.assign({}, newBlock, data));
            }
        };
        const { deleteEntityRecord } = wp.data.useDispatch( coreDataStore );
        const handleDelete = (blockId) => {
            if (blockId !== editBlockId) return;
            deleteEntityRecord('postType', 'bd_block', blockId, {
                force: true
            });
            setEditBlockId(null);
        }
        if (editBlockId !== null) {
            props.edit = {
                handleSave,
                handleChange,
                handleDelete,
                block,
                //blockId: editBlockId,
                blockContent: block.contentObject,
                storedBlock: props.blocks?.filter((b) => b.id && block.id && b.id === block.id)?.[0] || null,
                lastError,
                isSaving,
                hasEdits
            };
        }
    })();


//console.log(bd.app.components.App);
    //return React.createElement('div', {style:{border:'#f00 solid 10px'}});
    return React.createElement(bd.app.components.App, props);
});
