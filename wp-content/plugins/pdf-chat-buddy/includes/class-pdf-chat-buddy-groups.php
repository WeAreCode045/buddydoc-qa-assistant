<?php
class PDF_Chat_Buddy_Groups {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function init() {
        add_action('bp_group_options_nav', array($this, 'add_group_nav_item'));
        add_action('bp_screens', array($this, 'screen_handler'));
    }
    
    public function add_group_nav_item() {
        if (bp_is_group()) {
            $group_link = bp_get_group_permalink(groups_get_current_group());
            
            bp_core_new_subnav_item(array(
                'name' => __('PDF Chat', 'pdf-chat-buddy'),
                'slug' => 'pdf-chat',
                'parent_url' => $group_link,
                'parent_slug' => bp_get_current_group_slug(),
                'screen_function' => array($this, 'display_pdf_chat'),
                'position' => 35,
                'user_has_access' => true
            ));
        }
    }
    
    public function screen_handler() {
        if (bp_is_current_action('pdf-chat')) {
            add_action('bp_template_content', array($this, 'display_content'));
            bp_core_load_template('buddypress/members/single/plugins');
        }
    }
    
    public function display_content() {
        $group_id = bp_get_current_group_id();
        $documents = $this->db->get_group_documents($group_id);
        include PDF_CHAT_BUDDY_PLUGIN_DIR . 'templates/group-documents.php';
    }
}