<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;

$attr = $element[1] ?? [];
$className = trim(preg_replace('/\s+/', ' ', implode(' ', [($attr['class'] ?? ''), ($attr['className'] ?? ''), implode(' ', $attr['classes'] ?? [])])));
if ($className !== '') {
    $attr['className'] = $className;
}
unset($attr['classes']);
unset($attr['style']);


$icon = isset($attr['bd']['icon']) ? $attr['bd']['icon'] : 'smiley';
unset($attr['bd']);
$icons = getDashicons();
$attr['viewBox'] = '0 0 20 20';

if (!isset($icons[$icon])) {
    return '';
}

return new DOMElement('svg',
    $attr,
    new DOMElement('path',
        [
            'fill' => 'currentColor',
            'd' => $icons[$icon]
        ]
    )
);
