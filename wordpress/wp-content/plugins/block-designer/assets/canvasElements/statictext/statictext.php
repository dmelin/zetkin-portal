<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


$parts = !empty($element[1]['nodeValue']) ? preg_split('/(\r\n|\r|\n)/', $element[1]['nodeValue'], 0, PREG_SPLIT_DELIM_CAPTURE) : [];

return array_map(function($index, $text) {
    return $index % 2 ? new DOMElement('br') : $text;
}, range(0, count($parts) - 1), $parts);


