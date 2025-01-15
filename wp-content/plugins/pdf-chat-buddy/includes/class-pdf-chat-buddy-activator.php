<?php
class PDF_Chat_Buddy_Activator {
    public static function activate() {
        $db = new PDF_Chat_Buddy_DB();
        $db->create_tables();
        
        // Add capabilities
        $role = get_role('administrator');
        $role->add_cap('manage_pdf_chat');
        
        // Create upload directory if it doesn't exist
        $upload_dir = wp_upload_dir();
        $pdf_chat_dir = $upload_dir['basedir'] . '/pdf-chat-buddy';
        
        if (!file_exists($pdf_chat_dir)) {
            wp_mkdir_p($pdf_chat_dir);
        }
    }
}