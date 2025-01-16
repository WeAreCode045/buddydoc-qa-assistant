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
 * Requires BuddyBoss: 2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('PDF_CHAT_BUDDY_VERSION', '1.0.0');
define('PDF_CHAT_BUDDY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PDF_CHAT_BUDDY_PLUGIN_URL', plugin_dir_url(__FILE__));

// Check if BuddyBoss Platform is active
function pdf_chat_buddy_check_buddyboss() {
    if (!function_exists('bp_get_option')) {
        add_action('admin_notices', function() {
            echo '<div class="error"><p>' . __('PDF Chat Buddy requires BuddyBoss Platform to be installed and activated.', 'pdf-chat-buddy') . '</p></div>';
        });
        return false;
    }
    return true;
}

// Initialize plugin only if BuddyBoss is active
if (pdf_chat_buddy_check_buddyboss()) {
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
            
            // Add BuddyBoss specific data to JavaScript
            add_action('wp_footer', array($this, 'add_bb_data'));
        }
        
        public function enqueue_scripts() {
            if (bp_is_group()) {
                wp_enqueue_script(
                    'pdf-chat-buddy-react',
                    PDF_CHAT_BUDDY_PLUGIN_URL . 'dist/assets/index.js',
                    array(),
                    PDF_CHAT_BUDDY_VERSION,
                    true
                );
            }
        }
        
        public function add_bb_data() {
            if (bp_is_group()) {
                $current_user = wp_get_current_user();
                ?>
                <script>
                    window.bbChatBuddy = {
                        current_user_id: '<?php echo esc_js($current_user->ID); ?>',
                        current_user_name: '<?php echo esc_js($current_user->display_name); ?>',
                        current_group_id: '<?php echo esc_js(bp_get_current_group_id()); ?>',
                        current_post_id: '<?php echo esc_js(get_the_ID()); ?>'
                    };
                </script>
                <?php
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
}