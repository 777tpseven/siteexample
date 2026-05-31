<?php

require __DIR__ . '/bootstrap.php';

auth_require_admin_panel_access();

try {
    $payload = [
        'ok' => true,
        'recentLogins' => [
            'available' => false,
            'items' => [],
        ],
    ];

    try {
        $pdo = auth_mysql_pdo();
        auth_ensure_web_sessions_schema($pdo);

        if (auth_table_exists($pdo, 'web_sessions')) {
            $stmt = $pdo->query(
                "SELECT discord_id, username, avatar, roles, last_seen
                 FROM web_sessions
                 ORDER BY last_seen DESC
                 LIMIT 10"
            );

            $payload['recentLogins']['available'] = true;
            $payload['recentLogins']['items'] = array_map(static function (array $row): array {
                $roles = json_decode((string) ($row['roles'] ?? '[]'), true);
                $roleCount = is_array($roles) ? count($roles) : 0;

                return [
                    'discordId' => (string) ($row['discord_id'] ?? ''),
                    'username' => (string) ($row['username'] ?? ''),
                    'avatar' => (string) ($row['avatar'] ?? ''),
                    'lastSeen' => (string) ($row['last_seen'] ?? ''),
                    'roleCount' => $roleCount,
                ];
            }, $stmt->fetchAll() ?: []);
        }
    } catch (Throwable $e) {
        $payload['recentLogins']['available'] = false;
    }

    if (!$payload['recentLogins']['available']) {
        $fallbackItems = auth_read_web_sessions_fallback(10);
        if ($fallbackItems) {
            $payload['recentLogins']['available'] = true;
            $payload['recentLogins']['items'] = array_map(static function (array $row): array {
                $roles = $row['roles'] ?? [];
                $roleCount = is_array($roles) ? count($roles) : 0;

                return [
                    'discordId' => (string) ($row['discord_id'] ?? ''),
                    'username' => (string) ($row['username'] ?? ''),
                    'avatar' => (string) ($row['avatar'] ?? ''),
                    'lastSeen' => (string) ($row['last_seen'] ?? ''),
                    'roleCount' => $roleCount,
                ];
            }, $fallbackItems);
        }
    }

    auth_send_json($payload);
} catch (Throwable $e) {
    auth_send_json([
        'ok' => false,
        'error' => 'admin_overview_failed',
    ], 500);
}
