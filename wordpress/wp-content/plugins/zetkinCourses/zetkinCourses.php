<?php

/**
 * Plugin Name: Zetkin Courses
 * Description: Handles post types and other portal items that theme should not override
 * Version: 1.0
 * Author: Daniel Melin
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
