<?php
require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? '';
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?? $_POST;

try {
    // Auto-migração para adicionar a coluna user_id na tabela expenses caso ainda não exista
    $colCheck = $pdo->query("SHOW COLUMNS FROM expenses LIKE 'user_id'")->fetch();
    if (!$colCheck) {
        $pdo->exec("ALTER TABLE expenses ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id");
    }
} catch (Exception $e) {}

function getUserId($pdo, $data) {
    if (!empty($data['user_id']) && (int)$data['user_id'] > 0) {
        return (int)$data['user_id'];
    }
    if (!empty($_GET['user_id']) && (int)$_GET['user_id'] > 0) {
        return (int)$_GET['user_id'];
    }
    try {
        $s = $pdo->query("SELECT user_id FROM session WHERE id = 1 LIMIT 1")->fetch();
        if ($s && !empty($s['user_id'])) {
            return (int)$s['user_id'];
        }
    } catch (Exception $e) {}
    return 1;
}

try {
    switch ($action) {
        case 'list':
            $userId = getUserId($pdo, $data);
            $stmt = $pdo->prepare("
                SELECT 
                    e.id,
                    e.user_id,
                    CAST(e.amount AS DECIMAL(10,2)) as amount,
                    e.category_id,
                    e.description,
                    e.created_at,
                    c.name as category_name,
                    c.icon as category_icon,
                    c.color as category_color,
                    c.is_shortcut as category_is_shortcut
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.user_id = ?
                ORDER BY e.created_at DESC
            ");
            $stmt->execute([$userId]);
            $rows = $stmt->fetchAll();

            $expenses = array_map(function($r) {
                return [
                    "id" => (int)$r['id'],
                    "user_id" => (int)($r['user_id'] ?? 1),
                    "amount" => (float)$r['amount'],
                    "category_id" => (int)$r['category_id'],
                    "description" => $r['description'] ?? '',
                    "created_at" => $r['created_at'],
                    "category" => [
                        "id" => (int)$r['category_id'],
                        "name" => $r['category_name'],
                        "icon" => $r['category_icon'],
                        "color" => $r['category_color'],
                        "is_shortcut" => (int)$r['category_is_shortcut']
                    ]
                ];
            }, $rows);

            echo json_encode(["success" => true, "expenses" => $expenses]);
            break;

        case 'add':
            $amount = (float)($data['amount'] ?? 0);
            $categoryId = (int)($data['category_id'] ?? 0);
            $description = trim($data['description'] ?? '');
            $userId = getUserId($pdo, $data);

            if ($amount <= 0 || $categoryId <= 0) {
                echo json_encode(["success" => false, "message" => "Valor ou categoria inválidos."]);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO expenses (user_id, amount, category_id, description, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->execute([$userId, $amount, $categoryId, $description]);
            $expenseId = (int)$pdo->lastInsertId();

            $fetchStmt = $pdo->prepare("
                SELECT 
                    e.id,
                    e.user_id,
                    CAST(e.amount AS DECIMAL(10,2)) as amount,
                    e.category_id,
                    e.description,
                    e.created_at,
                    c.name as category_name,
                    c.icon as category_icon,
                    c.color as category_color,
                    c.is_shortcut as category_is_shortcut
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                WHERE e.id = ?
            ");
            $fetchStmt->execute([$expenseId]);
            $r = $fetchStmt->fetch();

            echo json_encode([
                "success" => true,
                "expense" => [
                    "id" => (int)$r['id'],
                    "user_id" => (int)($r['user_id'] ?? $userId),
                    "amount" => (float)$r['amount'],
                    "category_id" => (int)$r['category_id'],
                    "description" => $r['description'] ?? '',
                    "created_at" => $r['created_at'],
                    "category" => [
                        "id" => (int)$r['category_id'],
                        "name" => $r['category_name'],
                        "icon" => $r['category_icon'],
                        "color" => $r['category_color'],
                        "is_shortcut" => (int)$r['category_is_shortcut']
                    ]
                ]
            ]);
            break;

        case 'delete':
            $id = (int)($data['id'] ?? $_GET['id'] ?? 0);
            $userId = !empty($data['user_id']) ? (int)$data['user_id'] : (!empty($_GET['user_id']) ? (int)$_GET['user_id'] : 0);
            if ($id <= 0) {
                echo json_encode(["success" => false, "message" => "ID inválido."]);
                exit;
            }

            if ($userId > 0) {
                $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
                $stmt->execute([$id, $userId]);
            } else {
                $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
                $stmt->execute([$id]);
            }

            echo json_encode(["success" => true, "message" => "Despesa removida com sucesso."]);
            break;

        case 'categories':
            $stmt = $pdo->query("SELECT id, name, icon, color, is_shortcut FROM categories ORDER BY id ASC");
            $categories = array_map(function($c) {
                return [
                    "id" => (int)$c['id'],
                    "name" => $c['name'],
                    "icon" => $c['icon'],
                    "color" => $c['color'],
                    "is_shortcut" => (int)$c['is_shortcut']
                ];
            }, $stmt->fetchAll());

            echo json_encode(["success" => true, "categories" => $categories]);
            break;

        default:
            echo json_encode(["success" => false, "message" => "Ação não reconhecida."]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
