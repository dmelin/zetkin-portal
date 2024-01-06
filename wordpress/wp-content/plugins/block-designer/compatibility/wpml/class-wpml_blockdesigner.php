<?php

namespace WPML\PB\Gutenberg\StringsInBlock;

use WPML\FP\Obj;


// Exit direct requests
if (!defined('ABSPATH')) exit;



class WPML_BlockDesigner extends Base {


    public function __construct() {}


    public function find( \WP_Block_Parser_Block $block ) {
        $strings = [];

        foreach ($block->attrs as $attr_key => $attr_value) {
            
            // @TODO: In the long term, the attribute names should be retrieved dynamically
            if (strpos($attr_key, 'authorrichtext') === 0) {
            }
            elseif (strpos($attr_key, 'authorimage') === 0 && $attr_value > 0) {
                $attr_key = sprintf('__%s_alt', $attr_key);
                $attr_value = get_post_meta($attr_value, '_wp_attachment_image_alt', TRUE);
                if (!$attr_value) {
                    continue;
                }
            }
            else {
                continue;
            }

            // Copy from: wordpress\wp-content\plugins\sitepress-multilingual-cms\addons\wpml-page-builders\classes\Integrations\Gutenberg\strings-in-block\class-attributes.php
            $type      = self::get_string_type( $attr_value );
            $string_id = $this->get_string_id( $block->blockName, $attr_value );
            // end of copy

            $label     = $attr_key;
            $strings[] = $this->build_string( $string_id, $label, $attr_value, $type );
        }

        return $strings;
    }


    public function update( \WP_Block_Parser_Block $block, array $string_translations, $lang ) {
        $translations = &$string_translations;
        $attrs = &$block->attrs;
    
        foreach ($block->attrs as $attr_key => $attr_value) {

            // @TODO: In the long term, the attribute names should be retrieved dynamically
            if (strpos($attr_key, 'authorrichtext') === 0) {
            }
            elseif (strpos($attr_key, 'authorimage') === 0 && $attr_value > 0) {
                $attr_key = sprintf('__%s_alt', $attr_key);
                $attr_value = get_post_meta($attr_value, '_wp_attachment_image_alt', TRUE);
                if (!$attr_value) {
                    continue;
                }
            }
            else {
                continue;
            }

            $string_id = $this->get_string_id( $block->blockName, $attr_value );
    
            // Copy from: wordpress\wp-content\plugins\sitepress-multilingual-cms\addons\wpml-page-builders\classes\Integrations\Gutenberg\strings-in-block\class-attributes.php (line 183)
            if (
                isset( $translations[ $string_id ][ $lang ] ) &&
                ICL_TM_COMPLETE === (int) $translations[ $string_id ][ $lang ]['status']
            ) {
                $attrs[ $attr_key ] = $translations[ $string_id ][ $lang ]['value'];
            }
            // end of copy
        }
    
        return $block;
    }


}


