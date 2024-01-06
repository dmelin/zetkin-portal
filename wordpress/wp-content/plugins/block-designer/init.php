<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;



// Ensure compatibility with third-party plugins
require_once PLUGIN_DIR_PATH . 'compatibility/compatibility.php';



// Initialize the plugin
add_action('init', function() {


    // Include helper classes and functions
    require_once PLUGIN_DIR_PATH . 'classes/Asset.php';
    require_once PLUGIN_DIR_PATH . 'helperFunctions.php';


    // Update the database if needed
    updateDatabaseIfNeeded();


    // General block styles
    enqueueGeneralBlockStyles();


    // Resize Observer
    enqueueResizeObserver();


    // Admin assets
    add_action('bd_enqueue_admin_assets', function() {
        Asset::register(PLUGIN_DIR_PATH . 'assets/js/adoptedStyleSheets.js');
        Asset::register(PLUGIN_DIR_PATH . 'assets/js/adminHelpers.js', [
            'lodash',
            'wp-editor',
            'wp-blocks',
            'wp-element',
            'wp-i18n',
            'wp-components',
            PLUGIN_DIR_PATH . 'assets/js/adoptedStyleSheets.js'
        ]);
        enqueueCanvasElements();
        enqueueComponents();
        // editor_script (enqueue only when admin screen has a block editor)
        Asset::register(PLUGIN_DIR_PATH . 'assets/js/editor.js', [
            'enqueue' => isBlockEditor()
        ]);
    });


    // Register block types
    add_action('bd_register_block_types', function() {
        $blocksData = [];
        $fileJsHandle = Asset::getHandle(PLUGIN_DIR_PATH . 'assets/js/editor.js');
        $posts = get_posts([
            'numberposts' => -1,
            'post_type' => 'bd_block',
            'post_status' => 'publish',
            'sort_column' => 'post_title',
            'order'       => 'asc'
        ]);
        
        foreach ($posts as $post) {
            if ($post->post_title === '') continue;

            $blockContent = json_decode($post->post_content, true);
            $blockNamespace = isset($blockContent['namespace']) ? $blockContent['namespace'] : getDefaultBlockNamespace();
            $blockName = isset($blockContent['name']) ? $blockContent['name'] : 'block-' . $post->ID;
            $blockFullName = $blockNamespace . '/' . $blockName;

            // Register block styles
            $rootClassId = $blockContent['domtree'][1]['classes'][0];
            $canvasDevices = getCanvasDevices();
            if (isset($blockContent['payload']['styles']))
            {
                $styleRules = [];
                foreach ($blockContent['payload']['styles'] as $style) {
                    $isRoot = $style['id'] === $rootClassId;
                    if ($style['style']) {
                        if (!isset($styleRules['main'])) $styleRules['main'] = [];
                        $styleRules['main'][] = '.' . $style['id'] . '.' . $style['id'] . ' { ' . $style['style'] . ' }';
                    }
                    foreach ($style['variants'] as $variantName => $variant) {
                        if ($variant['style']) {
                            if (!isset($styleRules[$variantName])) $styleRules[$variantName] = [];
                            $styleRules[$variantName][] = '.bd-' . $variantName . ($isRoot ? '' : '.' . $rootClassId . ' ') . '.' . $style['id'] . '.' . $style['id'] . ' { ' . $variant['style'] . ' }';
                        }
                    }
                }
                if (!empty($styleRules)) {
                    $styleResult = '';
                    foreach ($canvasDevices as $deviceInfo) {
                        if (isset($styleRules[$deviceInfo->widthName])) {
                            $styleResult .= implode("\n", $styleRules[$deviceInfo->widthName]) . "\n";
                        }
                    }
                    $blockStyleHandle = 'wp-block-' . str_replace('/', '-', $blockFullName);
                    wp_register_style($blockStyleHandle, false);
                    wp_add_inline_style($blockStyleHandle, trim($styleResult));
                }
            }

            // Register the block itself
            register_block_type($blockFullName, array(
                'editor_script' => $fileJsHandle,
                'style' => isset($blockStyleHandle) ? [$blockStyleHandle] : [],
                'render_callback' => function($attributes, $content, $block) {
                    static $needObserver = null;

                    if (!preg_match('/^bd\/block\-([0-9]+)$/', $block->name, $match))
                    {
                        return '';
                    }

                    $id = (INT) $match[1];
                    $post = get_post($id);
                    $post_content = json_decode($post->post_content, true);
                    $domtree = $post_content['domtree'];
                    $contentPlaceholder = $content ? md5($content . time()) : '';

                    $blockClassName = 'wp-block-' . str_replace('/', '-', $block->name);
                    $domElement = getDOMElement($domtree, $attributes, $contentPlaceholder);
                    @$domElement->classList->add('wp-block-' . getDefaultBlockNamespace() . '---');
                    @$domElement->classList->add($blockClassName);

                    if (isset($attributes['align']))
                    {
                        @$domElement->classList->add('align' . $attributes['align']);
                    }

                    if ($needObserver === null)
                    {
                        $needObserver = false;
                        if (isset($post_content['payload']['styles']))
                        {
                            $mainStyleExists = false;
                            $variantsStyleNumber = 0;
                            foreach ($post_content['payload']['styles'] as $style) {
                                if ($style['style']) {
                                    $mainStyleExists = true;
                                }
                                if ($style['variants']) {
                                    $variantsStyleNumber = count($style['variants']);
                                }
                            }
                            $totalStyleNumber = $variantsStyleNumber + ($mainStyleExists ? 1 : 0);
                            $needObserver = $totalStyleNumber === 1 && !$mainStyleExists || $totalStyleNumber > 1;
                        }
                    }
                    if ($needObserver === true) {
                        @$domElement->classList->add('bd-resizeobserve');
                    }

                    $result = $domElement ? $domElement->getHTML() : '';
                    
                    $result = (isset($styleResult) ? $styleResult . "\n" : '') . str_replace($contentPlaceholder, $content, $result);

                    return $result;
                },
            ));

            $blocksData[$blockFullName] = [
                'ID' => $post->ID,
                'block_name' => $blockFullName,
                'post_title' => $post->post_title,
                'post_content' => $post->post_content
            ];
        }

        wp_localize_script($fileJsHandle, 'BDEditorData', [
            'generalBlockStyles' => getGeneralBlockStyles(),
            'dashicons' => getDashicons(),
            'blocksData' => $blocksData,
            'canvasDevices' => getCanvasDevices(),
        ]);
    });


    // Register post type
    register_post_type('bd_block', [
            'labels' => [
                'name'          => __('Blocks', 'block-designer'),
                'singular_name' => __('Block', 'block-designer'),
            ],
            //'public'      => true,
            'show_in_rest' => true,
        ]
    );
    //add_post_type_support( 'bd_block', 'revisions' );


    // Register Block Designer as admin page
    add_action('bd_register_designer', function() {

        add_action( 'admin_menu', function() {
            //var_dump('admin_menu');
            add_menu_page(
                'Block Designer',     // page title
                'Block Designer',     // menu title
                'manage_options',         // capability
                'block-designer',      // menu slug
                function() {          // callback function

                    global $title;

                    // register admin assets, components, ...
                    do_action('bd_enqueue_admin_assets');

                    // register block types
                    do_action('bd_register_block_types');

                    // register media library assets
                    wp_enqueue_media();

                    // register styles
                    Asset::register(PLUGIN_DIR_PATH . 'assets/css/designer.css', [
                        'wp-block-editor'
                    ]);
        
                    // register scripts
                    Asset::register(PLUGIN_DIR_PATH . 'assets/js/designer.js', [
                        'react',
                        'react-dom',
                        'wp-block-editor',
                        'media-upload',
                        'media-models',
                        'wp-mediaelement',
                        'media-views',
                        'media-editor'
                    ]);

                    // get posts
                    $posts = get_posts([
                        'numberposts' => -1,
                        'post_type' => 'bd_block',
                        'post_status' => array_keys(get_post_statuses()),
                        'sort_column' => 'post_title',
                        'order'       => 'asc'
                    ]);
                    array_walk($posts, function(&$post, $key) {
                        $post = array_intersect_key($post->to_array(), array_flip(['ID', 'post_title', 'post_content', 'post_status']));
                        $post['post_content'] = json_decode($post['post_content']);
                    });

                    // register data
                    wp_localize_script(Asset::getHandle(PLUGIN_DIR_PATH . 'assets/js/designer.js'), 'BDData', [
                        'admin_page_title' => htmlspecialchars($title),
                        'blocks' => $posts,
                        'dashicons' => getDashicons(),
                        'blockCategories' => array_filter(get_default_block_categories(), function($item) { return $item['slug'] !== 'reusable'; }),
                        'defaultBlockEditorSettings' => get_block_editor_settings(
                            [],
                            get_post(get_option('page_on_front'))
                        ),
                        'layoutStyle' => wp_get_layout_style('SELECTOR', wp_get_global_settings( array( 'layout' ) )),
                        'generalBlockStyles' => getGeneralBlockStyles(),
                        'currentUserEmail' => wp_get_current_user()->user_email,
                        'canvasDevices' => getCanvasDevices(),
                    ]);
                },
                'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ><path fill="#fff" d="M 4 3 A 1 1 0 0 0 3 4 L 3 10 A 1 1 0 0 0 4 11 L 10 11 A 1 1 0 0 0 11 10 L 11 4 A 1 1 0 0 0 10 3 Z M 4 13 A 1 1 0 0 0 3 14 L 3 20 A 1 1 0 0 0 4 21 L 10 21 A 1 1 0 0 0 11 20 L 11 14 A 1 1 0 0 0 10 13 Z M 14 3 A 1 1 0 0 0 13 4 L 13 20 A 1 1 0 0 0 14 21 L 20 21 A 1 1 0 0 0 21 20 L 21 4 A 1 1 0 0 0 20 3 Z"/></svg>')
                //'dashicons-star-empty' // icon (can also be an svg - see: https://developer.wordpress.org/reference/functions/add_menu_page/#parameters )
            );
        });
    });


    // do actions
    if (is_admin())
    {
        // do admin actions

        add_action('enqueue_block_editor_assets', function() {
            do_action('bd_enqueue_admin_assets');
            do_action('bd_register_block_types');
        });

        do_action('bd_register_designer');
    }
    else
    {
        // do frontend actions
        
        do_action('bd_register_block_types');
    }


});
