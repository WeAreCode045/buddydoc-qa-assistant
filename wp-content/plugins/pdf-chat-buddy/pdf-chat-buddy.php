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

// Define plugin constants
define('PDF_CHAT_BUDDY_VERSION', '1.0.0');
define('PDF_CHAT_BUDDY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PDF_CHAT_BUDDY_PLUGIN_URL', plugin_dir_url(__FILE__));

// Require core plugin files
require_once PDF_CHAT_BUDDY_PLUGIN_DIR . 'includes/class-pdf-chat-buddy-activator.php';
require_once PDF_CHAT_BUDDY_PLUGIN_DIR . 'includes/class-pdf-chat-buddy-db.php';
require_once PDF_CHAT_BUDDY_PLUGIN_DIR . 'includes/class-pdf-chat-buddy-api.php';
require_once PDF_CHAT_BUDDY_PLUGIN_DIR . 'includes/class-pdf-chat-buddy-groups.php';

class PDF_Chat_Buddy {
    private static $instance = null;
    private $db;
    private $api;
    private $groups;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->db = new PDF_Chat_Buddy_DB();
        $this->api = new PDF_Chat_Buddy_API($this->db);
        $this->groups = new PDF_Chat_Buddy_Groups($this->db);
        
        $this->init_hooks();
    }
    
    private function init_hooks() {
        register_activation_hook(__FILE__, array('PDF_Chat_Buddy_Activator', 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        add_action('bp_init', array($this->groups, 'init'));
        add_action('rest_api_init', array($this->api, 'register_routes'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function enqueue_scripts() {
        if (bp_is_group()) {
            wp_enqueue_script(
                'pdf-chat-buddy',
                PDF_CHAT_BUDDY_PLUGIN_URL . 'assets/js/pdf-chat-buddy.js',
                array('jquery'),
                PDF_CHAT_BUDDY_VERSION,
                true
            );
            
            wp_localize_script('pdf-chat-buddy', 'pdfChatBuddySettings', array(
                'apiUrl' => rest_url('pdf-chat-buddy/v1'),
                'nonce' => wp_create_nonce('wp_rest'),
                'groupId' => bp_get_current_group_id()
            ));
        }
    }
    
    public function deactivate() {
        // Cleanup if needed
    }
}

// Initialize the plugin
function pdf_chat_buddy_init() {
    PDF_Chat_Buddy::get_instance();
}
add_action('plugins_loaded', 'pdf_chat_buddy_init');