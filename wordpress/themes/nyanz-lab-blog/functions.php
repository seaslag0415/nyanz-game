<?php

if (!defined('ABSPATH')) {
    exit;
}

function nyanz_lab_blog_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('responsive-embeds');
    add_theme_support('wp-block-styles');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
}
add_action('after_setup_theme', 'nyanz_lab_blog_setup');

function nyanz_lab_blog_assets() {
    wp_enqueue_style(
        'nyanz-lab-blog',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'nyanz_lab_blog_assets');
