<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$now = api_now_iso();
$guildId = trim((string) (
    api_config('discord_guild_id', '') ?:
    getenv('SGCNR_DISCORD_GUILD_ID') ?:
    getenv('DISCORD_GUILD_ID') ?:
    '1463273636353015870'
));
$botToken = trim((string) (
    api_config('discord_bot_token', '') ?:
    getenv('SGCNR_DISCORD_BOT_TOKEN') ?:
    getenv('DISCORD_BOT_TOKEN') ?:
    getenv('DISCORD_TOKEN') ?:
    ''
));
if (stripos($botToken, 'Bot ') === 0) {
    $botToken = trim(substr($botToken, 4));
}
$memberPageLimit = max(1, min(50, (int) (
    api_config('discord_member_page_limit', 20) ?:
    getenv('SGCNR_DISCORD_MEMBER_PAGE_LIMIT') ?:
    20
)));

$staffRoles = [
    '1468383994902085795' => 'Server Owner',
    '1466544688184950955' => 'Lead Manager',
    '1466544754618667242' => 'Manager (Staff)',
    '1466545461489045615' => 'Manager (Community)',
    '1463660725930299496' => 'Lead Admin',
    '1466545753332781208' => 'Admin',
    '1466545781648523480' => 'Lead Moderator',
    '1466545817023414478' => 'Moderator',
    '1467266553459245308' => 'Probationary Moderator',
    '1463276707212558386' => 'Lead Developer',
    '1510023154137956413' => 'Developer',
    '1466546529127891116' => 'Assistant Developer (Map)',
    '1466546554474201272' => 'Assistant Developer (Vehicle)',
    '1490654905663230012' => 'Assistant Developer (Bot)',
    '1490654995232723105' => 'Assistant Developer (Website)',
    '1497307957497430108' => 'Assistant Developer (Livery Editor)',
    '1497308055392751917' => 'Assistant Developer (Clothing Editor)',
    '1463660472183160951' => 'Lead Tester',
    '1466547337563472004' => 'Tester',
    '1467266484400033833' => 'Probationary Tester',
    '1463847952614162585' => 'Lead Translator',
    '1466547138291826839' => 'Translator',
    '1466547914858823885' => 'Lead Security',
    '1466547917056638987' => 'Security (Anti-Cheat)',
    '1466547919950708766' => 'Security (Cyber)',
    '1466548064050483282' => 'Lead Content Creator',
    '1466548065216364675' => 'Content Creator',
];

if ($botToken === '') {
    api_json([
        'ok' => false,
        'configured' => false,
        'botStatus' => [
            'status' => 'pending',
            'message' => 'Discord bot token is not configured on the server.',
            'latencyMs' => null,
            'checkedAt' => $now,
        ],
        'guild' => [
            'id' => $guildId,
            'name' => api_config('default_guild_name', 'SGCNR'),
            'totalMembers' => null,
            'onlineMembers' => null,
        ],
        'staffRoles' => array_map(static fn (string $id, string $name): array => [
            'id' => $id,
            'name' => $name,
            'count' => 0,
            'members' => [],
        ], array_keys($staffRoles), array_values($staffRoles)),
        'staffMembers' => [],
        '_meta' => [
            'lastPushAt' => $now,
            'lastSource' => 'Discord live endpoint',
            'memberError' => 'missing_bot_token',
        ],
    ]);
}

function discord_live_request(string $path, string $token, array $query = []): array
{
    $url = 'https://discord.com/api/v10' . $path;
    if ($query) {
        $url .= '?' . http_build_query($query);
    }

    $started = microtime(true);
    $headers = [
        'Authorization: Bot ' . $token,
        'Accept: application/json',
        'User-Agent: SGCNRWebsiteLive/1.0',
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 8,
        ]);
        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => implode("\r\n", $headers),
                'timeout' => 8,
                'ignore_errors' => true,
            ],
        ]);
        $raw = @file_get_contents($url, false, $context);
        $statusLine = $http_response_header[0] ?? '';
        preg_match('/\s(\d{3})\s/', $statusLine, $matches);
        $status = isset($matches[1]) ? (int) $matches[1] : 0;
        $error = $raw === false ? 'request_failed' : '';
    }

    $latencyMs = (int) round((microtime(true) - $started) * 1000);
    $data = null;
    if (is_string($raw) && $raw !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $data = $decoded;
        }
    }

    $errorMessage = $error ?: (is_array($data) ? (string) ($data['message'] ?? '') : '');
    if ($errorMessage === '' && ($status < 200 || $status >= 300)) {
        $errorMessage = $status > 0 ? ('HTTP ' . $status) : 'request_failed';
    }

    return [
        'ok' => $status >= 200 && $status < 300,
        'status' => $status,
        'data' => $data,
        'error' => $errorMessage,
        'latencyMs' => $latencyMs,
    ];
}

function discord_live_avatar_url(array $user): string
{
    $id = (string) ($user['id'] ?? '');
    $avatar = (string) ($user['avatar'] ?? '');
    if ($id === '' || $avatar === '') {
        return '';
    }

    $extension = str_starts_with($avatar, 'a_') ? 'gif' : 'png';
    return "https://cdn.discordapp.com/avatars/{$id}/{$avatar}.{$extension}?size=256";
}

