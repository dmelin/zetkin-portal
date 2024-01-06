
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Register media functions
    lodash.set(window, 'bd.mediaUtils', {
        // Get MediaUpload from wp
        MediaUpload: wp.mediaUtils.MediaUpload,

        // Define custom MediaUploadCheck function (grabbed from here: https://github.com/WordPress/gutenberg/issues/40698 )
        MediaUploadCheck: function({children, fallback = null}) {
            const {
                checkingPermissions,
                hasUploadPermissions,
            } = wp.data.useSelect(select => {
                const core = select("core");
                return {
                    hasUploadPermissions: core.canUser("read", "media"),
                    checkingPermissions: !core.hasFinishedResolution("canUser", [ "read", "media"]),
                };
            });
    
            return checkingPermissions ? null : (hasUploadPermissions ? children : fallback);
        }
    });

    // Render App
    var root = document.createElement('div');
    root.className = 'block-designer-root';
    lodash.set(window, 'bd.app.rootDOMNode', root);
    document.querySelector('#wpbody-content').appendChild(root);
    ReactDOM.render(React.createElement(bd.app.components.AppContainer), root);
});
