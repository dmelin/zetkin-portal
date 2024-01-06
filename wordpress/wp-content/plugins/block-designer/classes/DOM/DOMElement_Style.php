<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


class DOMElement_Style
{
    private $element;
    
    public function __construct(DOMElement $element)
    {
        $this->element = $element;
    }

    public function __toString()
    {
        return $this->element->getAttribute('style');
    }

    public function __set($name, $value)
    {
        $this->change([$name => $value]);
        return $value;
    }
    
    public function __get($name)
    {
        $styles = $this->get();
        return isset($styles[$name]) ? $styles[$name] : null;
    }

    public function set($val)
    {
        $type = gettype($val);

        if ($type === 'string') {
            $this->cssText($val);
            return;
        }

        if ($type !== 'array') {
            return;
        }

        if (array_values($val) === $val) {
            $this->cssArray($val);
            return;
        }

        $this->cssAssoc($val);
    }

    public function get()
    {
        return $this->parse($this->element->getAttribute('style'));
    }
    
    public function cssText($string)
    {
        $this->change($this->parse($string));
    }
    
    public function cssArray($array)
    {
        $this->change($this->parse(implode(';', $array)));
    }

    public function cssAssoc($array)
    {
        $this->change($array);
    }

    private function parse($string)
    {
        $styles = [];
        if ($string !== '' && preg_match_all('/([^\s\:]+)\s*\:\s*(.*?)\s*(?:\;|$)/', $string, $match))
        {
            $styles = array_combine($match[1], $match[2]);
        }
        return $styles;
    }

    private function change($val, $remove = null)
    {
        $saved = $this->get();

        // iterate recursively over all arguments
        $given = [];
        array_walk_recursive($val, function($value, $key) use (&$given, $remove) {

            // if item is associative (key is a string), just add it as style declaration
            if (is_string($key))
            {
                $given[$key] = $value;
                return;
            }

            // search string for style declarations
            if (is_string($value) && preg_match_all('/([^\s\:]+)\s*\:\s*(.*?)\s*(?:\;|$)/', $value, $match))
            {
                // add founded style declarations
                $given = array_merge($given, array_combine($match[1], $match[2]));
            }
        });

        $remove = [];
        $add = [];

        // iterate over the flat array and add or remove the classes
        foreach ($given as $styleName => $styleValue) {
            if ($remove || $styleValue === '') {
                $remove[$styleName] = $styleValue;
            } else {
                $add[$styleName] = $styleValue;
            }
        }

        // build result string
        $resultAssoc = array_diff(array_merge($saved, $add), $remove);
        $result = [];
        foreach ($resultAssoc as $name => $value) {
            $result[] = $name . ': ' . $value . '; ';
        }
        $resultString = implode('', $result);

        // set style attribute
        $this->element->setAttribute('style', $resultString);
    }
}
