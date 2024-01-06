
bd.helper.registerComponent(class Html extends React.Component {
    constructor(props) {
        super(props);
    }

    getObjectFromStyle(CSSStyleDeclarationObject) {
        const obj = CSSStyleDeclarationObject;
        const styles = {};
        let index = 0;
        while (obj[index]) {
            styles[obj[index]] = obj[obj[index]];
            index++;
        }
        return styles;
    }

    getAttributesAsObject(elementNode) {
        const attributes = elementNode.getAttributeNames().reduce((acc, name) => {
            return {...acc, [name]: elementNode.getAttribute(name)};
        }, {});

        if (attributes.style) {
            attributes.style = this.getObjectFromStyle(elementNode.style);
        }

        return attributes;
    }

    convertDOMtoReact(domNode) {
        switch (domNode.nodeType) {
            case Node.TEXT_NODE:
                return domNode.nodeValue;
            case Node.ELEMENT_NODE:
                return React.createElement(
                    domNode.nodeName,
                    this.getAttributesAsObject(domNode),
                    Array.prototype.slice.call(domNode.childNodes).map((childNode) => {
                        return this.convertDOMtoReact(childNode);
                    })
                );
        }
        return null;
    }

    render() {
        const children = !Array.isArray(this.props.children) ? [this.props.children] : this.props.children;
        const domNode = document.createElement('div');
        domNode.innerHTML = children.map((child) => { return ['string', 'number'].indexOf(typeof child) > -1 ? child : ''}).join('');
        const reactNode = this.convertDOMtoReact(domNode);
        return reactNode.props.children;
    }
});
