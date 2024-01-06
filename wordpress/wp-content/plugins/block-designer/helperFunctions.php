<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


/**
 * General block styles
 * (styles applied to all Block Designer blocks - always and everywhere)
 */
// Gets general block styles
function getGeneralBlockStyles() {
    static $content = null;

    if ($content === null)
    {
        $defaultBlockNamespace = getDefaultBlockNamespace();
        $content = file_get_contents(PLUGIN_DIR_PATH . 'assets/css/generalBlockStyle.css');
        $content = str_replace('BLOCKNAMESPACE', $defaultBlockNamespace, $content);
        $content = str_replace('PREFIX', (is_admin() ? '.editor-styles-wrapper ' : ''), $content);
    }
    return $content;
}
// Prints general block styles
function printGeneralBlockStyles() {
    echo '<style id="bd_general_block_styles">' . getGeneralBlockStyles() . '</style>';
}
// Enqueues general block styles
function enqueueGeneralBlockStyles() {

    // frontend
    if (!is_admin())
    {
        add_action('wp_print_styles', __NAMESPACE__ . '\printGeneralBlockStyles');
        return;
    }

    // admin
    add_action( 'current_screen', function() {
        if (isBlockDesigner() || isBlockEditor() || isSiteEditor())
        {
            add_action('admin_print_styles', __NAMESPACE__ . '\printGeneralBlockStyles');
        }
    });
}

function getResizeObserver() {
    static $content = null;

    if ($content === null)
    {
        $content = file_get_contents(PLUGIN_DIR_PATH . 'assets/js/resizeObserver.min.js');
    }
    return $content;
}
function printResizeObserver() {
    echo '<script id="bd_resize_observer">' . getResizeObserver() . '</script>';
}
function enqueueResizeObserver() {

        // frontend
        if (!is_admin())
        {
            add_action('wp_print_styles', __NAMESPACE__ . '\printResizeObserver');
            return;
        }
    
        // admin
        add_action( 'current_screen', function() {
            if (isBlockDesigner() || isBlockEditor() || isSiteEditor())
            {
                add_action('admin_print_styles', __NAMESPACE__ . '\printResizeObserver');
            }
        });
}


/**
 * Checks if the current http request calls the Block Designer admin page
 */
function isBlockDesigner() {
    static $result = null;
    if ($result === null) {
        $result = is_admin() && get_current_screen()->id === 'toplevel_page_block-designer';
    }
    return $result;
}


/**
 * Checks if the current http request call an admin page with a Block Editor
 */
function isBlockEditor() {
    static $result = null;
    if ($result === null) {
        $result = is_admin() && get_current_screen()->is_block_editor();
    }
    return $result;
}


/**
 * Checks if the current http request calls the Site Editor
 */
function isSiteEditor() {
    static $result = null;
    if ($result === null) {
        $result = is_admin() && get_current_screen()->id === 'site-editor';
    }
    return $result;
}


function getCanvasDevices() {
    return [
        (object) [ 'device' => 'desktop',          'width' => 1452, 'widthName' => 'main'   ],
        (object) [ 'device' => 'tablet',           'width' => 768,  'widthName' => 'medium' ],
        (object) [ 'device' => 'mobile-landscape', 'width' => 568,  'widthName' => 'small'  ],
        (object) [ 'device' => 'mobile',           'width' => 320,  'widthName' => 'tiny'   ],
    ];
}


function getDashicons() {
    static $dashicons = null;
    if ($dashicons === null)
    {
        $dashiconsFilePath = ABSPATH . '/wp-includes/fonts/dashicons.svg';
        if (file_exists($dashiconsFilePath) && preg_match_all('/\<symbol\s.*?id\=\"([^\"]+)\".*?\>\<title\>[^\<]+\<\/title\>\<g\>\<path d\=\"([^\"]+)\"\/\>\<\/g\>\<\/symbol\>/', file_get_contents($dashiconsFilePath), $dashiconsMatch)) {
            $dashicons = array_combine($dashiconsMatch[1], $dashiconsMatch[2]);
        }
    }
    return $dashicons;
}


/**
 * Enqueues needed components
 * 
 * If we are not on the Block Designer admin page, it enqueues only general components and leave out app components.
 */
function enqueueComponents(array $components = null) {
    $directories = [
        PLUGIN_DIR_PATH . 'assets/components/'
    ];

    if (isBlockDesigner()) {
        array_push($directories, PLUGIN_DIR_PATH . 'assets/app.components/');
    }

    foreach ($directories as $dir)
    {
        foreach (scandir($dir) as $name)
        {
            if ($name === '.' || $name === '..' || !is_dir($dir . $name))
            {
                continue;
            }
    
            if ($components !== null && !in_array($name, $components))
            {
                continue;
            }
    
            // register scripts
            $fileJs = $dir . $name . '/' . $name . '.js';
            if (!file_exists($fileJs))
            {
                continue;
            }
            Asset::register($fileJs, [
                'react',
                'react-dom',
                'translations' => true
            ]);
    
            // register styles
            $fileCss = $dir . $name . '/' . $name . '.css';
            if (!file_exists($fileCss))
            {
                continue;
            }
            Asset::register($fileCss);
        }
    }
}


