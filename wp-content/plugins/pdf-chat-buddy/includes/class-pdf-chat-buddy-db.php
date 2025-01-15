<?php
class PDF_Chat_Buddy_DB {
    private $db;
    private $documents_table;
    private $access_log_table;
    
    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
        $this->documents_table = $this->db->prefix . 'pdf_chat_documents';
        $this->access_log_table = $this->db->prefix . 'pdf_chat_access_log';
    }
    
    public function create_tables() {
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $charset_collate = $this->db->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$this->documents_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            group_id bigint(20) NOT NULL,
            wp_attachment_id bigint(20) NOT NULL,
            title varchar(255) NOT NULL,
            description text,
            uploaded_by bigint(20) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY group_id (group_id),
            KEY wp_attachment_id (wp_attachment_id),
            KEY uploaded_by (uploaded_by)
        ) $charset_collate;";
        
        dbDelta($sql);
        
        $sql = "CREATE TABLE IF NOT EXISTS {$this->access_log_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            document_id bigint(20) NOT NULL,
            user_id bigint(20) NOT NULL,
            accessed_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY document_id (document_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        dbDelta($sql);
    }
    
    public function get_group_documents($group_id) {
        return $this->db->get_results(
            $this->db->prepare(
                "SELECT * FROM {$this->documents_table} WHERE group_id = %d",
                $group_id
            )
        );
    }
    
    public function add_document($data) {
        return $this->db->insert($this->documents_table, $data);
    }
    
    public function delete_document($id, $group_id) {
        return $this->db->delete(
            $this->documents_table,
            array('id' => $id, 'group_id' => $group_id),
            array('%d', '%d')
        );
    }
    
    public function log_access($document_id, $user_id) {
        return $this->db->insert(
            $this->access_log_table,
            array(
                'document_id' => $document_id,
                'user_id' => $user_id
            )
        );
    }
}