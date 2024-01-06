<?php
/**
 * Plugin Name: Block Designer
 * Plugin URI: https://blockdesigner.net/
 * Description: Design individual blocks for the WordPress Block Editor without any line of code
 * Version: 1.10.0
 * Requires at least: 5.9.0
 * Requires PHP: 7.3
 * Author: Helmut Wandl
 * Author URI: https://ehtmlu.com/
 * License: GPLv2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: block-designer
 */

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


/**
 * Register plugin path constant
 */
define(__NAMESPACE__ . '\PLUGIN_DIR_PATH', realpath(__DIR__) . DIRECTORY_SEPARATOR);
define(__NAMESPACE__ . '\PLUGIN_DIR_FILE', realpath(__FILE__));


/**
 * Prepare for initialization if the PRO plugin does not exist.
 * If the PRO plugin exists, this plugin will do nothing.
 */
add_action('plugins_loaded', function() {

    /** WordPress Plugin Administration API */
    require_once ABSPATH . 'wp-admin/includes/plugin.php';

    if (!is_plugin_active('block-designer-pro/block-designer-pro.php'))
    {
        require_once PLUGIN_DIR_PATH . 'init.php';
    }
});

