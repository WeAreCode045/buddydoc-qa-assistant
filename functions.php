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

// Add PDF download and storage endpoint
function register_pdf_endpoints() {
    register_rest_route('pdf-proxy/v1', '/store-pdf', array(
        'methods' => 'POST',
        'callback' => 'store_pdf_file',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('pdf-proxy/v1', '/get-pdf/(?P<filename>[^/]+)', array(
        'methods' => 'GET',
        'callback' => 'get_stored_pdf',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'register_pdf_endpoints');

function store_pdf_file($request) {
    $url = $request->get_param('url');
    if (!$url) {
        return new WP_Error('no_url', 'No URL provided', array('status' => 400));
    }

    // Create upload directory if it doesn't exist
    $upload_dir = wp_upload_dir();
    $pdf_dir = $upload_dir['basedir'] . '/stored_pdfs';
    if (!file_exists($pdf_dir)) {
        wp_mkdir_p($pdf_dir);
    }

    // Generate unique filename
    $filename = 'pdf_' . uniqid() . '.pdf';
    $file_path = $pdf_dir . '/' . $filename;

    // Download and store the PDF
    $response = wp_remote_get($url);
    if (is_wp_error($response)) {
        return $response;
    }

    $pdf_content = wp_remote_retrieve_body($response);
    if (file_put_contents($file_path, $pdf_content)) {
        return array(
            'success' => true,
            'filename' => $filename,
            'url' => $upload_dir['baseurl'] . '/stored_pdfs/' . $filename
        );
    }

    return new WP_Error('storage_failed', 'Failed to store PDF', array('status' => 500));
}

function get_stored_pdf($request) {
    $filename = $request->get_param('filename');
    if (!$filename) {
        return new WP_Error('no_filename', 'No filename provided', array('status' => 400));
    }

    $upload_dir = wp_upload_dir();
    $file_path = $upload_dir['basedir'] . '/stored_pdfs/' . $filename;

    if (!file_exists($file_path)) {
        return new WP_Error('file_not_found', 'PDF file not found', array('status' => 404));
    }

    $content = file_get_contents($file_path);
    header('Content-Type: application/pdf');
    echo $content;
    exit;
}