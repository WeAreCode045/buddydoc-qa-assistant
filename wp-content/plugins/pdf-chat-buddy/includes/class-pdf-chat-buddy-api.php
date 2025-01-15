<?php
class PDF_Chat_Buddy_API {
    private $db;
    private $namespace = 'pdf-chat-buddy/v1';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function register_routes() {
        // Get group documents
        register_rest_route($this->namespace, '/documents/(?P<group_id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_documents'),
            'permission_callback' => array($this, 'check_group_permissions'),
            'args' => array(
                'group_id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));
        
        // Upload document
        register_rest_route($this->namespace, '/documents/(?P<group_id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_document'),
            'permission_callback' => array($this, 'check_group_admin_permissions')
        ));
        
        // Delete document
        register_rest_route($this->namespace, '/documents/(?P<group_id>\d+)/(?P<document_id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_document'),
            'permission_callback' => array($this, 'check_group_admin_permissions')
        ));
    }
    
    public function check_group_permissions($request) {
        $group_id = $request->get_param('group_id');
        return groups_is_user_member(get_current_user_id(), $group_id);
    }
    
    public function check_group_admin_permissions($request) {
        $group_id = $request->get_param('group_id');
        return groups_is_user_admin(get_current_user_id(), $group_id);
    }
    
    public function get_documents($request) {
        $group_id = $request->get_param('group_id');
        $documents = $this->db->get_group_documents($group_id);
        return new WP_REST_Response($documents, 200);
    }
    
    public function upload_document($request) {
        $group_id = $request->get_param('group_id');
        $files = $request->get_file_params();
        
        if (empty($files['file'])) {
            return new WP_Error('no_file', 'No file was uploaded', array('status' => 400));
        }
        
        $file = $files['file'];
        $upload_overrides = array('test_form' => false);
        
        $movefile = wp_handle_upload($file, $upload_overrides);
        
        if ($movefile && !isset($movefile['error'])) {
            $attachment = array(
                'post_mime_type' => $movefile['type'],
                'post_title' => sanitize_file_name($file['name']),
                'post_content' => '',
                'post_status' => 'inherit'
            );
            
            $attach_id = wp_insert_attachment($attachment, $movefile['file']);
            
            if ($attach_id) {
                $document_data = array(
                    'group_id' => $group_id,
                    'wp_attachment_id' => $attach_id,
                    'title' => sanitize_text_field($file['name']),
                    'uploaded_by' => get_current_user_id()
                );
                
                $this->db->add_document($document_data);
                
                return new WP_REST_Response(array(
                    'message' => 'Document uploaded successfully',
                    'attachment_id' => $attach_id
                ), 201);
            }
        }
        
        return new WP_Error('upload_error', 'Failed to upload file', array('status' => 500));
    }
    
    public function delete_document($request) {
        $group_id = $request->get_param('group_id');
        $document_id = $request->get_param('document_id');
        
        $result = $this->db->delete_document($document_id, $group_id);
        
        if ($result) {
            return new WP_REST_Response(array(
                'message' => 'Document deleted successfully'
            ), 200);
        }
        
        return new WP_Error('delete_error', 'Failed to delete document', array('status' => 500));
    }
}