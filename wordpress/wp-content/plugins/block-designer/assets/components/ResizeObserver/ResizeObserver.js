
bd.helper.registerComponent(class ResizeObserver extends React.Component {
    constructor(props) {
        super(props);

        this.defaultRef = React.createRef();
    }

    componentDidMount() {
        const doc = this.props.children.ref?.current?.ownerDocument;
        if (doc) {
            window.bd_observeDocument(doc);
        }
    }

    componentWillUnmount() {
        const doc = this.props.children.ref?.current?.ownerDocument;
        if (doc) {
            window.bd_observeDocument(doc, true);
        }
    }

    render() {
        this.props.children.ref = this.props.children?.ref || this.defaultRef;
        return this.props.children;
    }
});
