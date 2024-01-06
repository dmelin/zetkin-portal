<?php

namespace BlockDesigner;


// Exit direct requests
if (!defined('ABSPATH')) exit;


class Asset
{
    /**
     * Registers and enqueues a script or style
     * 
     * @param   STRING        $path          The path of the file you want to register or enqueue (relative to your plugin folder).
     * @param   ARRAY         $options       Options as an associative array or dependencies as a numeric array or a mixed array with both, options and dependencies.
     *                                       
     *                                       $options can have the following associative entries:
     *                                       ARRAY         'dependencies'    The dependencies as you know from wp_enqueue_script, but allows also paths of other assets that were registered with this method.
     *                                       BOOLEAN       'enqueue'         If FALSE it will only be registered, otherwise it will also be enqueued.
     *                                       STRING|NULL   'type'            Type of the asset. Allowed types are 'script' and 'style'. If it is NULL, the type is automatically detected from the file extension.
     *                                       STRING        'media'           To define 'media' when adding CSS (Ignored for JS assets - JS assets always get TRUE for the in_footer parameter as this is usually the recommended way)
     *                                       BOOLEAN       'translations'    If TRUE script translations will be set as well, otherwise it doesn't set any translations
     * 
     * @return  BOOLEAN|NULL  When $enqueue is TRUE, the return value is always NULL. Otherwise TRUE on success, FALSE on failure.
     */
    static public function register($path, $options = [])
    {
        // If $options has entries with numeric keys, use them as dependencies (you can use a mixed array with dependencies [numeric keys] and options [textual keys])
        $dependencies = array_filter($options, 'is_int', ARRAY_FILTER_USE_KEY);
        if (!empty($dependencies))
        {
            $options = array_diff($options, $dependencies);
            $options['dependencies'] = array_merge($dependencies, isset($options['dependencies']) ? $options['dependencies'] : []);
        }

        $default_options = [
            'dependencies' => [],
            'enqueue' => true,
            'type' => null,
            'media' => 'all',
            'translations' => false
        ];
        
        // Extract options, so we can use them as variables
        extract(array_merge($default_options, array_intersect_key($options, $default_options)));

        $path = realpath($path);

        if ($type === null) {
            $extensions = ['js' => 'script', 'css' => 'style'];
            $extension = pathinfo($path, PATHINFO_EXTENSION);
            $type = isset($extensions[$extension]) ? $extensions[$extension] : null;
        }
        if (!in_array($type, ['script', 'style']) || !file_exists($path)) {
            return;
        }

        foreach ($dependencies as $index => $dependency) {
            if (preg_match('/\.(js|css)$/', $dependency) && file_exists($dependency)) {
                $dependencies[$index] = self::getHandle($dependency);
            }
        }


        $func = 'wp_' . ($enqueue ? 'enqueue' : 'register') . '_' . $type;
        $handle = self::getHandle($path);
        $result = $func($handle, plugins_url(basename($path), $path), $dependencies, filemtime($path), $type === 'script' ? true : $media);

        if ($translations === true) {
            wp_set_script_translations($handle, 'block-designer', PLUGIN_DIR_PATH . 'languages/');
        }

        return $options;
    }

    /**
     * Gets the handle of an asset that registerAsset() uses automatically
     * 
     * @param   STRING        $path          The path that you used with registerAsset()
     * 
     * @return  STRING        The handle name of the asset
     */
    static public function getHandle($path)
    {
        $path = realpath($path);
        $cut = realpath(dirname(realpath(PLUGIN_DIR_PATH)));
        if (strpos($path, $cut) === 0) {
            $path = substr($path, strlen($cut));
            $path = ltrim($path, '\\/');
        }
        return preg_replace('/[^a-zA-Z0-9]+/', '-', $path);
    }
}
