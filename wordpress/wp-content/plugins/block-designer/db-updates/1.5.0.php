<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


(function() {

    /**
     * Define helper functions
     */

    $generateBDID = function() {
        $id = '';
        while (strlen($id) < 30) {
            $id .= base_convert(mt_rand(), 10, 36);
        }
        return 'bd-' . substr($id, 0, 30);
    };

    $object_merge = function() {
        return (object) call_user_func_array('array_merge', array_map(function($obj) { return (array) $obj; }, func_get_args()));
    };

    $update_node = function($content, $node, $update_node) use($generateBDID) {
        if (!isset($node[1])) {
            $node[1] = (object) [];
        }
        if ((substr($node[0], 0, 3) !== 'bd-' || $node[0] === 'bd-authorimage') && !isset($node[1]->classes)) {
            $id = $generateBDID();
            $node[1]->classes = [$id];

            $content->payload->styles[] = (object) [
                'id' => $id,
                'style' => isset($node[1]->style) ? $node[1]->style : '',
                'variants' => (object) []
            ];
            unset($node[1]->style);
        }
        for ($a = 2; isset($node[$a]); $a++) {
            $update_node($content, $node[$a], $update_node);
        }
    };

    $do_not_update_modified_date = function($data, $unmodifiedData) {
        unset($data['post_modified']);
        unset($data['post_modified_gmt']);
        return $data;
    };


    /**
     * Do the update
     */

    // get all blocks
    $posts = get_posts([
        'numberposts' => -1,
        'post_type' => 'bd_block',
        'post_status' => 'any',
        'sort_column' => 'post_title',
        'order'       => 'asc'
    ]);
    
    // prepare filter for wp_update_post()
    add_filter( 'wp_insert_post_data', $do_not_update_modified_date, 1, 2 );

    // iterate over all blocks
    foreach ($posts as $post)
    {
        $content = json_decode($post->post_content);

        if (isset($content->version)) {
            continue;
        }
    
        $content = $object_merge(['version' => 2], $content);

        if (!isset($content->payload)) {
            $content->payload = (object) [];
        }

        if (!isset($content->payload->styles)) {
            $content->payload->styles = [];
        }
    
        if (isset($content->domtree)) {
            $update_node($content, $content->domtree, $update_node);
        }
    
        $post->post_content = json_encode($content, JSON_UNESCAPED_UNICODE);
        wp_update_post($post);
    }

    // remove filter for wp_update_post()
    remove_filter( 'wp_insert_post_data', $do_not_update_modified_date, 1, 2 );

})();
