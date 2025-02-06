<?php
require './../db.php';
require './../remote_db.php';

function syncUsers()
{
    global $conn, $remoteConn;

    $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE synced = 0");
    $stmt->execute();
    $users = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    if (empty($users)) {
        echo "No new users to sync.\n";
        return;
    }

    foreach ($users as $user) {
        $mappedData = mapUserToAccount($user);

        $stmt = $remoteConn->prepare("SELECT id FROM accounts WHERE email = ?");
        $stmt->bind_param("s", $mappedData['email']);
        $stmt->execute();
        $existingUser = $stmt->get_result()->fetch_assoc();

        if ($existingUser) {
            $stmt = $remoteConn->prepare("UPDATE accounts SET username = ?, created_at = ? WHERE email = ?");
            $stmt->bind_param("sss", $mappedData['username'], $mappedData['created_at'], $mappedData['email']);
        } else {
            $stmt = $remoteConn->prepare("INSERT INTO accounts (username, email, created_at) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $mappedData['username'], $mappedData['email'], $mappedData['created_at']);
        }

        if ($stmt->execute()) {
            $updateStmt = $conn->prepare("UPDATE users SET synced = 1 WHERE id = ?");
            $updateStmt->bind_param("i", $user['id']);
            $updateStmt->execute();
        } else {
            echo "Failed to sync user: " . $user['email'] . "\n";
        }
    }

    echo "User sync completed.\n";
}

function mapUserToAccount($user)
{
    return [
        'username' => $user['username'],
        'email' => $user['email'],
        'created_at' => $user['created_at']
    ];
}

syncUsers();
