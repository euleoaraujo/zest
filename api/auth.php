<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Lê dados enviados em JSON ou POST form
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?? $_POST;

// Garante migração da coluna daily_goal na tabela users do MySQL
try {
    $colCheck = $pdo->query("SHOW COLUMNS FROM `users` LIKE 'daily_goal'");
    if ($colCheck && $colCheck->rowCount() === 0) {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `daily_goal` DECIMAL(10,2) NOT NULL DEFAULT 350.00");
    }
} catch (Exception $e) {
    // Silencioso se tabela não existir
}

try {
    switch ($action) {
        case 'signup':
            $name = trim($data['name'] ?? '');
            $email = strtolower(trim($data['email'] ?? ''));
            $password = trim($data['password'] ?? '');

            if (empty($name) || empty($email) || empty($password)) {
                echo json_encode(["success" => false, "message" => "Preencha todos os campos obrigatórios."]);
                exit;
            }

            // Verifica se e-mail já existe
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(["success" => false, "message" => "Este e-mail já está cadastrado."]);
                exit;
            }

            // Insere novo usuário na tabela users do MySQL com meta diária padrão de 350.00
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, daily_goal, created_at) VALUES (?, ?, ?, 350.00, NOW())");
            $stmt->execute([$name, $email, $password]);
            $newUserId = (int)$pdo->lastInsertId();

            // Atualiza sessão ativa
            $sessStmt = $pdo->prepare("REPLACE INTO session (id, user_id) VALUES (1, ?)");
            $sessStmt->execute([$newUserId]);

            // Busca o usuário inserido
            $userStmt = $pdo->prepare("SELECT id, name, email, daily_goal, created_at FROM users WHERE id = ?");
            $userStmt->execute([$newUserId]);
            $user = $userStmt->fetch();

            echo json_encode([
                "success" => true,
                "message" => "Conta criada com sucesso!",
                "user" => [
                    "id" => (int)$user['id'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "daily_goal" => isset($user['daily_goal']) ? (float)$user['daily_goal'] : 350.0,
                    "created_at" => $user['created_at'],
                ]
            ]);
            break;

        case 'login':
            $email = strtolower(trim($data['email'] ?? ''));
            $password = trim($data['password'] ?? '');

            if (empty($email) || empty($password)) {
                echo json_encode(["success" => false, "message" => "Informe e-mail e senha."]);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id, name, email, password, daily_goal, created_at FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                echo json_encode([
                    "success" => false,
                    "notFound" => true,
                    "message" => "Conta não encontrada com este e-mail."
                ]);
                exit;
            }

            if ($user['password'] !== $password) {
                echo json_encode([
                    "success" => false,
                    "notFound" => false,
                    "message" => "Senha incorreta. Verifique e tente novamente."
                ]);
                exit;
            }

            // Atualiza sessão ativa
            $sessStmt = $pdo->prepare("REPLACE INTO session (id, user_id) VALUES (1, ?)");
            $sessStmt->execute([(int)$user['id']]);

            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => (int)$user['id'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "daily_goal" => isset($user['daily_goal']) ? (float)$user['daily_goal'] : 350.0,
                    "created_at" => $user['created_at'],
                ]
            ]);
            break;

        case 'reset_password':
            $email = strtolower(trim($data['email'] ?? ''));
            $newPassword = trim($data['password'] ?? '');

            if (empty($email) || empty($newPassword)) {
                echo json_encode(["success" => false, "message" => "Dados insuficientes para redefinir senha."]);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                echo json_encode(["success" => false, "message" => "E-mail não encontrado no sistema."]);
                exit;
            }

            $upd = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $upd->execute([$newPassword, $user['id']]);

            echo json_encode(["success" => true, "message" => "Senha atualizada com sucesso!"]);
            break;

        case 'social_login':
            $provider = strtolower(trim($data['provider'] ?? 'google'));
            $email = $provider === 'apple' ? 'usuario.apple@zest.app' : 'usuario.google@zest.app';
            $name = $provider === 'apple' ? 'Usuário Apple' : 'Usuário Google';
            $dummyPassword = bin2hex(random_bytes(8));

            $stmt = $pdo->prepare("SELECT id, name, email, daily_goal, created_at FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                $ins = $pdo->prepare("INSERT INTO users (name, email, password, daily_goal, created_at) VALUES (?, ?, ?, 350.00, NOW())");
                $ins->execute([$name, $email, $dummyPassword]);
                $userId = (int)$pdo->lastInsertId();

                $user = [
                    "id" => $userId,
                    "name" => $name,
                    "email" => $email,
                    "daily_goal" => 350.0,
                    "created_at" => date('Y-m-d H:i:s'),
                ];
            }

            // Atualiza sessão ativa
            $sessStmt = $pdo->prepare("REPLACE INTO session (id, user_id) VALUES (1, ?)");
            $sessStmt->execute([(int)$user['id']]);

            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => (int)$user['id'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "daily_goal" => isset($user['daily_goal']) ? (float)$user['daily_goal'] : 350.0,
                    "created_at" => $user['created_at'],
                ]
            ]);
            break;

        case 'check_session':
            $stmt = $pdo->prepare("
                SELECT u.id, u.name, u.email, u.daily_goal, u.created_at 
                FROM session s 
                JOIN users u ON s.user_id = u.id 
                WHERE s.id = 1 
                LIMIT 1
            ");
            $stmt->execute();
            $user = $stmt->fetch();

            if ($user) {
                echo json_encode([
                    "success" => true,
                    "authenticated" => true,
                    "user" => [
                        "id" => (int)$user['id'],
                        "name" => $user['name'],
                        "email" => $user['email'],
                        "daily_goal" => isset($user['daily_goal']) ? (float)$user['daily_goal'] : 350.0,
                        "created_at" => $user['created_at'],
                    ]
                ]);
            } else {
                echo json_encode(["success" => true, "authenticated" => false, "user" => null]);
            }
            break;

        case 'update_profile':
            $id = (int)($data['id'] ?? 0);
            $name = trim($data['name'] ?? '');
            $email = strtolower(trim($data['email'] ?? ''));
            $newPassword = trim($data['password'] ?? '');

            if ($id <= 0 || empty($name) || empty($email)) {
                echo json_encode(["success" => false, "message" => "Dados inválidos para atualização."]);
                exit;
            }

            // Verifica se e-mail já pertence a outro usuário
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
            $checkStmt->execute([$email, $id]);
            if ($checkStmt->fetch()) {
                echo json_encode(["success" => false, "message" => "Este e-mail já está sendo utilizado por outro usuário."]);
                exit;
            }

            if (!empty($newPassword)) {
                $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?");
                $stmt->execute([$name, $email, $newPassword, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
                $stmt->execute([$name, $email, $id]);
            }

            $fetchStmt = $pdo->prepare("SELECT id, name, email, daily_goal, created_at FROM users WHERE id = ?");
            $fetchStmt->execute([$id]);
            $updatedUser = $fetchStmt->fetch();

            echo json_encode([
                "success" => true,
                "message" => "Dados atualizados com sucesso!",
                "user" => [
                    "id" => (int)$updatedUser['id'],
                    "name" => $updatedUser['name'],
                    "email" => $updatedUser['email'],
                    "daily_goal" => isset($updatedUser['daily_goal']) ? (float)$updatedUser['daily_goal'] : 350.0,
                    "created_at" => $updatedUser['created_at'],
                ]
            ]);
            break;

        case 'update_goal':
            $userId = (int)($data['user_id'] ?? 0);
            $dailyGoal = (float)($data['daily_goal'] ?? 0);

            if ($userId <= 0 || $dailyGoal <= 0) {
                echo json_encode(["success" => false, "message" => "Dados inválidos para meta diária."]);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE users SET daily_goal = ? WHERE id = ?");
            $stmt->execute([$dailyGoal, $userId]);

            echo json_encode([
                "success" => true,
                "message" => "Meta diária atualizada com sucesso.",
                "daily_goal" => $dailyGoal
            ]);
            break;

        case 'logout':
            $pdo->exec("DELETE FROM session WHERE id = 1");
            echo json_encode(["success" => true, "message" => "Sessão encerrada."]);
            break;

        default:
            echo json_encode(["success" => false, "message" => "Ação inválida: '$action'."]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
