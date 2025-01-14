<?php
/*
Plugin Name: My React App Integration
Description: Integrates React application with WordPress
Version: 1.0
Author: Your Name
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Include the main plugin class
require_once plugin_dir_path(__FILE__) . 'includes/class-react-app-plugin.php';

// Initialize the plugin
function initReactAppPlugin() {
    return ReactAppPlugin::getInstance();
}

// Start the plugin
add_action('plugins_loaded', 'initReactAppPlugin');