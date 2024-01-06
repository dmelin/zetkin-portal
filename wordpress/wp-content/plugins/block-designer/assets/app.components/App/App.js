
bd.helper.registerAppComponent(class App extends React.Component {
    constructor(props) {
        super(props);
        this.element = React.createRef();

        this.state = {
            rect: null,
            wait: false,

            proAdShow: false
        };
        this.updateRect = this.updateRect.bind(this);
        this.beforeUnloadListener = this.beforeUnloadListener.bind(this);

        this.AppProAdTimeout = null;
    }

    updateRect() {
        var rect = this.element.current.getBoundingClientRect();
        this.setState({rect: rect});
    }

    beforeUnloadListener(event) {
        if (this.props.unsavedBlocks?.length > 0) {
            event.preventDefault();
            return event.returnValue = wp.i18n.__('There are unsaved changes!\n\nAre you sure you want to exit?', 'block-designer');
        }
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.beforeUnloadListener, {capture: true});
        window.addEventListener('resize', this.updateRect);
        this.updateRect();

        this.AppProAdTimeout = setTimeout(() => {
            this.setState({proAdShow: true});
        }, 5000);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateRect);
    }

    /* onEnterEditMode(id) {
        this.setState({edit: id});
        this.props.setEditBlockId(id);
    } */

    /* onLeaveEditMode() {
        this.setState({edit: null, selectedNode: null, hoveredNode: null});
        this.props.setEditBlockId(null);
    } */

    render() {
        //console.log('RENDER APP', this.props.blocks);

        return React.createElement('div',
            Object.assign({
                ref: this.element,
                className: 'BDApp',
            }, this.state.rect === null ? {} : {
                style: Object.assign(
                    {
                        '--BDApp--rect-left': this.state.rect.left,
                        '--BDApp--rect-top': this.state.rect.top,
                        '--BDApp--rect-width': this.state.rect.width
                    },
                    this.state.wait ? {
                        pointerEvents: 'none'
                    } : {}
                )
            }),
            React.createElement('div',
                {
                    className: 'BDApp__header'
                },
                React.createElement('div',
                    {
                        className: 'BDApp__header-inner'
                    },
                    React.createElement('h1',
                        null,
                        React.createElement(bd.components.Icon, {icon:'bd-logo',size:35}),
                        ' ',
                        React.createElement('span', {style:{verticalAlign:'middle'}}, BDData.admin_page_title)
                    ),
                    !this.props.edit ? [
                        /* this.props.unsavedBlocks?.length > 0 ? wp.element.createElement(wp.components.Button,
                            {
                                variant: 'secondary',
                                onClick: (event) => { event.preventDefault(); this.props.setEditBlockId(null); }
                            },
                            React.createElement('span',
                                {
                                    style: {
                                        verticalAlign: 'middle'
                                    }
                                },
                                'Save all changed blocks'
                            ),
                            React.createElement(bd.components.Icon,
                                {
                                    icon: 'circle-medium',
                                    color: '#f60'
                                }
                            )
                        ) : null, */
                        wp.element.createElement(wp.components.Button,
                            {
                                className: 'bd--create-new-block--button',
                                variant: 'primary',
                                onClick: (event) => { event.preventDefault(); this.props.setEditBlockId(true);/*  this.onEnterEditMode(true); */ }
                            },
                            this.props.unsavedBlocks.indexOf(true) > -1 ? [
                                React.createElement('span',
                                    {
                                        style: {
                                            verticalAlign: 'middle'
                                        }
                                    },
                                    wp.i18n.__('Edit unsaved new block', 'block-designer')
                                ),
                                React.createElement(bd.components.Icon,
                                    {
                                        icon: 'circle-medium',
                                        color: '#f60'
                                    }
                                )
                            ] : wp.i18n.__('Create new block', 'block-designer')
                        )
                    ] : [
                        wp.element.createElement(wp.components.Button,
                            {
                                variant: 'secondary',
                                onClick: (event) => { event.preventDefault(); this.props.setEditBlockId(null); /* this.onLeaveEditMode(); */ }
                            },
                            wp.i18n.__('Back', 'block-designer')
                        ),
                        this.props.edit.lastError ? this.props.edit.lastError.message : '',
                        wp.element.createElement(wp.components.Button,
                            {
                                variant: 'primary',
                                disabled: !this.props.edit.hasEdits || this.props.edit.isSaving,
                                onClick: this.props.edit.handleSave,
                                isBusy: !!this.props.edit.isSaving
                            },
                            [
                                wp.i18n.__('Save', 'block-designer')/* ,
                                this.props.unsavedBlocks.indexOf(this.props.edit.block.id || true) > -1 ? React.createElement('span',
                                    {
                                        title: 'unsaved changes'
                                    },
                                    React.createElement(bd.components.Icon,
                                        {
                                            icon: 'circle-medium',
                                            color: '#f60'
                                        }
                                    )
                                ) : null */
                            ]
                        )
                    ]
                )
            ),
            React.createElement('div',
                {
                    className: 'BDApp__body'
                },
                this.props.edit ? wp.element.createElement(
                    bd.app.components.AppEdit,
                    {
                        ...this.props,
                    }
                ) : React.createElement(bd.app.components.AppOverview, this.props)
            ),
            bd.helper.getBlocksCount() === 0 ? React.createElement(bd.app.components.AppProductTour,
                {
                    style: {
                        //backgroundColor: '#ff0',
                        //border: '#f00 dotted 5px',
                        //borderRadius: '20px'
                        //padding: '1rem',
                        //backgroundColor: '#eef',

                        //border: '#f00 dotted 3px',
                        //fontSize: '1rem'
                        maxWidth: '50ch'
                    },
                    arrowWidth: 25,
                    borderWidth: 3,
                    centerArrow: true,
                    steps: [
                        {
                            condition: () => {
                                return bd.blocksHasResolved && bd.helper.getBlocksCount() === 0;
                                /* const keys = Object.keys(bd.blocks);
                                return !(keys.length > 1 || keys.length === 1 && typeof bd.blocks[undefined] === 'undefined'); */
                            },
                            selector: '.bd--create-new-block--button',
                            centerArrow: false,
                            style: {
                                borderWidth: '5px'
                                //padding: '2rem 5rem',
                                //backgroundColor: '#ffc'
                            },
                            content: [
                                React.createElement('h2',
                                    {
                                        style: {
                                            fontSize: '2rem',
                                            lineHeight: '1.4',
                                            margin: 0
                                        }
                                    },
                                    wp.i18n.__('Welcome!', 'block-designer')
                                ),
                                React.createElement('p',
                                    null,
                                    wp.i18n.__('To create your first block, click the button on the right top.', 'block-designer')
                                ),
                            ]
                        },
                        {
                            condition: () => {
                                return this.props.edit?.block && !this.props.edit?.block?.title && !this.props.edit?.blockContent?.domtree && (!this.props.edit?.block?.title || document.activeElement?.matches('.bd-edit--panel--block-title-input input'));
                            },
                            //selector: '.bd-edit--panel-tab-block-content .components-panel__body',
                            //selector: '.bd-edit--panel--block-title-input input',
                            selector: '.bd-edit--panel-tab-block-content--general',
                            content: [
                                React.createElement('h2', null, wp.i18n.__('Here you see general block settings', 'block-designer')),
                                React.createElement('hr'),
                                //React.createElement('p', null, React.createElement('strong', null, 'Set the title of your block')),
                                //React.createElement('p', null, 'Optionally, you can also set a block icon, description, and category, which will help you find the block later in the WordPress Block Editor.'),
                                React.createElement('p', null, wp.i18n.__('Set the title of your block so you can find it later.', 'block-designer')),
                            ]
                        },
                        {
                            condition: () => {
                                return this.props.edit?.block?.title && this.props.edit?.block?.status !== 'publish' && !this.props.edit?.blockContent?.domtree && !document.querySelector('.bd-edit--tools--library');
                            },
                            //selector: '.bd-edit--panel-tab-block-content .components-panel__body',
                            selector: '.bd-edit--panel--block-enable',
                            content: [
                                React.createElement('h2', null, wp.i18n.__('Enable your block', 'block-designer')),
                                React.createElement('hr'),
                                //React.createElement('p', null, React.createElement('strong', null, 'Set the title of your block')),
                                React.createElement('p', null, wp.i18n.__('Enable the block to make it available in the WordPress Block Editor.', 'block-designer')),
                            ]
                        },
                        {
                            condition: () => {
                                return this.props.edit?.block?.title && this.props.edit?.block?.status === 'publish' && !this.props.edit?.blockContent?.domtree && !document.querySelector('.bd-edit--tools--library');
                            },
                            selector: '.bd-edit--tools-header .components-button.is-primary',
                            content: [
                                React.createElement('h2', null, wp.i18n.__('Add your first element', 'block-designer')),
                                //React.createElement('hr'),
                                //React.createElement('p', null, React.createElement('strong', null, 'Set the title of your block')),
                                //React.createElement('p', null, 'Optionally, you can also set a block icon, description, and category.'),
                            ]//'Add your first element here',
                            //centerArrow: false
                        },
                        {
                            condition: () => {
                                return this.props.edit?.block?.title && !document.activeElement?.matches('.bd-edit--panel--block-title-input input') && !this.props.edit?.blockContent?.domtree && !!document.querySelector('.bd-edit--tools--library');
                            },
                            selector: '.bd-edit--tools--library',
                            content: [
                                React.createElement('h2', null, wp.i18n.__('Here you see the element library', 'block-designer')),
                                //React.createElement('hr'),
                                React.createElement('p',
                                    null,
                                    React.createElement(bd.components.Html,
                                        null,
                                        sprintf(
                                            bd.helper.escapeHtml(wp.i18n.__('Choose %s for now as it must always be the first element in a block.', 'block-designer')),
                                            wp.element.renderToString(React.createElement('strong',
                                                {
                                                    style: {
                                                        border: '1px solid #ddd',
                                                        padding: '10px',
                                                        display: 'inline-block'
                                                    }
                                                },
                                                React.createElement(bd.components.Icon, {icon: 'code-tags'}),
                                                ' ' + wp.i18n.__('HTML Element', 'block-designer')
                                            ))
                                        )
                                    )
                                ),
                                //React.createElement('p', null, 'Optionally, you can also set a block icon, description, and category.'),
                            ]//'Add your first element here',
                            //centerArrow: false
                        },
                        {
                            condition: () => {
                                return this.props.edit?.blockContent?.payload?.styles?.length === 1 && this.props.edit?.blockContent?.payload?.styles[0].style === '' && Object.keys(this.props.edit?.blockContent?.payload?.styles[0].variants).length === 0;
                            },
                            selector: '.components-tab-panel__tab-content',
                            content: [
                                React.createElement('h2', null, wp.i18n.__('Style your first element', 'block-designer')),
                                React.createElement('hr'),
                                React.createElement('p', {style:{color:'var(--wp-admin-theme-color-darker-20)'}}, React.createElement('strong', null, wp.i18n.__('We are at the end of our tour now. Have fun with designing your first block and don\'t forget to save the block before you search it in the WordPress Block Editor 😉', 'block-designer'))),
                                React.createElement('p',
                                    null,
                                    React.createElement(bd.components.Html,
                                        null,
                                        sprintf(
                                            bd.helper.escapeHtml(wp.i18n.__('A good starting point to style your first element may be the %s panel and the %s panel.', 'block-designer')),
                                            wp.element.renderToString(React.createElement('strong',
                                                {
                                                    style: {
                                                        border: '1px solid #ddd',
                                                        padding: '10px',
                                                        display: 'inline-block'
                                                    }
                                                },
                                                React.createElement(bd.components.Icon, {icon: 'arrow-expand-horizontal'}),
                                                ' ' + wp.i18n.__('Spacing', 'block-designer')
                                            )),
                                            wp.element.renderToString(React.createElement('strong',
                                                {
                                                    style: {
                                                        border: '1px solid #ddd',
                                                        padding: '10px',
                                                        display: 'inline-block'
                                                    }
                                                },
                                                React.createElement(bd.components.Icon, {icon: 'checkerboard'}),
                                                ' ' + wp.i18n.__('Background', 'block-designer')
                                            ))
                                        )
                                    )
                                )
                            ]
                        }/* ,
                        {
                            condition: () => {return true;},
                            selector: '.bd-edit--panel-tab-block-content .BDNotice',
                            content: 'Third Step'
                        } */
                    ]
                }
            ) : null,
            this.state.wait ? React.createElement('div', {className: 'BDApp__wait'}) : null,
            //React.createElement(bd.app.components.AppProAd),
            React.createElement(bd.app.components.AppFeedback),
        );
    }
});
