<?php
// Enable CORS for all requests
function add_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
    
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
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'register_pdf_proxy_endpoint');

function proxy_pdf_file($request) {
    $url = $request->get_param('url');
    if (!$url) {
        return new WP_Error('no_url', 'No URL provided', array('status' => 400));
    }

    // Add error logging
    error_log('Proxying PDF from URL: ' . $url);

    $response = wp_remote_get($url);
    if (is_wp_error($response)) {
        error_log('Error fetching PDF: ' . $response->get_error_message());
        return $response;
    }

    $body = wp_remote_retrieve_body($response);
    $content_type = wp_remote_retrieve_header($response, 'content-type');

    // Ensure we're sending PDF content type
    if (empty($content_type)) {
        $content_type = 'application/pdf';
    }

    // Set headers for PDF response
    header('Content-Type: ' . $content_type);
    header('Content-Length: ' . strlen($body));
    header('Content-Disposition: inline; filename="document.pdf"');
    
    echo $body;
    exit;
}