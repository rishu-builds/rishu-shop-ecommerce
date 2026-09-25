<?php
// Rishu Shop - Main Storefront Entry Point
if (file_exists(__DIR__ . '/index.html')) {
    include_once __DIR__ . '/index.html';
    exit;
}
header('Location: index.html');
exit;

