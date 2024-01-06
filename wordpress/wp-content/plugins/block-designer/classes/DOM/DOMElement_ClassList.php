<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


class DOMElement_ClassList
{
    private $element;
    
    public function __construct(DOMElement $element)
    {
        $this->element = $element;
    }

    public function add(...$val)
    {
        $this->change($val, false);
    }

    public function remove(...$val)
    {
        $this->change($val, true);
    }

    private function change($val, $remove = null)
    {
        $saved = array_filter(explode(' ', $this->element->getAttribute('class')));

        $given = [];
        array_walk_recursive($val, function($value) use (&$given) {
            if (!is_string($value)) return;
            $given = array_merge($given, array_filter(explode(' ', trim($value))));
        });

        $remove = [];
        $add = [];

        // iterate over the flat array and add or remove the classes
        foreach ($given as $class) {
            if ($remove) {
                $remove[] = $class;
            } else {
                $add[] = $class;
            }
        }

        $this->element->setAttribute('class', implode(' ', array_diff(array_merge($saved, $add), $remove)));
    }
}
