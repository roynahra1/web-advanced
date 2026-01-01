-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 29, 2025 at 11:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `appointment`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `patient_name` varchar(100) NOT NULL,
  `time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `date`, `doctor_id`, `patient_name`, `time`) VALUES
(14, '2025-12-11', 1, 'hicham', '04:44:00'),
(18, '2025-12-17', 10, 'ghazal', '15:43:00'),
(20, '2025-12-10', 12, 'Hisham', '23:50:00');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `role`, `email`, `password`) VALUES
(1, 'Dr John', 'Cardiologist', '', ''),
(10, 'farah wehbi', '', 'farah@gmail.com', '$2b$10$XpBSu3MatFeZ6zAaU2HFqefxX6C2i/NpUMpepokXuhZI6GF9hR4fm'),
(11, 'roy nahra', '', 'roy@gmail.com', '$2b$10$7a7OPA9N.wTjjW9fhZJzmOVI7YUsG2J0CttGMMiIYKIa7dHvRPAeK'),
(12, 'Fahed Chmeissani', '', 'fahedsho@gmail.com', '$2b$10$LjBZxj5efF2s7sx8amn7YusWe0uqGOjv2iz4Gw7MuI0V0jYFsDW72'),
(13, 'hich we', '', 'user1@gmail.com', '$2b$10$oCGEbvmzCDpYp5peCzzFYumawmTyspR6LNp/BT5rsqyrYb2vT7V52');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(200) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `first_name`, `last_name`, `password`) VALUES
(1, 'test@example.com', 'Hicham', 'Wehbi', '$2b$10$32xmyVJU6Vdyiu7DoyBpf.HVk6gh7oSG0Ah4kG7YsSdL8J/08Rlr.'),
(6, 'hich@gmail.com', 'hich', 'we', '$2b$10$jKCYAUKyCNWCfsduyK9vw.OjdFZHPBy8/UVK93l5jOdisdYusujKG'),
(7, 'faheduser@gmail.com', 'faheduser', 'sho', '$2b$10$uY08UGLCfZ6qVVH3OnBQVeozv53G5bKwQybeh9zQNvEneMw1DC8zy');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `app_doctor_id_fk` (`doctor_id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `app_doctor_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
