<div class="pdf-chat-documents">
    <h2><?php _e('Group Documents', 'pdf-chat-buddy'); ?></h2>
    
    <?php if (groups_is_user_admin(get_current_user_id(), bp_get_current_group_id())): ?>
        <div class="pdf-chat-upload-form">
            <h3><?php _e('Upload New Document', 'pdf-chat-buddy'); ?></h3>
            <form id="pdf-chat-upload-form" enctype="multipart/form-data">
                <input type="file" name="document" accept=".pdf" required>
                <input type="text" name="title" placeholder="<?php _e('Document Title', 'pdf-chat-buddy'); ?>" required>
                <textarea name="description" placeholder="<?php _e('Document Description', 'pdf-chat-buddy'); ?>"></textarea>
                <button type="submit"><?php _e('Upload', 'pdf-chat-buddy'); ?></button>
            </form>
        </div>
    <?php endif; ?>
    
    <div class="pdf-chat-documents-list">
        <?php if (!empty($documents)): ?>
            <?php foreach ($documents as $document): ?>
                <div class="pdf-chat-document-item">
                    <h4><?php echo esc_html($document->title); ?></h4>
                    <p><?php echo esc_html($document->description); ?></p>
                    <div class="pdf-chat-document-actions">
                        <a href="#" class="pdf-chat-view-document" data-document-id="<?php echo esc_attr($document->id); ?>">
                            <?php _e('View', 'pdf-chat-buddy'); ?>
                        </a>
                        <?php if (groups_is_user_admin(get_current_user_id(), bp_get_current_group_id())): ?>
                            <a href="#" class="pdf-chat-delete-document" data-document-id="<?php echo esc_attr($document->id); ?>">
                                <?php _e('Delete', 'pdf-chat-buddy'); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p><?php _e('No documents uploaded yet.', 'pdf-chat-buddy'); ?></p>
        <?php endif; ?>
    </div>
</div>