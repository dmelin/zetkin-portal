
bd.helper.registerComponent(class ImageControl extends React.Component {
    constructor(props) {
        super(props);

        this.imageElement = React.createRef();

        this.state = {
            window: null,
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };

        this.updatePosition = this.updatePosition.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.updatePosition);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updatePosition);
    }

    updatePosition() {
        const image = this.imageElement?.current;
        if (!image) {
            return;
        }
        const imageRect = image.getBoundingClientRect();
        const offsetRect = image.offsetParent.getBoundingClientRect();
        const newState = {
            left: (imageRect.left - offsetRect.left) + 'px',
            top: (imageRect.top - offsetRect.top) + 'px',
            width: imageRect.width + 'px',
            height: imageRect.height + 'px'
        };
        
        const changed = this.state.left !== newState.left || this.state.top !== newState.top || this.state.width !== newState.width || this.state.height !== newState.height;
        if (changed)
        {
            this.setState(newState);
        }
    }

    render() {
        const {imageAttributes, overlayStyles} = this.props;
        this.updatePosition();

        return [
            React.createElement('img',
                Object.assign({}, imageAttributes, {ref: this.imageElement})
            ),
            React.createElement('div',
                {
                    className: 'BDImageControl--overlay',
                    style: Object.assign({
                        position: 'absolute',
                        left: this.state.left,
                        top: this.state.top,
                        width: this.state.width,
                        height: this.state.height
                    }, overlayStyles || {})
                },
                this.props.children
            )
        ];
    }
});
