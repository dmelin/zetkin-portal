<?php

/**
 * Plugin Name: Gutenberg Notice Block
 * Author: WordPressIntegration
 * Author URI: https://www.wordpressintegration.com
 * Description: A simple block showing Information, Advice, Warning, and Danger notice boxes.
 */

// Load assets for wp-admin when editor is active
function gutenberg_notices_block()
{
    wp_enqueue_script(
        'gutenberg-notices-block-active-editor',
        plugins_url('notices.js', __FILE__),
        array('wp-blocks', 'wp-element')
    );

    wp_enqueue_style(
        'gutenberg-notices-block-active-editor',
        plugins_url('notices.css', __FILE__),
        array()
    );
}
add_action('enqueue_block_editor_assets', 'gutenberg_notices_block');

// Load assets for the frontend
function gutenberg_notices_block_frontend()
{

    wp_enqueue_style(
        'gutenberg-notices-block-editor',
        plugins_url('notices.css', __FILE__),
        array()
    );
}
