
if (window.bd_observeDocument === undefined) {
    (function() {
        const docs = [];
        const sizes = [
            {name: 'medium', width: 991},
            {name: 'small', width: 767},
            {name: 'tiny', width: 479}
        ];

        function observeElements(docObj) {
            Array.from(docObj.document.getElementsByClassName('bd-resizeobserve')).forEach((element) => {
                if (docObj.elements.indexOf(element) > -1) {
                    return;
                }
                docObj.elements.push(element);
                docObj.resizeObserver.observe(element);
            });
        }

        window.bd_observeDocument = function(doc, undo) {
            doc = doc || document;

            if (undo) {
                const rmDocObj = docs.filter(d => d.doc === doc)[0];
                if (rmDocObj) {
                    rmDocObj.resizeObserver.disconnect();
                    rmDocObj.mutationObserver.disconnect();
                    docs.splice(docs.indexOf(rmDocObj), 1);
                }
                return;
            }

            if (docs.filter(d => d.doc === doc).length > 0) {
                return;
            }

            const
            docObj = {
                document: doc,
                elements: [],
            };

            docObj.resizeObserver = new ResizeObserver((entries) => {
                for (let entryIndex in entries) {
                    const entry = entries[entryIndex];
                    const width = entry.contentBoxSize?.inlineSize || entry.contentRect?.width,
                            target = entry.target,
                            oldSize = target.bd_size || '';
        
                    let newSize = '', pos = sizes.length;
                    const apply = [];
                    const unset = [];
                    while (pos--) {
                        if (sizes[pos].width >= width) {
                            apply.push(sizes[pos].name);
                        } else {
                            unset.push(sizes[pos].name);
                        }
                    }
        
                    newSize = apply.length;
                    if (oldSize !== newSize) {
                        unset.map((name) => {
                            target.classList.remove('bd-' + name);
                        });
                        apply.map((name) => {
                            target.classList.add('bd-' + name);
                        });
                        target.bd_size = newSize;
                    }
                }
            });

            docObj.mutationObserver = new MutationObserver((function(docObj) {
                return function() { observeElements(docObj); };
            })(docObj));

            docObj.mutationObserver.observe(docObj.document, {
                attributes: true,
                attributeFilter: ['class'],
                subtree: true,
                childList: true
            });

            observeElements(docObj);

            docs.push(docObj);
        };
        window.bd_observeDocument();
    })();
}
