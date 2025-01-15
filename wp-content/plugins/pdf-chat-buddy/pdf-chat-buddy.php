<?php
/**
 * Plugin Name: PDF Chat Buddy
 * Plugin URI: https://your-domain.com/pdf-chat-buddy
 * Description: A PDF chat system for BuddyBoss groups
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://your-domain.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: pdf-chat-buddy
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

class PDF_Chat_Buddy {
    private static $instance = null;
    private $db;
    private $plugin_path;
    private $plugin_url;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        global $wpdb;
        $this->db = $wpdb;
        $this->plugin_path = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);
        
        $this->init_hooks();
        $this->init_includes();
    }
    
    private function init_hooks() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        add_action('bp_init', array($this, 'init_buddypress_integration'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    private function init_includes() {
        require_once $this->plugin_path . 'includes/class-pdf-chat-buddy-db.php';
        require_once $this->plugin_path . 'includes/class-pdf-chat-buddy-api.php';
        require_once $this->plugin_path . 'includes/class-pdf-chat-buddy-groups.php';
    }
    
    public function activate() {
        require_once $this->plugin_path . 'includes/class-pdf-chat-buddy-activator.php';
        PDF_Chat_Buddy_Activator::activate();
    }
    
    public function deactivate() {
        // Cleanup if needed
    }
    
    public function init_buddypress_integration() {
        if (!function_exists('bp_is_active')) {
            return;
        }
        
        // Add BuddyPress specific hooks
        add_action('bp_group_documents_tab', array($this, 'render_documents_tab'));
        bp_core_new_nav_item(array(
            'name' => __('PDF Chat', 'pdf-chat-buddy'),
            'slug' => 'pdf-chat',
            'position' => 100,
            'screen_function' => array($this, 'display_pdf_chat_screen')
        ));
    }
    
    public function register_rest_routes() {
        $api = new PDF_Chat_Buddy_API();
        $api->register_routes();
    }
    
    public function enqueue_scripts() {
        if (bp_is_group()) {
            wp_enqueue_script(
                'pdf-chat-buddy',
                $this->plugin_url . 'assets/js/pdf-chat-buddy.js',
                array('jquery'),
                '1.0.0',
                true
            );
            
            wp_localize_script('pdf-chat-buddy', 'pdfChatBuddySettings', array(
                'apiUrl' => rest_url('pdf-chat-buddy/v1'),
                'nonce' => wp_create_nonce('wp_rest'),
                'groupId' => bp_get_current_group_id()
            ));
        }
    }
    
    public function display_pdf_chat_screen() {
        add_action('bp_template_content', array($this, 'display_pdf_chat_content'));
        bp_core_load_template('buddypress/members/single/plugins');
    }
    
    public function display_pdf_chat_content() {
        include $this->plugin_path . 'templates/pdf-chat-content.php';
    }
}

// Initialize the plugin
function pdf_chat_buddy_init() {
    PDF_Chat_Buddy::get_instance();
}
add_action('plugins_loaded', 'pdf_chat_buddy_init');