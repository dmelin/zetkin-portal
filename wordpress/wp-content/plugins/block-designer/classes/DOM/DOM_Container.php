<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


/**
 * Holds all \BlockDesigner\DOMElement instances in one \DOMDocument, because \DOMElement instances are only editable if they are associated with a \DOMDocument.
 */
class DOM_Container
{
    /**
     * Make the class singleton
     */
    protected function __construct() {}
    protected function __clone() {}

    /**
     * Registers a DOMNode, so it will be editable afterwards
     */
    public static function register($node)
    {
        static $fragments = [];

        $fragment = self::document()->createDocumentFragment();
        $fragment->appendChild($node);
        $fragments[] = $fragment;
    }

    /**
     * Gets the HTML of a registered DOMNode
     */
    public static function getHTML($node)
    {
        return self::document()->saveHTML($node);
    }

    /**
     * Holds and serves the \DOMDocument instance
     */
    private static function document()
    {
        static $document = null;
        
        if ($document === null) {
            $document = new \DOMDocument();
        }

        return $document;
    }
}
