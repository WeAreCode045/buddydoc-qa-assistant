<?php

if (!defined('ABSPATH')) {
    exit;
}

class ReactAppPlugin {
    private static $instance = null;
    
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Initialize hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueueScripts'));
        add_action('admin_menu', array($this, 'addAdminMenu'));
        add_shortcode('react_app', array($this, 'renderShortcode'));
        
        // Initialize any additional functionality
        $this->initializePlugin();
    }
    
    private function initializePlugin() {
        // Add any initialization code here
    }
    
    public function enqueueScripts() {
        $plugin_url = plugin_dir_url(dirname(__FILE__));
        
        // Enqueue main JS file
        wp_enqueue_script(
            'react-app-main',
            $plugin_url . 'dist/assets/index.js',
            array(),
            '1.0.0',
            true
        );
        
        // Enqueue CSS
        wp_enqueue_style(
            'react-app-styles',
            $plugin_url . 'dist/assets/index.css',
            array(),
            '1.0.0'
        );
        
        // Get current user data
        $current_user = wp_get_current_user();
        
        // Create the data object to inject into window.wpData
        $wp_data = array(
            'userId' => $current_user->ID,
            'userName' => $current_user->display_name,
            'userEmail' => $current_user->user_email,
            'postId' => get_the_ID(),
            'nonce' => wp_create_nonce('wp_rest')
        );
        
        // Inject data into the page
        wp_add_inline_script(
            'react-app-main',
            'window.wpData = ' . json_encode($wp_data) . ';',
            'before'
        );
    }
    
    public function addAdminMenu() {
        add_menu_page(
            'React App Settings',
            'React App',
            'manage_options',
            'react-app-settings',
            array($this, 'renderSettingsPage'),
            'dashicons-admin-generic',
            20
        );
    }
    
    public function renderSettingsPage() {
        ?>
        <div class="wrap">
            <h1>React App Settings</h1>
            <div id="root"></div>
        </div>
        <?php
    }
    
    public function renderShortcode($atts = array()) {
        return '<div id="root"></div>';
    }
}