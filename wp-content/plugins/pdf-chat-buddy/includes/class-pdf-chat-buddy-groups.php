<?php
class PDF_Chat_Buddy_Groups {
    private $db;
    
    public function __construct() {
        $this->db = new PDF_Chat_Buddy_DB();
    }
    
    public function render_documents_tab() {
        if (!bp_is_group()) {
            return;
        }
        
        $group_id = bp_get_current_group_id();
        $documents = $this->db->get_group_documents($group_id);
        
        include plugin_dir_path(__FILE__) . '../templates/documents-tab.php';
    }
    
    public function can_user_manage_documents($user_id, $group_id) {
        return groups_is_user_admin($user_id, $group_id);
    }
}