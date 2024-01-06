<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


if (!isset($element[1]['bd']['attributeName'])) {
    return '';
}

$attributeName = $element[1]['bd']['attributeName'];

if (!isset($blockAttributes[$attributeName])) {
    return '';
}

$doc = new \DOMDocument();
$id = md5(microtime().mt_rand());
$doc->loadHTML('<?xml encoding="utf-8" ?><html><head></head><body><div id="' . $id . '">' . $blockAttributes[$attributeName] . '</div></body></html>');
$result = [];
$mainDoc = (new DOMElement('div'))->ownerDocument;
$elem = $doc->getElementById($id)->firstChild;
if ($elem)
{
    do {
        $result[] = $mainDoc->importNode($elem, true);
    } while ($elem = $elem->nextSibling);
}

return $result;
