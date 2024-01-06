<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;



// Compatibility with the WPML plugin (https://wpml.org/)
if (is_plugin_active('sitepress-multilingual-cms/sitepress.php'))
{
    require_once __DIR__ . '/wpml/wpml.php';
}

