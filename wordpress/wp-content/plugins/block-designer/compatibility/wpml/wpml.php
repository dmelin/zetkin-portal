<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;



add_filter('wpml_found_strings_in_block', function($strings, $block) {

    // Skip blocks that are not Block Designer blocks
    if (substr($block->blockName, 0, 3) !== getDefaultBlockNamespace() . '/') {
        return $strings;
    }

    // include the class
    require_once __DIR__ . '/class-wpml_blockdesigner.php';

    // call find() method
    $strings = array_merge($strings, (new \WPML\PB\Gutenberg\StringsInBlock\WPML_BlockDesigner())->find($block));

    return $strings;
}, 10, 2);



add_filter('wpml_update_strings_in_block', function($block, $string_translations, $lang) {

    // Skip blocks that are not Block Designer blocks
    if (substr($block->blockName, 0, 3) !== getDefaultBlockNamespace() . '/') {
        return $block;
    }

    // include the class
    require_once __DIR__ . '/class-wpml_blockdesigner.php';

    // call update() method
    $originalBlockAttrs = json_encode($block->attrs);
    $block = (new \WPML\PB\Gutenberg\StringsInBlock\WPML_BlockDesigner())->update($block, $string_translations, $lang);

    if ( $originalBlockAttrs !== json_encode($block->attrs) ) {
        $block->attrs['translatedWithWPMLTM'] = '1';
    }

    return $block;
}, 10, 3);


