<?php
class PDF_Chat_Buddy_Activator {
    public static function activate() {
        if (!class_exists('BuddyPress')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die(__('This plugin requires BuddyPress to be installed and active.', 'pdf-chat-buddy'));
        }
        
        $db = new PDF_Chat_Buddy_DB();
        $db->create_tables();
        
        // Add capabilities
        $role = get_role('administrator');
        $role->add_cap('manage_pdf_chat');
        
        // Create upload directory
        $upload_dir = wp_upload_dir();
        $pdf_chat_dir = $upload_dir['basedir'] . '/pdf-chat-buddy';
        
        if (!file_exists($pdf_chat_dir)) {
            wp_mkdir_p($pdf_chat_dir);
        }
        
        flush_rewrite_rules();
    }
}