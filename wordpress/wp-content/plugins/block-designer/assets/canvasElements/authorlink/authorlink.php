<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;

$attr = $element[1] ?? [];
$className = trim(preg_replace('/\s+/', ' ', implode(' ', ['bd-authorlink', ($attr['class'] ?? ''), ($attr['className'] ?? ''), implode(' ', $attr['classes'] ?? [])])));
if ($className !== '') {
    $attr['className'] = $className;
}
unset($attr['classes']);
unset($attr['style']);
unset($attr['bd']);

$tagName = 'div';
if (isset($element[1]['bd']['attributeName'])) {
    $attributeName = $element[1]['bd']['attributeName'];

    if (isset($blockAttributes[$attributeName]))
    {
        if (isset($blockAttributes[$attributeName]['url']))
        {
            $attr['href'] = $blockAttributes[$attributeName]['url'];
            $tagName = 'a';

            if (isset($blockAttributes[$attributeName]['opensInNewTab']) && $blockAttributes[$attributeName]['opensInNewTab'] === true)
            {
                $attr['target'] = '_blank';
            }
        }
    }
}

return new DOMElement($tagName, $attr, $renderChildren($children));
