<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


class DOMElement extends \DOMElement
{
    public $classList;
    private $styleDeclaration;

    public function __construct($tagName, $attributes = null)
    {
        parent::__construct($tagName);
        DOM_Container::register($this);

        $this->classList = new DOMElement_ClassList($this);
        $this->styleDeclaration = new DOMElement_Style($this);
        
        if ($attributes !== null)
        {
            foreach ($attributes as $name => $value) {
                switch ($name) {
                    case 'class':
                    case 'className':
                        $this->classList->add($value);
                        break;
                    case 'style':
                        $this->styleDeclaration->set($value);
                        break;
                    default:
                        $this->setAttribute($name, $value);
                }
            }
        }

        foreach (new DOM_NodeArray(array_slice(func_get_args(), 2)) as $node)
        {
            $this->appendChild($node);
        }
    }

    public function __set($name, $value)
    {
        if ($name === 'style') {
            $this->styleDeclaration->set($value);
        }
        else {
            $this->{$name} = $value;
        }
    }

    public function __get($name)
    {
        if ($name === 'style') {
            return $this->styleDeclaration;
        }
        return $this->{$name};
    }

    public function getHTML()
    {
        return DOM_Container::getHTML($this);
    }
}
