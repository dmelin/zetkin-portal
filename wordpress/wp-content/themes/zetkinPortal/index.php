<?php
global $pageTitle;
$current_url = substr('http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'], 0, -1);
$home_url = get_option('home');
if ($current_url == $home_url) {
    $include = __DIR__ . '/templates/frontpage.php';
    $pageTitle = bloginfo();
} else {
    $pageTitle = "Other Content";
    $include = __DIR__ . '/templates/posts.php';
}

get_header();

print_r($pageTitle);
require_once $include;
