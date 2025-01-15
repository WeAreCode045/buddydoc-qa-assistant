<?php
// Enable CORS for all requests
function add_cors_headers() {
    $origin = get_http_origin();
    if ($origin) {
        header("Access-Control-Allow-Origin: " . esc_url_raw($origin));
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
    }
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit();
    }
}
add_action('init', 'add_cors_headers');

// Add PDF proxy endpoint
function register_pdf_proxy_endpoint() {
    register_rest_route('pdf-proxy/v1', '/proxy-pdf', array(
        'methods' => 'GET',
        'callback' => 'proxy_pdf_file',
        'permission_callback' => '__return_true' // Allow public access
    ));
}
add_action('rest_api_init', 'register_pdf_proxy_endpoint');

function proxy_pdf_file($request) {
    $url = $request->get_param('url');
    if (!$url) {
        return new WP_Error('no_url', 'No URL provided', array('status' => 400));
    }

    // If the URL is local, get the file directly
    $upload_dir = wp_upload_dir();
    $is_local = strpos($url, $upload_dir['baseurl']) === 0;

    if ($is_local) {
        $file_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $url);
        if (!file_exists($file_path)) {
            return new WP_Error('file_not_found', 'File not found', array('status' => 404));
        }
        
        header('Content-Type: application/pdf');
        header('Content-Length: ' . filesize($file_path));
        readfile($file_path);
        exit;
    }

    // For external URLs, proxy the request
    $response = wp_remote_get($url);
    if (is_wp_error($response)) {
        return $response;
    }

    $body = wp_remote_retrieve_body($response);
    $content_type = wp_remote_retrieve_header($response, 'content-type');

    header('Content-Type: ' . $content_type);
    echo $body;
    exit;
}

// Register custom post type for documents
function register_document_post_type() {
    register_post_type('document', array(
        'labels' => array(
            'name' => 'Documents',
            'singular_name' => 'Document'
        ),
        'public' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'menu_icon' => 'dashicons-media-document',
    ));
}
add_action('init', 'register_document_post_type');
