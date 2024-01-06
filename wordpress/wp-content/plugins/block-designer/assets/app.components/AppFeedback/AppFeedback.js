
bd.helper.registerAppComponent(class AppFeedback extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: null
        };

        this.data = JSON.parse(localStorage.getItem('bdAppFeedback')) || {done:0,rememberLater:0,closedForever:0};

        const now = (new Date()).getTime();
        const second = 1000;
        const day = 1000 * 60 * 60 * 24;
        const month = 1000 * 60 * 60 * 24 * 30;

        this.notOnCurrentSession = false;
        this.interval = null;

        // Don't show if closed forever
        if (this.data.closedForever > 0) {
            this.notOnCurrentSession = true;
        }

        // Don't show if closed within a random number (min 0.5, max 5) of days
        else if (this.data.rememberLater + this.getRandFromToInclusive(.5 * day, 5 * day) > now) {
            this.notOnCurrentSession = true;
        }

        if (this.notOnCurrentSession === false && this.data.done === 0) {

            // Check in a random interval if already saved blocks exist and if yes, open the ad and clear the interval
            this.interval = setInterval(() => {
                if (bd.helper.getBlocksCount() > 0) {
                    clearInterval(this.interval);
                    this.onOpen();
                }
            }, this.getRandFromToInclusive(10 * second, 60 * second));
        }
    }

    getRandFromToInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    onOpen() {
        this.data.done = 0;
        this.data.rememberLater = 0;
        localStorage.setItem('bdAppFeedback', JSON.stringify(this.data));
        this.setState({open:true});
    }

    onCloseForever() {
        if (confirm('Really miss the 50% voucher?')) {
            this.data.closedForever = (new Date()).getTime();
            localStorage.setItem('bdAppFeedback', JSON.stringify(this.data));
            this.setState({open:false});
        }
    }

    onClose() {
        this.data.rememberLater = (new Date()).getTime();
        localStorage.setItem('bdAppFeedback', JSON.stringify(this.data));
        this.setState({open:false});
    }

    onCloseOnThisSessionOnly() {
        this.setState({open:false});
    }

    onSendFeedback() {
        this.data.done = (new Date()).getTime();
        localStorage.setItem('bdAppFeedback', JSON.stringify(this.data));
        this.setState({open:false});

        const m = atob('ZWh0bWx1QGdtYWlsLmNvbQ==');
        
        const iframe = document.createElement('iframe');
        iframe.style = 'position: absolute; left: -300vw; width: 10px; height: 10px; ';
        document.body.appendChild(iframe);
        iframe.contentWindow.location.href = 'mailto:' + m + '?subject=' + encodeURIComponent('Block Designer - feedback');
        //location.href = 'mailto:' + m + '?subject=' + encodeURIComponent('Block Designer - feedback');
    }

    render() {
        if (this.notOnCurrentSession && this.data.closedForever > 0) {
            return '';
        }

        return [
            React.createElement('div',
                {
                    className: 'AppFeedback AppFeedback--more-feedback ' + (this.data.closedForever === 0 && (this.data.done > 0/*  || this.data.rememberLater > 0 */ /* || this.state.open === false */) ? 'open' : (this.state.open !== null ? 'close' : ''))
                },
                wp.element.createElement(wp.components.Button,
                    {
                        variant: 'primary',
                        onClick: () => {
                            this.onOpen();
                        }
                    },
                    //'feedback'
                    wp.i18n.__('Survey', 'block-designer')
                )
            ),
            React.createElement('div',
                {
                    className: 'AppFeedback AppFeedback--outer ' + (this.data.closedForever === 0 && this.state.open === true ? 'open' : (this.state.open === false ? 'close' : ''))
                },
                React.createElement('div',
                    {
                        className: 'AppFeedback--inner'
                    },
                    React.createElement('div', {className: 'AppFeedback--face'}),
                    React.createElement('div',
                        {},
                        React.createElement('h2', { className: 'AppFeedback--h2' }, wp.i18n.__('Well done!', 'block-designer')),
                        React.createElement('p',
                            {
                                style: {
                                    maxWidth: '60ch',
                                    marginBottom: '1em'
                                }
                            },
                            wp.i18n.__('Thank you for trying Block Designer! Let me know what you think so I can improve Block Designer for you!', 'block-designer')
                        ),
                        React.createElement('div',
                            {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '1rem',
                                    marginTop: '2rem',
                                    alignItems: 'center'
                                }
                            },
                            wp.element.createElement(wp.components.Button,
                                {
                                    variant: 'secondary',
                                    onClick: () => {
                                        this.onClose();
                                    }
                                },
                                wp.i18n.__('remind me later', 'block-designer')
                            ),
                            wp.element.createElement(wp.components.Button,
                                {
                                    href: 'https://docs.google.com/forms/d/e/1FAIpQLSdp3UlCTXLFl5mF-ApF7-RHGGE6CCneIeHT2-soeWS5BnoBPA/viewform?hl=en',
                                    variant: 'primary',
                                    target: '_blank',
                                    onClick: () => {
                                        this.data.done = (new Date()).getTime();
                                        localStorage.setItem('bdAppFeedback', JSON.stringify(this.data));
                                        this.setState({open:false});
                                    },
                                    style: {
                                        flexDirection: 'column',
                                        height: 'auto',
                                        padding: '0.5rem 1rem'
                                    }
                                },
                                React.createElement('strong', {style:{fontSize:'1rem'}}, wp.i18n.__('go to anonymous survey', 'block-designer')),
                                //React.createElement('br'),
                                React.createElement('small', null, wp.i18n.__('click here', 'block-designer'))
                            ),
                        ),
                        /* React.createElement('h2', { className: 'AppFeedback--h2' }, 'Hey, thank you for using Block Designer!'),
                        React.createElement('p',
                            null,
                            'Please let me know how you like it and what I can do better.',
                            React.createElement('br'),
                            'As a thank you, you will receive a 50% voucher for the upcoming Pro version 😉',
                        ),
                        React.createElement('p', null, 'Kind regards, Helmut'),
                        React.createElement('div',
                            {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '1rem',
                                    marginTop: '2rem'
                                }
                            },
                            wp.element.createElement(wp.components.Button,
                                {
                                    variant: 'tertiary',
                                    onClick: () => {
                                        this.onCloseForever();
                                    }
                                },
                                'never show again'
                            ),
                            wp.element.createElement(wp.components.Button,
                                {
                                    variant: 'secondary',
                                    onClick: () => {
                                        this.onClose();
                                    }
                                },
                                'remind me later'
                            ),
                            wp.element.createElement(wp.components.Button,
                                {
                                    variant: 'primary',
                                    onClick: () => {
                                        this.onSendFeedback();
                                    }
                                },
                                'send feedback'
                            )
                        ) */
                    ),
                    React.createElement('button',
                        {
                            className: 'AppFeedback--close',
                            title: wp.i18n.__('Close for now', 'block-designer'),
                            onClick: () => {
                                this.onCloseOnThisSessionOnly();
                            }
                        },
                        React.createElement(bd.components.Icon,
                            {
                                icon: 'close',
                                size: 15
                            }
                        )
                    )
                )
            )
        ];
    }
});
