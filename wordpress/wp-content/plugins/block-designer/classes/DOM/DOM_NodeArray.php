<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


class DOM_NodeArray implements \Iterator
{
    private $position = 0;
    private $nodes = [];
    
    public function __construct()
    {
        $this->position = 0;
        $this->nodes = $this->obtainDOMNodes(func_get_args());
    }

    /**
     * Gets the whole HTML of all nodes as a single string
     */
    public function getHTML()
    {
        $result = '';
        foreach ($this->nodes as $node)
        {
            $result .= $node->getHTML();
        }
        return $result;
    }

    /**
     * Iterator methods
     * 
     * As long as we want to support PHP7 we need the PHP attribute "#[\ReturnTypeWillChange]" to avoid Deprecated notices on PHP8.
     * If we don't want to support PHP7 anymore, we can remove the "#[\ReturnTypeWillChange]" attributes and uncomment the return type hints.
     * For details see: https://stackoverflow.com/questions/71133749/reference-return-type-of-should-either-be-compatible-with-or-the-re
     * More about PHP attributes: https://www.php.net/manual/de/language.attributes.overview.php
     */
    #[\ReturnTypeWillChange]
    public function current()/* : mixed */ { return $this->nodes[$this->position]; }
    #[\ReturnTypeWillChange]
    public function key()/* : mixed */ { return $this->position; }
    #[\ReturnTypeWillChange]
    public function next()/* : void */ { ++$this->position; }
    #[\ReturnTypeWillChange]
    public function rewind()/* : void */ { $this->position = 0; }
    #[\ReturnTypeWillChange]
    public function valid()/* : bool */ { return isset($this->nodes[$this->position]); }

    /**
     * Converts multidimensional parameters that contains DOM nodes and strings to a one dimensional array only with DOM nodes.
     * Strings and numbers will be converted to DOMText objects.
     * 
     * @param mixed ... DOMNode objects and/or strings and/or multidimensional arrays with DOMNode objects and/or strings
     * 
     * @return array One dimensional array with DOMNode instances (e.g. DOMElement, DOMText, ...)
     */
    private function obtainDOMNodes()
    {
        $val = func_get_args();
        $nodes = [];
        array_walk_recursive($val, function($value) use (&$nodes) {
            switch (gettype($value))
            {
                case 'string':
                case 'integer':
                case 'double':
                    $nodes[] = new \DOMText((string) $value);
                    break;
                case 'object':
                    if ($value instanceof \DOMNode) {
                        $nodes[] = $value;
                    }
                    break;
                default:
                    throw new \Exception('Can\'t obtain an instance of DOMNode because ' . (gettype($value) !== 'object' ? 'type is "' . gettype($value) . '"' : 'object is instance of "' . get_class($value) . '"'));
            }
        });
        return $nodes;
    }
}
