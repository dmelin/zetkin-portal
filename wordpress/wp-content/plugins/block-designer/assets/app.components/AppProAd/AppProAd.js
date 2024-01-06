
bd.helper.registerAppComponent(class AppProAd extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: null
        };

        this.data = JSON.parse(localStorage.getItem('bdAppProAd')) || {done:{},closed:0};

        const now = (new Date()).getTime();
        const second = 1000;
        const day = 1000 * 60 * 60 * 24;
        const month = 1000 * 60 * 60 * 24 * 30;

        this.notOnCurrentSession = false;
        this.interval = null;

        // Don't show ad if already done with current user email
        if (BDData.currentUserEmail && this.data?.done?.[btoa(BDData.currentUserEmail)]) {
            this.notOnCurrentSession = true;
        }

        // Don't show ad if already done with any other email and last close is less than 3 months ago
        else if (Object.keys(this.data.done).length > 0) {
            if (this.data.closed + (month * 3) > now) {
                this.notOnCurrentSession = true;
            }
        }

        // Don't show ad if closed within a random number (min 0.5, max 5) of days
        else if (this.data.closed + this.getRandFromToInclusive(.5 * day, 5 * day) > now) {
            this.notOnCurrentSession = true;
        }

        if (this.notOnCurrentSession === false) {

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
        this.data.closed = 0;
        localStorage.setItem('bdAppProAd', JSON.stringify(this.data));
        this.setState({open:true});
    }

    onClose() {
        this.data.closed = (new Date()).getTime();
        localStorage.setItem('bdAppProAd', JSON.stringify(this.data));
        this.setState({open:false});
    }

    onSubmit() {
        const input = document.querySelector('.AppProAd #mce-EMAIL');
        this.data.done[btoa(input.value)] = (new Date()).getTime();
        localStorage.setItem('bdAppProAd', JSON.stringify(this.data));
        this.onClose();
        setTimeout(() => {
            input.value = '';
        }, 0);
        return true;
    }

    render() {
        // Return nothing if we don't need the ad in this session
        if (this.notOnCurrentSession === true) {
            return '';
        }

        return React.createElement('div',
            {
                className: 'AppProAd ' + (this.state.open === true ? 'open' : (this.state.open === false ? 'close' : ''))
            },
            React.createElement('div',
                {
                    className: 'AppProAd--inner'
                },
                React.createElement('div',
                    {},
                    React.createElement('h2', { className: 'AppProAd--h2' }, 'BlockDesigner.Pro'),
                    React.createElement('div', { className: 'AppProAd--coming-soon' }, '… is coming soon!')
                ),
                React.createElement('div',
                    {
                        style: {
                            
                        }
                    },
                    React.createElement('div',
                        {
                            style: {
                                marginBottom: '.5rem'
                            }
                        },
                        //'Enter your email to be notified …',
                        'Let us know if you want to be notified …'
                    ),
                    /* wp.element.createElement(wp.components.Button,
                        {
                            variant: 'secondary',
                            onClick: () => {}
                        },
                        'remind me later'
                    ), */
                    React.createElement('div',
                        {
                            id: 'mc_embed_signup'
                        },
                        React.createElement('form',
                            {
                                action: 'https://ehtmlu.us8.list-manage.com/subscribe/post?u=9931a72f6302e128cd4702574&amp;id=cee790d397',
                                method: 'post',
                                id: 'mc-embedded-subscribe-form',
                                name: 'mc-embedded-subscribe-form',
                                className: 'validate',
                                target: '_blank',
                                onSubmit: () => { this.onSubmit(); }
                            },
                            React.createElement(bd.components.Html,
                                null,
                                `
                                <style type="text/css">
                                    .mc-submitbutton {
                                        background-color: #f96a06;
                                        color: #fff;
                                        border: 0;
                                        border-radius: 4px;
                                        padding: 1px calc(1.333em + 2px);
                                        line-height: 2rem;
                                        /* font-size: var(--wp--preset--font-size--medium); */
                                        cursor: pointer;
                                        /* font-size: 1rem; */
        
                                        transition: transform .15s, box-shadow .15s;
                                        text-shadow: 0 0 .4em rgb(0 0 0 / 50%);
                                        letter-spacing: .05em;
        
                                        box-shadow: 0em 0em 0em rgb(0 0 0 / 50%);
                                    }
                                    .mc-submitbutton:hover,
                                    .mc-submitbutton:focus-visible {
                                        transform: scale(1.05);
                                        box-shadow: .5em .5em 1em rgb(0 0 0 / 50%);
                                    }
                                    .mc-submitbutton:hover:active {
                                        transform: scale(1.025);
                                        box-shadow: .25em .25em .5em rgb(0 0 0 / 50%);
                                    }
                                    .mc-email-input {
                                        border: 0;
                                        border-radius: 4px;
                                        /* width: 100%; */
                                        padding: 0 .5em;
                                        line-height: 2.5em;
                                        font-size: 1rem;
                                    }
                                    #mc_embed_signup div.mce_inline_error {
                                        margin: .5rem 0 0 0;
                                        padding: 0;
                                        background-color: transparent;
                                        font-weight: bold;
                                        z-index: 1;
                                        color: #fff;
                                    }
                                    #mc_embed_signup input.mce_inline_error {
                                        border: 0;
                                    }
                                </style>
                                <!-- Begin Mailchimp Signup Form -->
                                <div id="mc_embed_signup_scroll">
                                    <div class="mc-field-group">
                                        <input type="email" value="${BDData.currentUserEmail}" name="EMAIL" class="required email mc-email-input" id="mce-EMAIL" required="required" />

                                        <div hidden="true"><input type="hidden" name="tags" value="4873411,4874191"></div>

                                        <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                                        <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_9931a72f6302e128cd4702574_cee790d397" tabindex="-1" value=""></div>

                                        <button type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="mc-submitbutton">notify me!</button>
                                    </div>
                                    <div id="mce-responses" class="clear">
                                        <div class="response" id="mce-error-response" style="display:none"></div>
                                        <div class="response" id="mce-success-response" style="display:none"></div>
                                    </div>
                                </div>
                                <!--End mc_embed_signup-->`
                            )
                        )
                    )
                ),
                React.createElement('button',
                    {
                        className: 'AppProAd--close',
                        onClick: () => {
                            this.onClose();
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
        );
    }
});
