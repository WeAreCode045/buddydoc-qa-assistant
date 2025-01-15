<?php
class PDF_Chat_Buddy_API {
    private $namespace = 'pdf-chat-buddy/v1';
    private $db;
    
    public function __construct() {
        $this->db = new PDF_Chat_Buddy_DB();
    }
    
    public function register_routes() {
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
        
        register_rest_route($this->namespace, '/documents/(?P<group_id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'add_document'),
            'permission_callback' => array($this, 'check_group_admin_permissions')
        ));
        
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
    
    public function add_document($request) {
        $group_id = $request->get_param('group_id');
        $attachment_id = $request->get_param('attachment_id');
        $title = $request->get_param('title');
        $description = $request->get_param('description');
        
        $data = array(
            'group_id' => $group_id,
            'wp_attachment_id' => $attachment_id,
            'title' => $title,
            'description' => $description,
            'uploaded_by' => get_current_user_id()
        );
        
        $result = $this->db->add_document($data);
        
        if ($result) {
            return new WP_REST_Response(array('message' => 'Document added successfully'), 201);
        }
        
        return new WP_REST_Response(array('message' => 'Failed to add document'), 500);
    }
    
    public function delete_document($request) {
        $group_id = $request->get_param('group_id');
        $document_id = $request->get_param('document_id');
        
        $result = $this->db->delete_document($document_id, $group_id);
        
        if ($result) {
            return new WP_REST_Response(array('message' => 'Document deleted successfully'), 200);
        }
        
        return new WP_REST_Response(array('message' => 'Failed to delete document'), 500);
    }
}