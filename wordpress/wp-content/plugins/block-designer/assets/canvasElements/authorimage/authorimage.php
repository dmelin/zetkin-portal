<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


if (!isset($element[1]['bd']['attributeName'])) {
    return '';
}

$attributeName = $element[1]['bd']['attributeName'];

if (!isset($blockAttributes[$attributeName]) || !is_int($blockAttributes[$attributeName])) {
    return '';
}

$image = wp_get_attachment_image_src( $blockAttributes[$attributeName], 'original' );



if (!$image) {
    return '';
}

$attr = array_merge(($element[1] ?? []), ['src' => $image[0]]);
$className = trim(preg_replace('/\s+/', ' ', implode(' ', [($attr['class'] ?? ''), ($attr['className'] ?? ''), implode(' ', $attr['classes'] ?? [])])));
if ($className !== '') {
    $attr['className'] = $className;
}
if (!isset($attr['alt'])) {

    // This special attribute name ("__..._alt") may be set via wpml compatibility script:
    // /wp-content/plugins/block-designer/compatibility/wpml/class-wpml_blockdesigner.php
    // @TODO: There might be a better solution in the long term
    if (($__attributeName_alt = sprintf('__%s_alt', $attributeName)) && isset($blockAttributes[$__attributeName_alt]))
    {
        $image_alt = $blockAttributes[$__attributeName_alt];
    }

    // Otherwise, just get the default alt text
    else
    {
        $image_alt = get_post_meta( $blockAttributes[$attributeName], '_wp_attachment_image_alt', true);
    }

    if ($image_alt) {
        $attr['alt'] = $image_alt;
    }
}
unset($attr['classes']);
unset($attr['style']);
unset($attr['bd']);

return new DOMElement('img', $attr);
