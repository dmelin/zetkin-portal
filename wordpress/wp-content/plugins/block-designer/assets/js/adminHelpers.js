
Object.entries({

    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    operatingSystem: function() {
        let os = null;
        if (navigator.platform === 'Win32' || navigator.appVersion?.indexOf('Win') != -1) os = 'Windows';
        if (navigator.platform === 'MacIntel' || navigator.appVersion?.indexOf('Mac') != -1) os = 'MacOS';
        //if (navigator.platform === '' || navigator.appVersion?.indexOf('X11') != -1) os = 'UNIX';
        if (navigator.platform === 'Linux x86_64' || navigator.appVersion?.indexOf('Linux') != -1) os = 'Linux';
        return os;
    },

    storageGet: function(path, defaultValue) {
        const data = JSON.parse(localStorage.getItem('bd')) || {};
        return typeof path === 'string' ? lodash.get(data, path, defaultValue) : data;
    },
    
    storageSet: function(path, value) {
        const data = bd.helper.storageGet();
        lodash.set(data, path, value);
        localStorage.setItem('bd', JSON.stringify(data));
    },

    //create your forceUpdate hook
    useForceRepaint: function(){
        const [value, setValue] = React.useState(0); // integer state
        return () => setValue(value => value + 1); // update state to force render
        // An function that increment 👆🏻 the previous state like here 
        // is better than directly setting `value + 1`
    },

    getBlocksCount: function() {
        const keys = Object.keys(bd.blocks);
        return typeof bd.blocks[undefined] === 'undefined' ? keys.length : keys.length - 1;
        //return !(keys.length > 1 || keys.length === 1 && typeof bd.blocks[undefined] === 'undefined');
    },


    isClass: function(param) {
        return typeof param === 'function' && param.prototype && Object.getOwnPropertyDescriptor(param, 'prototype').writable === false;
    },


    filterObject(obj, callback) {
        return Object.fromEntries(Object.entries(obj).filter(([key, val]) => callback(val, key)));
    },


    stylesSet(CSSStyleDeclarationObject, styleNames) {
        return Object.values(bd.helper.filterObject(CSSStyleDeclarationObject, (val, key) => styleNames.indexOf(key) > -1)).join('') !== '';
    },


    registerComponent: function(component, target) {
        target = target || 'bd.components';
        const className = component?.prototype?.constructor?.name;
        if (!className) {
            console.error('Can not register component: ', component);
            return;
        }
        if (typeof component !== 'function') {
            console.error('Can not register component "' + className + '". The component need to be a class or a function');
            return;
        }
        if (bd.helper.isClass(component) && !(component.prototype instanceof React.Component)) {
            console.error('Can not register component "' + className + '". The component class need to extend React.Component');
            return;
        }
        lodash.set(window, target + '.' + className, component);
    },


    registerAppComponent: function(component) {
        bd.helper.registerComponent(component, 'bd.app.components');
    },


    registerCanvasElement: function(canvasElementClass) {
        const className = canvasElementClass?.prototype?.constructor?.name;
        if (!className) {
            console.error('Can not register canvasElement: ', canvasElementClass);
            return;
        }
        if (!(canvasElementClass.prototype instanceof bd.CanvasElementPrototype)) {
            console.error('Can not register canvasElement "' + className + '". The canvasElement need to extend bd.CanvasElementPrototype');
            return;
        }
        lodash.set(window, 'bd.canvasElements.' + className, canvasElementClass);
    },


    getPathFromDomNode: function(domnode) {
        let path = domnode.parent ? [domnode.parent.indexOf(domnode)] : [];
        return (domnode.parent ? bd.helper.getPathFromDomNode(domnode.parent) : []).concat(path);
    },


    getDomNodeFromPath: function(domtree, path) {
        return Array.isArray(path) ? (path.length ? bd.helper.getDomNodeFromPath(domtree?.[path[0]], path.slice(1)) : domtree) : null;
    },


    getObjectFromStyle: function(CSSStyleDeclarationObject) {
        const obj = CSSStyleDeclarationObject;
        const styles = {};
        let index = 0;
        while (obj[index]) {
            styles[obj[index]] = obj[obj[index]];
            index++;
        }
        return styles;
    },


    getBlockStyle: function(block, options) {
        // we need doubleClassName because of default hover effects on bd-authorlink
        const { prefix = '', doubleClassName = false } = options || {};
        const cssRules = block.CSSStyleSheet.cssRules;
        return bd.helper.getCanvasDevices().map((device) => {
            const widthName = device.widthName;
            return Array.from(cssRules).map((cssRule) => {
                return cssRule.bd_device_widthName === widthName && cssRule.style.cssText !== '' ? prefix + cssRule.selectorText + (doubleClassName === true ? '.' + cssRule.bd_classId : '') + cssRule.cssText.replace(/^[^\{]*(\{.*\})[^\}]*$/, ' $1') : '';
            }).filter(r => r !== '').join("\n");
        }).filter(r => r !== '').join("\n");
    },


    getMergedStyleVariantsFromNode: function(node, {stopAtIncl = null, stopAtExcl = null}) {
        const result = document.createElement('div').style;
        for (const variant in node.CSSStyleRules) {
            if (variant === stopAtExcl) {
                break;
            }
            Object.assign(result, bd.helper.getObjectFromStyle(node.CSSStyleRules[variant].style));
            if (variant === stopAtIncl) {
                break;
            }
        }
        return result;
    },


    getCanvasDevices: function() {
        return (window.BDData || window.BDEditorData).canvasDevices;
    },


    getCurrentCanvasDevice: function() {
        const canvasDevice = bd.helper.storageGet('canvasDevice', 'desktop');
        return bd.helper.getCanvasDevices().filter(device => device.device === canvasDevice)[0];
    },


    collectStylesFromNodeTree: function(payload, node) {
        return [...payload.styles.filter((style) => {
            return !!(node[1].classes?.indexOf(style.id) > -1)
        }), ...node.slice(2).flatMap(child => bd.helper.collectStylesFromNodeTree(payload, child))];
    },


    resetIdsOfNodeTree: function(payload, node) {
        const oldId = node[1]?.classes?.[0] || null;
        const newId = bd.helper.generateBDID();
        const style = payload.styles.filter(style => style.id === oldId);
        if (oldId !== null && style.length === 1) {
            node[1].classes[0] = newId;
            style[0].id = newId;
        }
        node.slice(2).map(child => bd.helper.resetIdsOfNodeTree(payload, child));
    },


    generateBDID: function() {
        let id = '';
        while (id.length < 30) {
            id += Math.random().toString(36).substring(2);
        }
        return 'bd-' + id.substring(0, 30);
    },


    settleBlock: function(block) {
        if (!block) return;
    
        const blockId = block.id || block.ID || undefined;
        
        if (bd.blocks?.[blockId] !== undefined) {
            block.contentObject = bd.blocks[blockId].contentObject;
            block.CSSStyleSheet = bd.blocks[blockId].CSSStyleSheet;
        } else {
            if (!block || (!block.content && !block.post_content)) return;
            const content = typeof block.content === 'string' ? block.content : (typeof block.post_content === 'string' ? block.post_content : (typeof block.content.raw === 'string' ? block.content.raw : '{}'));
            block.contentObject = JSON.parse(content);
            lodash.set(block.contentObject, 'payload.styles', block.contentObject?.payload?.styles || []);
            lodash.set(window, 'bd.blocks[' + blockId + ']', block);
            block.CSSStyleSheet = new CSSStyleSheet();
        }
    
        block.blockNamespace = block.contentObject.namespace ? block.contentObject.namespace : 'bd';
        block.blockName = block.contentObject.name ? block.contentObject.name : 'block-' + blockId;
        block.blockFullName = block.blockNamespace + '/' + block.blockName;
    
        if (block.contentObject.domtree) {
            block.contentObject.domtree.ownerBlock = block;
            bd.helper.initializeBlockDOMTree(block.contentObject.domtree)
        }
    },


    initializeBlockDOMTree: function(node, parent) {
        if (!node) return;
        if (typeof node === 'string') {
            return;
        }
        node.level = parent ? parent.level + 1 : 0;
        node.parent = parent;
        const root = parent ? parent.root : node;
        const rootChanged = node.root !== root;
        node.root = root;
        node.ownerBlock = parent ? parent.ownerBlock : node.ownerBlock;
        node.list = parent ? parent.list : [];
        node.list.push(node);
        const [nodeName, attributes, ...children] = node;
        const block = node.ownerBlock;
    
        if (node.handler === undefined) {
            const { bdElement, elementName } = nodeName.match(/^(?<bdElement>bd\-)?(?<elementName>[a-zA-Z0-9\-]+)$/)?.groups;
            if (bdElement) {
                if (bd.canvasElements[elementName]) {
                    node.handler = new bd.canvasElements[elementName](node);
                }
            }
            else if (elementName) {
                node.handler = new bd.canvasElements.htmlelement(node);
            }
        } else if (node.handler instanceof bd.canvasElements.htmlelement && node.handler.name !== node[0]) {
            node.handler = new bd.canvasElements.htmlelement(node);
        }

        if (rootChanged && node.CSSStyleRules !== undefined) {
            for (let widthName in node.CSSStyleRules) {
                let pos = block.CSSStyleSheet.cssRules.length;
                while (pos--) {
                    if (block.CSSStyleSheet.cssRules[pos] === node.CSSStyleRules[widthName]) {
                        block.CSSStyleSheet.deleteRule(pos);
                    }
                }
            }
            delete node.CSSStyleRules;
        }
    
        if (node.handler.supportsCSSStyle === true && node.CSSStyleRules === undefined) {
            if (!node[1].classes?.[0]) {
                const id = bd.helper.generateBDID();
                node[1].classes = [id];
                block.contentObject.payload.styles.push({
                    id: id,
                    style: '',
                    variants: {}
                });
            }
            const classId = node[1].classes[0];
            const rootClassId = node.root[1].classes[0];
            const isRoot = node === node.root;
            node.payloadStyle = block.contentObject.payload.styles.filter((item) => item.id === classId)[0];
            node.CSSStyleRules = {};
            bd.helper.getCanvasDevices().forEach((device) => {
                const isMainDevice = device.widthName === 'main';
                node.CSSStyleRules[device.widthName] = block.CSSStyleSheet.cssRules[block.CSSStyleSheet.insertRule((isMainDevice ? '' : '.bd-' + device.widthName + (isRoot ? '' : '.' + rootClassId + ' ')) + '.' + classId + ' { ' + ((isMainDevice ? node.payloadStyle : node.payloadStyle.variants?.[device.widthName])?.style || '') + ' }')];
                node.CSSStyleRules[device.widthName].bd_device_widthName = device.widthName;
                node.CSSStyleRules[device.widthName].bd_classId = classId;
            });
        }
    
        children.map((child) => {
            bd.helper.initializeBlockDOMTree(child, node);
        });
    }

    
}).map((entry) => {
    lodash.set(window, 'bd.helper.' + entry[0], entry[1]);
});

