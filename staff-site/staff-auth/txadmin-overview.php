<?php
require __DIR__ . '/bootstrap.php';

staff_auth_require_login();

$configuredBaseUrl = staff_auth_txadmin_base_url();
$baseUrl = $configuredBaseUrl !== '' ? $configuredBaseUrl : 'http://185.223.30.214:30583';
$accessLevel = staff_auth_access_level();
$bridgeEnabled = staff_auth_bool_config('txadmin_bridge_enabled', false);
$consoleStaffOnly = staff_auth_bool_config(
    'txadmin_console_staff_only',
    staff_auth_bool_config('txadmin_console_manager_only', true)
);
$baseConfigured = $configuredBaseUrl !== '';
$baseAvailable = $baseUrl !== '';
$requestIsSecure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$mixedContentWarning = $baseAvailable && $requestIsSecure && stripos($baseUrl, 'http://') === 0;

if ($accessLevel !== 'staff_panel') {
    staff_auth_send_json([
        'configured' => true,
        'ok' => false,
        'authorized' => false,
        'accessLevel' => $accessLevel,
        'error' => 'insufficient_access',
    ], 403);
}

$links = [
    'home' => $baseAvailable ? $baseUrl . '/' : '',
    'players' => $baseAvailable ? $baseUrl . '/login?r=%2Fplayers' : '',
    'console' => $baseAvailable && (!$consoleStaffOnly || $accessLevel === 'staff_panel')
        ? $baseUrl . '/login?r=%2Fconsole'
        : '',
];

$capabilities = [];
if ($baseAvailable) {
    $capabilities[] = 'launch';
    $capabilities[] = 'players';
}
if ($bridgeEnabled) {
    $capabilities[] = 'bridge_status';
    $capabilities[] = 'bridge_resources';
    $capabilities[] = 'bridge_players';
}
if ($accessLevel === 'staff_panel') {
    $capabilities[] = 'console';
}

$notes = [];
if (!$baseConfigured) {
    $notes[] = 'Runtime tools are using the current site fallback URL. Move it into staff-auth/config.php later so the bridge setup stays explicit.';
}
if ($mixedContentWarning) {
    $notes[] = 'Runtime tools are currently using http://, so the staff site should keep opening them in a new tab until the secure backend bridge is added.';
}
if (!$bridgeEnabled) {
    $notes[] = 'The in-portal runtime bridge is still prepared only. Add secrets later on the backend, not in the browser.';
}
$notes[] = 'Staff Panel access is ready for the future secure console bridge.';

staff_auth_send_json([
    'configured' => true,
    'ok' => true,
    'authorized' => true,
    'accessLevel' => $accessLevel,
    'bridgeEnabled' => $bridgeEnabled,
    'baseUrlConfigured' => $baseConfigured,
    'mixedContentWarning' => $mixedContentWarning,
    'links' => $links,
    'capabilities' => array_values(array_unique($capabilities)),
    'notes' => $notes,
]);
