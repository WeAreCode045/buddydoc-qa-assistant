<?php
// Enable CORS for all requests
function add_cors_headers() {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit();
    }
}
add_action('init', 'add_cors_headers');



    $body = wp_remote_retrieve_body($response);
    $content_type = wp_remote_retrieve_header($response, 'content-type');


    // Set headers for PDF response
    header('Content-Type: ' . $content_type);
    header('Content-Length: ' . strlen($body));
    header('Content-Disposition: inline; filename="document.pdf"');
    
    echo $body;
    exit;
}