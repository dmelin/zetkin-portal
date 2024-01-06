
bd.helper.registerComponent(class Notice extends React.Component {

    constructor(props) {
        super(props);
        this.status = {
            info: {
                icon: 'information',
                color: 'var(--wp-admin-theme-color)'
            },
            warning: {
                icon: 'alert',
                color: '#f0b849'
            },
            success: {
                icon: 'check-circle',
                color: '#4ab866'
            },
            error: {
                icon: 'alert-octagon',
                color: '#cc1818'
            }
        };
    }

    render() {
        const statusName = this.status[this.props.status] !== undefined ? this.props.status : 'info';
        const status = this.status[statusName];
        const isDismissible = !!this.props.isDismissible;

        return React.createElement('div',
            {
                className: 'BDNotice',
                style: Object.assign(
                    {},
                    this.props.style
                )
            },
            wp.element.createElement(wp.components.Notice,
                {
                    status: statusName,
                    isDismissible: isDismissible
                },
                React.createElement('div',
                    {
                        style: {
                            display: 'flex',
                            gap: '12px'
                        }
                    },
                    React.createElement(bd.components.Icon,
                        {
                            icon: status.icon,
                            style: {
                                color: status.color,
                                flexShrink: 0,
                                flexGrow: 0
                            }
                        }
                    ),
                    React.createElement('div',
                        {
                            style: {
                                flexGrow: 1
                            }
                        },
                        this.props.children
                    )
                )
            )
        );
    }
});