function discord_live_member_payload(array $member, array $roleNames): array
{
    $user = is_array($member['user'] ?? null) ? $member['user'] : [];
    $roles = array_values(array_filter(array_map('strval', is_array($member['roles'] ?? null) ? $member['roles'] : [])));
    $matchedRoles = array_values(array_filter($roles, static fn (string $roleId): bool => isset($roleNames[$roleId])));
    $username = (string) ($user['username'] ?? '');
    $globalName = (string) ($user['global_name'] ?? '');
    $nick = (string) ($member['nick'] ?? '');
    $displayName = $nick !== '' ? $nick : ($globalName !== '' ? $globalName : $username);
    $avatarHash = (string) ($user['avatar'] ?? '');
    $avatarUrl = discord_live_avatar_url($user);

    return [
        'id' => (string) ($user['id'] ?? ''),
        'discordId' => (string) ($user['id'] ?? ''),
        'discordUserId' => (string) ($user['id'] ?? ''),
        'username' => $username,
        'displayName' => $displayName !== '' ? $displayName : 'Unknown staff',
        'avatarUrl' => $avatarUrl,
        'discordAvatarUrl' => $avatarUrl,
        'displayAvatarUrl' => $avatarUrl,
        'avatarHash' => $avatarHash,
        'discordAvatarHash' => $avatarHash,
        'joinedAt' => (string) ($member['joined_at'] ?? ''),
        'roleIds' => $matchedRoles,
        'roles' => array_map(static fn (string $roleId): string => $roleNames[$roleId], $matchedRoles),
        'status' => 'offline',
        'isOnline' => false,
        'presenceSynced' => false,
        'hasPresenceData' => false,
    ];
}

$bot = discord_live_request('/users/@me', $botToken);
$guild = $guildId !== '' ? discord_live_request('/guilds/' . rawurlencode($guildId), $botToken, ['with_counts' => 'true']) : [
    'ok' => false,
    'status' => 0,
    'data' => null,
    'error' => 'missing_guild_id',
    'latencyMs' => 0,
];

$members = [];
$memberError = '';
$after = '0';
$pages = 0;
if ($guildId !== '') {
    do {
        $page = discord_live_request('/guilds/' . rawurlencode($guildId) . '/members', $botToken, [
            'limit' => 1000,
            'after' => $after,
        ]);
        if (!$page['ok']) {
            $memberError = $page['error'] ?: ('HTTP ' . $page['status']);
            break;
        }

        $chunk = is_array($page['data']) ? $page['data'] : [];
        foreach ($chunk as $member) {
            if (is_array($member)) {
                $members[] = $member;
            }
        }

        $last = end($chunk);
        $lastUser = is_array($last) && is_array($last['user'] ?? null) ? $last['user'] : [];
        $after = (string) ($lastUser['id'] ?? '');
        $pages++;
    } while (count($chunk) === 1000 && $after !== '' && $pages < $memberPageLimit);
}

$roleGroups = [];
foreach ($staffRoles as $roleId => $name) {
    $roleGroups[$roleId] = [
        'id' => $roleId,
        'name' => $name,
        'count' => 0,
        'members' => [],
    ];
}

$staffMembersById = [];
foreach ($members as $member) {
    $payload = discord_live_member_payload($member, $staffRoles);
    if (!$payload['roleIds']) {
        continue;
    }

    foreach ($payload['roleIds'] as $roleId) {
        $roleGroups[$roleId]['members'][] = $payload;
        $roleGroups[$roleId]['count']++;
    }

    $id = $payload['id'];
    if ($id !== '') {
        if (!isset($staffMembersById[$id])) {
            $staffMembersById[$id] = $payload;
        } else {
            $staffMembersById[$id]['roleIds'] = array_values(array_unique(array_merge($staffMembersById[$id]['roleIds'], $payload['roleIds'])));
            $staffMembersById[$id]['roles'] = array_values(array_unique(array_merge($staffMembersById[$id]['roles'], $payload['roles'])));
        }
    }
}

foreach ($roleGroups as &$group) {
    usort($group['members'], static fn (array $a, array $b): int => strcasecmp($a['displayName'], $b['displayName']));
}
unset($group);

$staffMembers = array_values($staffMembersById);
usort($staffMembers, static fn (array $a, array $b): int => strcasecmp($a['displayName'], $b['displayName']));

$botName = is_array($bot['data']) ? (string) ($bot['data']['username'] ?? 'Discord bot') : 'Discord bot';
$botOk = $bot['ok'] && $guild['ok'];
$guildData = is_array($guild['data']) ? $guild['data'] : [];

api_json([
    'ok' => $botOk,
    'configured' => true,
    'botStatus' => [
        'status' => $botOk ? 'online' : 'offline',
        'message' => $botOk
            ? 'Connected as ' . $botName . '.'
            : (($bot['error'] ?: $guild['error']) ?: 'Discord API check failed.'),
        'latencyMs' => max((int) $bot['latencyMs'], (int) $guild['latencyMs']),
        'checkedAt' => $now,
    ],
    'guild' => [
        'id' => $guildId,
        'name' => (string) ($guildData['name'] ?? api_config('default_guild_name', 'SGCNR')),
        'totalMembers' => $guildData['approximate_member_count'] ?? null,
        'onlineMembers' => $guildData['approximate_presence_count'] ?? null,
    ],
    'staffRoles' => array_values($roleGroups),
    'staffMembers' => $staffMembers,
    '_meta' => [
        'lastPushAt' => $now,
        'lastSource' => 'Discord REST API',
        'memberPages' => $pages,
        'memberError' => $memberError,
        'presenceSource' => 'not_available_from_rest_api',
    ],
]);
