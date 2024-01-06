<?php

/**
 * Plugin Name: My Custom Plugin
 * Description: Adds a new section in the wp-admin menu with a custom png icon and with two sub items.
 * Version: 1.0
 * Author: Your Name
 */

if (!class_exists('zetkinCourses')) {
    class zetkinCourses
    {
        public function __construct()
        {
            add_action('admin_menu', function () {
                add_action('admin_head', function () {
                    echo '
            <style type="text/css">
            .toplevel_page_zetkin .wp-submenu .wp-first-item { display: none !important; }
            </style>
            ';
                });
                $this->admin_menu();
            });
            foreach (glob(__DIR__ . '/post_types/*.json') as $postType) {
                $this->posts($postType);
            }

            // $this->blocks();
        }

        public function blocks()
        {
            $styleURI = plugin_dir_url(__FILE__) . '/blocks/src/style.css';
            //Enquee style
            wp_enqueue_style(
                'myFirst-block-style',
                $styleURI,
            );
            // Register JavasScript File build/index.js
            wp_register_script(
                'myFirstblock',
                plugins_url('blocks/build/index.js', __FILE__),
                array('wp-blocks', 'wp-element', 'wp-editor'),
            );
            // Register editor style src/editor.css
            wp_register_style(
                'myFirst-block-editor-style',
                plugins_url('blocks/src/editor.css', __FILE__),
            );
            // Register block
            register_block_type('gutenreact/myFirst-block', array(
                'editor_script' => 'myFirstblock',
                'editor_style' => 'myFirst-block-editor-style',
            ));
        }
        public function admin_menu()
        {
            add_menu_page(
                'Zetkin',
                'Zetkin',
                'manage_options',
                'zetkin',
                array($this, 'dashboard'),
                'dashicons-tickets',
                1
            );
        }

        public function dashboard()
        {
            require_once __DIR__ . '/pages/dashboard.php';
        }

        public function posts($data)
        {
            if (is_file($data)) {
                $data = json_decode(file_get_contents($data));
                register_post_type(
                    sanitize_title($data->title),
                    array(
                        'labels' => array(
                            'name' => $data->title,
                            'singular_name' => $data->singular
                        ),
                        'public' => true,
                        'has_archive' => $data->archive,
                        'menu_icon' => $data->icon,
                        'supports' => array('title', 'editor', 'thumbnail'),
                        'show_in_rest' => true
                    )
                );
            }
        }

        public function getPosts($type, $sort = ['title', 'asc'])
        {
            $args = [
                'post_type' => $type,
                'orderby' => $sort[0],
                'order' => $sort[1]
            ];
            $query = new WP_Query($args);
            return $query->posts;
        }
    }

    add_action('init', function () {
        $zetkin = new zetkinCourses();
    });
}
