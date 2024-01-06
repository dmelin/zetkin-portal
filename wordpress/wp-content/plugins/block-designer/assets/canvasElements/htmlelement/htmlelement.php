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

return new DOMElement($element[0], $attr, $renderChildren($children));
