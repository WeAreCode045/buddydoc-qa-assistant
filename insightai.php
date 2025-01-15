<?php
/**
 * Plugin Name: InsightAI
 * Description: An AI-powered document analysis and Q&A assistant
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 */

// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit;
}

// Add menu page
function insightai_add_menu_page() {
    add_menu_page(
        'InsightAI Assistant',
        'InsightAI',
        'manage_options',
        'insightai',
        'insightai_render_app',
        'dashicons-media-document',
        30
    );
}
add_action('admin_menu', 'insightai_add_menu_page');

// Render the React app
function insightai_render_app() {
    $current_user = wp_get_current_user();
    ?>
    <div id="root"></div>
    <script>
        window.wpData = {
            userId: <?php echo json_encode($current_user->ID); ?>,
            userName: <?php echo json_encode($current_user->display_name); ?>,
            userEmail: <?php echo json_encode($current_user->user_email); ?>,
            nonce: <?php echo json_encode(wp_create_nonce('wp_rest')); ?>,
        };
    </script>
    <?php
}

// Enqueue scripts and styles
function insightai_enqueue_scripts() {
    if (!isset($_GET['page']) || $_GET['page'] !== 'insightai') {
        return;
    }

    // Get plugin directory URL
    $plugin_url = plugin_dir_url(__FILE__);
    
    // Enqueue the main assets from the app directory
    wp_enqueue_script('insightai-main', $plugin_url . 'app/dist/assets/index.js', array(), '1.0.0', true);
    wp_enqueue_style('insightai-styles', $plugin_url . 'app/dist/assets/index.css', array(), '1.0.0');
}
add_action('admin_enqueue_scripts', 'insightai_enqueue_scripts');

// Register REST API endpoints
require_once plugin_dir_path(__FILE__) . 'includes/functions.php';

// Activation hook
function insightai_activate() {
    // Create necessary database tables or set up any required data
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'insightai_activate');

// Deactivation hook
function insightai_deactivate() {
    // Clean up any plugin data if necessary
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'insightai_deactivate');