/**
 * Enqueues the parent class of all canvas elements and all the existing canvas elements
 */
function enqueueCanvasElements(array $elements = null) {
    $dir = PLUGIN_DIR_PATH . 'assets/canvasElements/';

    $mainFileJs = $dir . 'CanvasElementPrototype.js';
    Asset::register($mainFileJs, ['react', 'react-dom']);
    $mainFileJsHandle = Asset::getHandle($mainFileJs);

    foreach (scandir($dir) as $name)
    {
        if ($name === '.' || $name === '..' || !is_dir($dir . $name))
        {
            continue;
        }

        if ($elements !== null && !in_array($name, $elements))
        {
            continue;
        }

        // register scripts
        $fileJs = $dir . $name . '/' . $name . '.js';
        if (!file_exists($fileJs))
        {
            continue;
        }
        Asset::register($fileJs, [
            $mainFileJsHandle,
            'translations' => true
        ]);

        // register styles
        $fileCss = $dir . $name . '/' . $name . '.css';
        if (!file_exists($fileCss))
        {
            continue;
        }
        Asset::register($fileCss, []);
    }
}


/**
 * includes custom DOM classes
 */
function includeDOMClasses() {
    require_once PLUGIN_DIR_PATH . 'classes/DOM/DOM_Container.php';
    require_once PLUGIN_DIR_PATH . 'classes/DOM/DOM_NodeArray.php';
    require_once PLUGIN_DIR_PATH . 'classes/DOM/DOMElement_ClassList.php';
    require_once PLUGIN_DIR_PATH . 'classes/DOM/DOMElement_Style.php';
    require_once PLUGIN_DIR_PATH . 'classes/DOM/DOMElement.php';
}


/**
 * Transforms the array representation of an HTML element to a DOM object
 */
function getDOMElement($element, $blockAttributes, $contentPlaceholder) {
    includeDOMClasses();

    preg_match('/^(?<bdElement>bd\-)?(?<elementName>[a-zA-Z0-9\-]+)$/', $element[0], $nodeNameMatch);

    if (!empty($nodeNameMatch['bdElement'])) {
        $renderName = $nodeNameMatch['elementName'];
    }
    elseif (!empty($nodeNameMatch['elementName'])) {
        $renderName = 'htmlelement';
    }

    if (!$renderName) {
        return;
    }

    $renderFilePath = PLUGIN_DIR_PATH . 'assets/canvasElements/' . $renderName . '/' . $renderName . '.php';

    if (!file_exists($renderFilePath)) {
        return;
    }

    $children = array_splice($element, 2);
    $renderChildren = function($children) use($blockAttributes, $contentPlaceholder) {
        return array_map(function($child) use($blockAttributes, $contentPlaceholder) {
            return getDOMElement($child, $blockAttributes, $contentPlaceholder);
        }, $children);
    };

    return require $renderFilePath;
}


/**
 * Gets the default namespace that is used for Block Designer blocks: The "bd" in "<!-- wp:bd/... {} -->"
 */
function getDefaultBlockNamespace() {
    return 'bd';
}


/**
 * Updates the database based on version numbers and files in the db-updates folder.
 */
function updateDatabaseIfNeeded() {
    $updatesPath = PLUGIN_DIR_PATH . 'db-updates/';
    $dbVersion = get_option('bd_db_version', '1.4.0');
    $plVersion = get_file_data(PLUGIN_DIR_FILE, ['Version' => 'Version'], 'plugin')['Version'];

    // Check if we need a database update
    if (version_compare($plVersion, $dbVersion) === 0) {
        return;
    }

    // Get all available updates from db-updates directory
    $availableUpdates = array_filter(array_map(function($fileName) {
        $updateVersion = basename($fileName, '.php');
        // Return version number if it is a valid update file
        if (substr($fileName, -4) === '.php' && version_compare($updateVersion, '0.0.1', '>=')) {
            return $updateVersion;
        }
    }, scandir($updatesPath)));

    // Get all needed updates from available updates
    $neededUpdates = array_filter($availableUpdates, function($updateVersion) use($dbVersion, $plVersion) {
        // Check if this update is needed
        return version_compare($dbVersion, $updateVersion, '<') && version_compare($plVersion, $updateVersion, '>=');
    });

    // sort needed updates
    usort($neededUpdates, 'version_compare');

    // Run needed updates
    foreach ($neededUpdates as $updateVersion) {

        require_once $updatesPath . $updateVersion . '.php';

        // Set new version number in database
        update_option('bd_db_version', $updateVersion);
    }

    // Set new version number in database
    update_option('bd_db_version', $plVersion);
}
