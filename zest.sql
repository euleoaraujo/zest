-- =======================================================
-- Script do Banco de Dados Zest (MySQL / MariaDB)
-- Compatível com Navicat, phpMyAdmin e MySQL Workbench
-- =======================================================

CREATE DATABASE IF NOT EXISTS `zest` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `zest`;

-- Desativa checagem de chaves estrangeiras para recriação limpa
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabela de Usuários
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `daily_goal` DECIMAL(10,2) NOT NULL DEFAULT 350.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Categorias
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `is_shortcut` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Despesas (Gastos)
CREATE TABLE `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL DEFAULT 1,
  `amount` DECIMAL(10,2) NOT NULL,
  `category_id` INT NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_expenses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expenses_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Sessão Ativa
CREATE TABLE `session` (
  `id` INT PRIMARY KEY CHECK (`id` = 1),
  `user_id` INT NOT NULL,
  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção das Categorias Iniciais
INSERT INTO `categories` (`name`, `icon`, `color`, `is_shortcut`) VALUES
('Café', 'cafe', '#D97706', 1),
('Lanche', 'fast-food', '#F97316', 1),
('Transporte', 'car', '#3B82F6', 1),
('Estacionamento', 'car-sport', '#6366F1', 1),
('Mercado', 'cart', '#10B981', 1),
('Farmácia', 'medkit', '#EF4444', 1),
('Lazer', 'game-controller', '#8B5CF6', 0),
('Outros', 'pricetag', '#64748B', 0);

-- Inserção de Usuário Padrão de Demonstração
INSERT INTO `users` (`id`, `name`, `email`, `password`, `daily_goal`, `created_at`) VALUES
(1, 'Usuário Zest', 'usuario@zest.app', '123456', 350.00, NOW());

-- Inserção de Despesas de Exemplo
INSERT INTO `expenses` (`user_id`, `amount`, `category_id`, `description`, `created_at`) VALUES
(1, 15.50, 1, 'Café expresso e pão de queijo', NOW()),
(1, 32.00, 2, 'Lanche da tarde', NOW()),
(1, 12.00, 3, 'Recarga de bilhete / transporte', NOW()),
(1, 48.90, 6, 'Farmácia - vitaminas', NOW());

-- Sessão ativa inicial com o usuário 1
INSERT INTO `session` (`id`, `user_id`) VALUES (1, 1);
