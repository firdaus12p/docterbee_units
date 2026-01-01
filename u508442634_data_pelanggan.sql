/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.3-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: u508442634_data_pelanggan
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) DEFAULT NULL COMMENT 'ID anggota yang terkait',
  `action` varchar(50) NOT NULL COMMENT 'Aksi yang dilakukan',
  `details` text DEFAULT NULL COMMENT 'Detail aksi',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP address pengguna',
  `user_agent` text DEFAULT NULL COMMENT 'User agent browser',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Waktu aksi',
  PRIMARY KEY (`id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=448 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log aktivitas sistem';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `activity_log` VALUES
(1,NULL,'INSERT','Anggota baru dibuat: Muh. Firdaus',NULL,NULL,'2025-08-07 12:17:54'),
(2,NULL,'INSERT','Anggota baru dibuat: Mamang racing',NULL,NULL,'2025-08-07 12:29:38'),
(3,NULL,'INSERT','Anggota baru dibuat: Joncena',NULL,NULL,'2025-08-07 12:40:06'),
(4,7,'INSERT','Anggota baru dibuat: ARYA WIBAWA. AR',NULL,NULL,'2025-08-07 12:49:42'),
(5,7,'UPDATE','Data anggota diupdate: ARYA WIBAWA. AR',NULL,NULL,'2025-08-07 12:51:28'),
(6,7,'UPDATE','Data anggota diupdate: ARYA WIBAWA. AR',NULL,NULL,'2025-08-07 12:51:30'),
(7,7,'UPDATE','Data anggota diupdate: ARYA WIBAWA. AR',NULL,NULL,'2025-08-07 12:51:31'),
(8,7,'UPDATE','Data anggota diupdate: ARYA WIBAWA. AR',NULL,NULL,'2025-08-07 12:51:45'),
(9,NULL,'INSERT','Anggota baru dibuat: Takdir',NULL,NULL,'2025-08-08 03:45:29'),
(10,NULL,'UPDATE','Data anggota diupdate: Takdir',NULL,NULL,'2025-08-08 03:46:15'),
(11,NULL,'UPDATE','Data anggota diupdate: Takdir',NULL,NULL,'2025-08-08 03:46:16'),
(12,NULL,'INSERT','Anggota baru dibuat: Muh. Firdaus',NULL,NULL,'2025-08-08 03:48:37'),
(13,NULL,'UPDATE','Data anggota diupdate: Takdir',NULL,NULL,'2025-08-08 03:49:51'),
(14,NULL,'INSERT','Anggota baru dibuat: Afjan',NULL,NULL,'2025-08-08 04:52:47'),
(15,NULL,'INSERT','Anggota baru dibuat: Muh. Firdaus',NULL,NULL,'2025-08-09 07:38:05'),
(16,12,'INSERT','Anggota baru dibuat: Indah wardani',NULL,NULL,'2025-08-10 00:19:14'),
(17,13,'INSERT','Anggota baru dibuat: Khusnul amalia ramadhani',NULL,NULL,'2025-08-10 01:02:17'),
(18,14,'INSERT','Anggota baru dibuat: Muh. Firdaus',NULL,NULL,'2025-08-10 05:35:29'),
(19,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 05:35:41'),
(20,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 05:43:00'),
(21,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 05:49:01'),
(22,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:00:01'),
(23,7,'UPDATE','Data anggota diupdate: ARYA WIBAWA. AR',NULL,NULL,'2025-08-10 06:09:17'),
(24,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:15:12'),
(25,7,'UPDATE','Data anggota diupdate: ARYA WIBAWA. AR',NULL,NULL,'2025-08-10 06:15:30'),
(26,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:15:50'),
(27,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:16:07'),
(28,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:19:39'),
(29,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:19:54'),
(30,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:20:02'),
(31,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:24:17'),
(32,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-10 06:24:25'),
(33,15,'INSERT','Anggota baru dibuat: Nur Ristra Jariani',NULL,NULL,'2025-08-10 09:12:44'),
(34,16,'INSERT','Anggota baru dibuat: Andi hakim',NULL,NULL,'2025-08-10 09:38:09'),
(35,17,'INSERT','Anggota baru dibuat: Fitri Permata Sari',NULL,NULL,'2025-08-11 02:06:33'),
(36,18,'INSERT','Anggota baru dibuat: Irmayanti',NULL,NULL,'2025-08-11 02:09:20'),
(37,19,'INSERT','Anggota baru dibuat: Umi Helvdah',NULL,NULL,'2025-08-11 02:11:06'),
(38,20,'INSERT','Anggota baru dibuat: Satmanto Said',NULL,NULL,'2025-08-11 02:15:08'),
(39,21,'INSERT','Anggota baru dibuat: Muhammad',NULL,NULL,'2025-08-11 02:16:28'),
(40,22,'INSERT','Anggota baru dibuat: Sigit Umar',NULL,NULL,'2025-08-11 02:18:04'),
(41,23,'INSERT','Anggota baru dibuat: Didin',NULL,NULL,'2025-08-11 02:19:30'),
(42,24,'INSERT','Anggota baru dibuat: Ilham',NULL,NULL,'2025-08-11 02:21:31'),
(43,25,'INSERT','Anggota baru dibuat: Uga',NULL,NULL,'2025-08-11 02:22:55'),
(44,26,'INSERT','Anggota baru dibuat: Muliadi',NULL,NULL,'2025-08-11 02:24:10'),
(45,27,'INSERT','Anggota baru dibuat: Sukadi',NULL,NULL,'2025-08-11 02:26:02'),
(46,28,'INSERT','Anggota baru dibuat: Chida',NULL,NULL,'2025-08-11 02:27:32'),
(47,29,'INSERT','Anggota baru dibuat: Dhanti',NULL,NULL,'2025-08-11 02:29:00'),
(48,30,'INSERT','Anggota baru dibuat: Rizka',NULL,NULL,'2025-08-11 02:30:23'),
(49,31,'INSERT','Anggota baru dibuat: Zulfikar',NULL,NULL,'2025-08-11 02:31:33'),
(50,32,'INSERT','Anggota baru dibuat: Defra',NULL,NULL,'2025-08-11 02:33:01'),
(51,33,'INSERT','Anggota baru dibuat: Putri',NULL,NULL,'2025-08-11 02:34:37'),
(52,34,'INSERT','Anggota baru dibuat: Vuma',NULL,NULL,'2025-08-11 02:36:30'),
(53,35,'INSERT','Anggota baru dibuat: Nia',NULL,NULL,'2025-08-11 02:37:47'),
(54,36,'INSERT','Anggota baru dibuat: Hamka',NULL,NULL,'2025-08-11 02:39:29'),
(55,37,'INSERT','Anggota baru dibuat: Ilga',NULL,NULL,'2025-08-11 02:40:45'),
(56,38,'INSERT','Anggota baru dibuat: Geby',NULL,NULL,'2025-08-11 02:41:57'),
(57,39,'INSERT','Anggota baru dibuat: Ardinan',NULL,NULL,'2025-08-11 02:44:29'),
(58,40,'INSERT','Anggota baru dibuat: Azizah',NULL,NULL,'2025-08-11 02:45:42'),
(59,41,'INSERT','Anggota baru dibuat: H. Darmi',NULL,NULL,'2025-08-11 02:46:43'),
(60,42,'INSERT','Anggota baru dibuat: Erni',NULL,NULL,'2025-08-11 02:48:17'),
(61,43,'INSERT','Anggota baru dibuat: Sanjay',NULL,NULL,'2025-08-11 02:50:13'),
(62,44,'INSERT','Anggota baru dibuat: Lisna Uju',NULL,NULL,'2025-08-11 02:52:49'),
(63,45,'INSERT','Anggota baru dibuat: Rahma',NULL,NULL,'2025-08-11 02:53:45'),
(64,46,'INSERT','Anggota baru dibuat: Ayu',NULL,NULL,'2025-08-11 02:54:54'),
(65,47,'INSERT','Anggota baru dibuat: Putri Rahayu Ningsih',NULL,NULL,'2025-08-11 02:58:18'),
(66,48,'INSERT','Anggota baru dibuat: Putri Maharani',NULL,NULL,'2025-08-11 03:00:18'),
(67,49,'INSERT','Anggota baru dibuat: Arman Sagita',NULL,NULL,'2025-08-11 03:03:05'),
(68,50,'INSERT','Anggota baru dibuat: Norma',NULL,NULL,'2025-08-11 03:04:49'),
(69,51,'INSERT','Anggota baru dibuat: Arjuna SKM',NULL,NULL,'2025-08-11 03:06:40'),
(70,52,'INSERT','Anggota baru dibuat: Hasnah',NULL,NULL,'2025-08-11 03:08:46'),
(71,53,'INSERT','Anggota baru dibuat: Adienia',NULL,NULL,'2025-08-11 03:11:08'),
(72,54,'INSERT','Anggota baru dibuat: Khusnul Khotimah',NULL,NULL,'2025-08-11 03:13:00'),
(73,55,'INSERT','Anggota baru dibuat: Akbar',NULL,NULL,'2025-08-11 03:14:18'),
(74,56,'INSERT','Anggota baru dibuat: Irwan',NULL,NULL,'2025-08-11 03:16:23'),
(75,57,'INSERT','Anggota baru dibuat: Firman',NULL,NULL,'2025-08-11 03:17:59'),
(76,58,'INSERT','Anggota baru dibuat: Yudis',NULL,NULL,'2025-08-11 03:19:40'),
(77,59,'INSERT','Anggota baru dibuat: Irfan',NULL,NULL,'2025-08-11 03:21:20'),
(78,60,'INSERT','Anggota baru dibuat: Tenri',NULL,NULL,'2025-08-11 03:22:34'),
(79,61,'INSERT','Anggota baru dibuat: Ummy',NULL,NULL,'2025-08-11 03:23:50'),
(80,62,'INSERT','Anggota baru dibuat: Agus Leman',NULL,NULL,'2025-08-11 03:24:55'),
(81,63,'INSERT','Anggota baru dibuat: Darmawati',NULL,NULL,'2025-08-11 03:25:59'),
(82,64,'INSERT','Anggota baru dibuat: Samdar',NULL,NULL,'2025-08-11 03:42:39'),
(83,65,'INSERT','Anggota baru dibuat: Hikma',NULL,NULL,'2025-08-11 03:45:48'),
(84,66,'INSERT','Anggota baru dibuat: Wawan',NULL,NULL,'2025-08-11 03:49:06'),
(85,67,'INSERT','Anggota baru dibuat: Muthmainnah',NULL,NULL,'2025-08-11 03:50:12'),
(86,68,'INSERT','Anggota baru dibuat: Aldo',NULL,NULL,'2025-08-11 03:51:25'),
(87,69,'INSERT','Anggota baru dibuat: Hermin',NULL,NULL,'2025-08-11 03:53:06'),
(88,70,'INSERT','Anggota baru dibuat: Neng Ira F',NULL,NULL,'2025-08-11 03:54:28'),
(89,71,'INSERT','Anggota baru dibuat: Fanny Sanasri',NULL,NULL,'2025-08-11 03:55:49'),
(90,72,'INSERT','Anggota baru dibuat: Takdir',NULL,NULL,'2025-08-11 03:57:06'),
(91,73,'INSERT','Anggota baru dibuat: Ito',NULL,NULL,'2025-08-11 03:58:19'),
(92,74,'INSERT','Anggota baru dibuat: Nurul Izzah',NULL,NULL,'2025-08-11 03:59:32'),
(93,75,'INSERT','Anggota baru dibuat: Wulan Harun',NULL,NULL,'2025-08-11 04:00:32'),
(94,76,'INSERT','Anggota baru dibuat: Febrian',NULL,NULL,'2025-08-11 04:01:51'),
(95,77,'INSERT','Anggota baru dibuat: Riezka Eka',NULL,NULL,'2025-08-11 04:04:12'),
(96,78,'INSERT','Anggota baru dibuat: Marben',NULL,NULL,'2025-08-11 04:30:11'),
(97,79,'INSERT','Anggota baru dibuat: Fina',NULL,NULL,'2025-08-11 04:31:40'),
(98,80,'INSERT','Anggota baru dibuat: Uni',NULL,NULL,'2025-08-11 04:35:09'),
(99,81,'INSERT','Anggota baru dibuat: Irwan',NULL,NULL,'2025-08-11 04:36:59'),
(100,82,'INSERT','Anggota baru dibuat: Ian',NULL,NULL,'2025-08-11 04:38:33'),
(101,83,'INSERT','Anggota baru dibuat: Andhika',NULL,NULL,'2025-08-11 04:40:31'),
(102,84,'INSERT','Anggota baru dibuat: Baskara',NULL,NULL,'2025-08-11 04:42:17'),
(103,85,'INSERT','Anggota baru dibuat: Amanda',NULL,NULL,'2025-08-11 04:44:11'),
(104,86,'INSERT','Anggota baru dibuat: Jumaria',NULL,NULL,'2025-08-11 04:47:04'),
(105,87,'INSERT','Anggota baru dibuat: Aini Indrijawati',NULL,NULL,'2025-08-11 04:49:39'),
(106,88,'INSERT','Anggota baru dibuat: A. Besse Patadjai',NULL,NULL,'2025-08-11 04:51:23'),
(107,89,'INSERT','Anggota baru dibuat: Intihanah',NULL,NULL,'2025-08-11 04:53:56'),
(108,90,'INSERT','Anggota baru dibuat: Rosnawintang',NULL,NULL,'2025-08-11 04:55:37'),
(109,91,'INSERT','Anggota baru dibuat: Nono',NULL,NULL,'2025-08-11 04:56:55'),
(110,92,'INSERT','Anggota baru dibuat: Herman Saputra',NULL,NULL,'2025-08-11 04:58:26'),
(111,93,'INSERT','Anggota baru dibuat: Syahria Nur',NULL,NULL,'2025-08-11 04:59:42'),
(112,94,'INSERT','Anggota baru dibuat: Endri Bakti',NULL,NULL,'2025-08-11 05:01:19'),
(113,95,'INSERT','Anggota baru dibuat: Serly Wahyuni',NULL,NULL,'2025-08-11 05:02:59'),
(114,96,'INSERT','Anggota baru dibuat: Fatwa',NULL,NULL,'2025-08-11 05:31:51'),
(115,97,'INSERT','Anggota baru dibuat: Sabril',NULL,NULL,'2025-08-11 05:33:34'),
(116,98,'INSERT','Anggota baru dibuat: Risfa',NULL,NULL,'2025-08-11 05:35:48'),
(117,99,'INSERT','Anggota baru dibuat: Ramla',NULL,NULL,'2025-08-11 05:38:56'),
(118,100,'INSERT','Anggota baru dibuat: Erwin Sain',NULL,NULL,'2025-08-11 05:47:35'),
(119,101,'INSERT','Anggota baru dibuat: Angel',NULL,NULL,'2025-08-11 05:48:36'),
(120,102,'INSERT','Anggota baru dibuat: Siti Adinela',NULL,NULL,'2025-08-11 05:52:17'),
(121,103,'INSERT','Anggota baru dibuat: Alex',NULL,NULL,'2025-08-11 05:56:34'),
(122,104,'INSERT','Anggota baru dibuat: Indah',NULL,NULL,'2025-08-11 05:58:34'),
(123,105,'INSERT','Anggota baru dibuat: Sri',NULL,NULL,'2025-08-11 06:00:06'),
(124,106,'INSERT','Anggota baru dibuat: Iksan',NULL,NULL,'2025-08-11 06:09:48'),
(125,107,'INSERT','Anggota baru dibuat: Andi Mirwat',NULL,NULL,'2025-08-11 06:11:21'),
(126,108,'INSERT','Anggota baru dibuat: Sultan',NULL,NULL,'2025-08-11 06:12:12'),
(127,109,'INSERT','Anggota baru dibuat: Ririn',NULL,NULL,'2025-08-11 06:13:05'),
(128,110,'INSERT','Anggota baru dibuat: Reka',NULL,NULL,'2025-08-11 06:15:24'),
(129,111,'INSERT','Anggota baru dibuat: Zahra',NULL,NULL,'2025-08-11 06:18:34'),
(130,112,'INSERT','Anggota baru dibuat: Andi Sastra',NULL,NULL,'2025-08-11 06:19:41'),
(131,113,'INSERT','Anggota baru dibuat: Armi',NULL,NULL,'2025-08-11 06:20:19'),
(132,114,'INSERT','Anggota baru dibuat: Wirandha',NULL,NULL,'2025-08-11 06:25:39'),
(133,115,'INSERT','Anggota baru dibuat: Padiatno',NULL,NULL,'2025-08-11 06:27:43'),
(134,116,'INSERT','Anggota baru dibuat: Wiwi',NULL,NULL,'2025-08-11 06:46:03'),
(135,117,'INSERT','Anggota baru dibuat: Nur',NULL,NULL,'2025-08-11 06:47:52'),
(136,118,'INSERT','Anggota baru dibuat: Jamil',NULL,NULL,'2025-08-11 06:49:49'),
(137,119,'INSERT','Anggota baru dibuat: Fitri',NULL,NULL,'2025-08-11 06:51:54'),
(138,120,'INSERT','Anggota baru dibuat: Vivi',NULL,NULL,'2025-08-11 06:53:17'),
(139,121,'INSERT','Anggota baru dibuat: Emy',NULL,NULL,'2025-08-11 06:54:51'),
(140,122,'INSERT','Anggota baru dibuat: Dila',NULL,NULL,'2025-08-11 06:56:33'),
(141,123,'INSERT','Anggota baru dibuat: Uki',NULL,NULL,'2025-08-11 06:57:36'),
(142,124,'INSERT','Anggota baru dibuat: Taufik',NULL,NULL,'2025-08-11 07:00:21'),
(143,125,'INSERT','Anggota baru dibuat: Syamsu Riam',NULL,NULL,'2025-08-11 07:01:42'),
(144,126,'INSERT','Anggota baru dibuat: Rio',NULL,NULL,'2025-08-11 07:03:09'),
(145,127,'INSERT','Anggota baru dibuat: Adrian',NULL,NULL,'2025-08-11 07:04:46'),
(146,128,'INSERT','Anggota baru dibuat: Irma',NULL,NULL,'2025-08-11 07:05:47'),
(147,129,'INSERT','Anggota baru dibuat: Wawan',NULL,NULL,'2025-08-11 07:06:47'),
(148,130,'INSERT','Anggota baru dibuat: Vira',NULL,NULL,'2025-08-11 07:08:49'),
(149,131,'INSERT','Anggota baru dibuat: Bu. Ros',NULL,NULL,'2025-08-11 07:11:32'),
(150,132,'INSERT','Anggota baru dibuat: Arya',NULL,NULL,'2025-08-11 07:12:35'),
(151,133,'INSERT','Anggota baru dibuat: Ibu Novi',NULL,NULL,'2025-08-11 07:13:47'),
(152,134,'INSERT','Anggota baru dibuat: Cika Jessica',NULL,NULL,'2025-08-11 07:14:36'),
(153,135,'INSERT','Anggota baru dibuat: Aisyah',NULL,NULL,'2025-08-11 07:26:48'),
(154,136,'INSERT','Anggota baru dibuat: Andi Lukman',NULL,NULL,'2025-08-11 07:28:31'),
(155,137,'INSERT','Anggota baru dibuat: Sintia',NULL,NULL,'2025-08-11 07:31:29'),
(156,138,'INSERT','Anggota baru dibuat: Andrita purnamasari',NULL,NULL,'2025-08-11 11:54:37'),
(157,139,'INSERT','Anggota baru dibuat: Nita Natalia',NULL,NULL,'2025-08-13 01:15:30'),
(158,140,'INSERT','Anggota baru dibuat: A. Wahyuni',NULL,NULL,'2025-08-13 01:17:00'),
(159,141,'INSERT','Anggota baru dibuat: Siti Ramadi',NULL,NULL,'2025-08-13 01:18:31'),
(160,142,'INSERT','Anggota baru dibuat: Sri Hariati',NULL,NULL,'2025-08-13 01:19:42'),
(161,143,'INSERT','Anggota baru dibuat: Yuditya Efrizal Nur',NULL,NULL,'2025-08-13 01:21:03'),
(162,144,'INSERT','Anggota baru dibuat: Faisal',NULL,NULL,'2025-08-13 01:22:21'),
(163,145,'INSERT','Anggota baru dibuat: Fathia Wafi',NULL,NULL,'2025-08-13 01:23:57'),
(164,146,'INSERT','Anggota baru dibuat: Rul',NULL,NULL,'2025-08-13 01:26:11'),
(165,147,'INSERT','Anggota baru dibuat: Farida',NULL,NULL,'2025-08-13 01:27:15'),
(166,148,'INSERT','Anggota baru dibuat: Achmad',NULL,NULL,'2025-08-13 01:29:01'),
(167,149,'INSERT','Anggota baru dibuat: Nur Leli',NULL,NULL,'2025-08-13 01:29:57'),
(168,150,'INSERT','Anggota baru dibuat: Hasbi',NULL,NULL,'2025-08-13 01:32:02'),
(169,151,'INSERT','Anggota baru dibuat: Iva',NULL,NULL,'2025-08-13 01:32:55'),
(170,152,'INSERT','Anggota baru dibuat: Andi Nurul Hidaya Azzahara',NULL,NULL,'2025-08-13 01:34:02'),
(171,153,'INSERT','Anggota baru dibuat: Hasnawati',NULL,NULL,'2025-08-13 01:35:35'),
(172,154,'INSERT','Anggota baru dibuat: Nasrul',NULL,NULL,'2025-08-13 01:37:24'),
(173,155,'INSERT','Anggota baru dibuat: Apriani',NULL,NULL,'2025-08-13 01:57:49'),
(174,156,'INSERT','Anggota baru dibuat: Yuli',NULL,NULL,'2025-08-13 01:58:50'),
(175,157,'INSERT','Anggota baru dibuat: Dian',NULL,NULL,'2025-08-13 01:59:55'),
(176,158,'INSERT','Anggota baru dibuat: Yulita',NULL,NULL,'2025-08-13 02:01:19'),
(177,159,'INSERT','Anggota baru dibuat: Erwin Hatta',NULL,NULL,'2025-08-13 02:02:42'),
(178,160,'INSERT','Anggota baru dibuat: Salam',NULL,NULL,'2025-08-13 02:03:59'),
(179,161,'INSERT','Anggota baru dibuat: Titi',NULL,NULL,'2025-08-13 02:06:16'),
(180,162,'INSERT','Anggota baru dibuat: Ibu Ipah',NULL,NULL,'2025-08-13 02:07:21'),
(181,163,'INSERT','Anggota baru dibuat: Riyanto',NULL,NULL,'2025-08-13 02:08:23'),
(182,164,'INSERT','Anggota baru dibuat: Syahra Annisa',NULL,NULL,'2025-08-13 02:09:32'),
(183,165,'INSERT','Anggota baru dibuat: Naswar',NULL,NULL,'2025-08-13 02:10:44'),
(184,166,'INSERT','Anggota baru dibuat: Kiki',NULL,NULL,'2025-08-13 02:11:41'),
(185,167,'INSERT','Anggota baru dibuat: Marwa',NULL,NULL,'2025-08-13 02:13:47'),
(186,168,'INSERT','Anggota baru dibuat: Leny',NULL,NULL,'2025-08-13 02:14:48'),
(187,169,'INSERT','Anggota baru dibuat: Ully Hidayah',NULL,NULL,'2025-08-13 02:16:04'),
(188,170,'INSERT','Anggota baru dibuat: Miswandi Tendi',NULL,NULL,'2025-08-13 02:19:27'),
(189,171,'INSERT','Anggota baru dibuat: Dewi Intan',NULL,NULL,'2025-08-13 02:20:17'),
(190,172,'INSERT','Anggota baru dibuat: Yunita Nur',NULL,NULL,'2025-08-13 02:21:24'),
(191,173,'INSERT','Anggota baru dibuat: Hj. Asma',NULL,NULL,'2025-08-13 02:22:26'),
(192,174,'INSERT','Anggota baru dibuat: Mappatoba',NULL,NULL,'2025-08-13 02:27:20'),
(193,175,'INSERT','Anggota baru dibuat: Risna',NULL,NULL,'2025-08-13 02:29:22'),
(194,176,'INSERT','Anggota baru dibuat: Andi Firman',NULL,NULL,'2025-08-13 02:31:42'),
(195,177,'INSERT','Anggota baru dibuat: Lina',NULL,NULL,'2025-08-13 02:33:09'),
(196,178,'INSERT','Anggota baru dibuat: Abdul Kadir',NULL,NULL,'2025-08-13 02:33:58'),
(197,179,'INSERT','Anggota baru dibuat: Astuti',NULL,NULL,'2025-08-13 02:34:41'),
(198,180,'INSERT','Anggota baru dibuat: Hatianti',NULL,NULL,'2025-08-13 02:35:53'),
(199,181,'INSERT','Anggota baru dibuat: Musyarrafah',NULL,NULL,'2025-08-13 02:37:26'),
(200,182,'INSERT','Anggota baru dibuat: Muh. Syafwan. N',NULL,NULL,'2025-08-13 02:40:17'),
(201,183,'INSERT','Anggota baru dibuat: Feby Haspika',NULL,NULL,'2025-08-13 02:42:23'),
(202,184,'INSERT','Anggota baru dibuat: Cica',NULL,NULL,'2025-08-13 02:43:38'),
(203,185,'INSERT','Anggota baru dibuat: Putri Nur Qalbi',NULL,NULL,'2025-08-13 02:45:58'),
(204,186,'INSERT','Anggota baru dibuat: Nurdin',NULL,NULL,'2025-08-13 02:46:58'),
(205,187,'INSERT','Anggota baru dibuat: Ifan Bonafat',NULL,NULL,'2025-08-13 02:48:02'),
(206,188,'INSERT','Anggota baru dibuat: Megawati',NULL,NULL,'2025-08-13 02:49:43'),
(207,189,'INSERT','Anggota baru dibuat: Aldi',NULL,NULL,'2025-08-13 02:50:43'),
(208,190,'INSERT','Anggota baru dibuat: Ceria',NULL,NULL,'2025-08-13 02:51:44'),
(209,191,'INSERT','Anggota baru dibuat: Desy',NULL,NULL,'2025-08-13 02:52:50'),
(210,192,'INSERT','Anggota baru dibuat: Aulia',NULL,NULL,'2025-08-13 02:54:02'),
(211,193,'INSERT','Anggota baru dibuat: Cece',NULL,NULL,'2025-08-13 02:54:49'),
(212,194,'INSERT','Anggota baru dibuat: Ena Suaib',NULL,NULL,'2025-08-13 02:56:13'),
(213,195,'INSERT','Anggota baru dibuat: Sudi',NULL,NULL,'2025-08-13 02:59:29'),
(214,196,'INSERT','Anggota baru dibuat: Ekal',NULL,NULL,'2025-08-13 03:00:28'),
(215,197,'INSERT','Anggota baru dibuat: Isnawati',NULL,NULL,'2025-08-13 03:01:35'),
(216,198,'INSERT','Anggota baru dibuat: Muli',NULL,NULL,'2025-08-13 03:02:32'),
(217,199,'INSERT','Anggota baru dibuat: Hj. Yuli',NULL,NULL,'2025-08-13 03:06:07'),
(218,200,'INSERT','Anggota baru dibuat: Hj. Rosnawi',NULL,NULL,'2025-08-13 03:07:31'),
(219,201,'INSERT','Anggota baru dibuat: Hj. Ida',NULL,NULL,'2025-08-13 03:08:34'),
(220,202,'INSERT','Anggota baru dibuat: Nana',NULL,NULL,'2025-08-13 03:09:40'),
(221,203,'INSERT','Anggota baru dibuat: Nur Ainun',NULL,NULL,'2025-08-13 03:10:56'),
(222,204,'INSERT','Anggota baru dibuat: Junaedi',NULL,NULL,'2025-08-13 03:11:52'),
(223,205,'INSERT','Anggota baru dibuat: Amid',NULL,NULL,'2025-08-13 03:12:46'),
(224,206,'INSERT','Anggota baru dibuat: Hasna',NULL,NULL,'2025-08-13 03:13:37'),
(225,207,'INSERT','Anggota baru dibuat: Nurianti',NULL,NULL,'2025-08-13 03:14:42'),
(226,208,'INSERT','Anggota baru dibuat: Suhaji',NULL,NULL,'2025-08-13 03:15:37'),
(227,209,'INSERT','Anggota baru dibuat: Dede',NULL,NULL,'2025-08-13 03:16:24'),
(228,210,'INSERT','Anggota baru dibuat: Bambang',NULL,NULL,'2025-08-13 03:17:14'),
(229,211,'INSERT','Anggota baru dibuat: Irjan',NULL,NULL,'2025-08-13 03:17:59'),
(230,212,'INSERT','Anggota baru dibuat: Nida',NULL,NULL,'2025-08-13 03:18:38'),
(231,213,'INSERT','Anggota baru dibuat: Sarwan',NULL,NULL,'2025-08-13 03:19:24'),
(232,214,'INSERT','Anggota baru dibuat: Ikrar',NULL,NULL,'2025-08-13 03:20:03'),
(233,215,'INSERT','Anggota baru dibuat: Alda',NULL,NULL,'2025-08-13 03:20:38'),
(234,216,'INSERT','Anggota baru dibuat: Gadista. B',NULL,NULL,'2025-08-13 03:26:03'),
(235,217,'INSERT','Anggota baru dibuat: Yuni',NULL,NULL,'2025-08-13 03:26:41'),
(236,218,'INSERT','Anggota baru dibuat: Rita',NULL,NULL,'2025-08-13 03:27:20'),
(237,219,'INSERT','Anggota baru dibuat: Virda',NULL,NULL,'2025-08-13 03:28:10'),
(238,220,'INSERT','Anggota baru dibuat: Rahmad',NULL,NULL,'2025-08-13 03:29:07'),
(239,221,'INSERT','Anggota baru dibuat: Ima',NULL,NULL,'2025-08-13 03:29:58'),
(240,222,'INSERT','Anggota baru dibuat: Ahmad',NULL,NULL,'2025-08-13 03:31:13'),
(241,223,'INSERT','Anggota baru dibuat: Memes',NULL,NULL,'2025-08-13 03:31:54'),
(242,224,'INSERT','Anggota baru dibuat: Rijal',NULL,NULL,'2025-08-13 03:32:40'),
(243,225,'INSERT','Anggota baru dibuat: Rian',NULL,NULL,'2025-08-13 03:33:42'),
(244,226,'INSERT','Anggota baru dibuat: Sukma',NULL,NULL,'2025-08-13 03:37:26'),
(245,227,'INSERT','Anggota baru dibuat: Tira',NULL,NULL,'2025-08-13 03:38:14'),
(246,228,'INSERT','Anggota baru dibuat: Ganesha',NULL,NULL,'2025-08-13 03:39:04'),
(247,229,'INSERT','Anggota baru dibuat: Ismi. P',NULL,NULL,'2025-08-13 03:40:31'),
(248,230,'INSERT','Anggota baru dibuat: Atira',NULL,NULL,'2025-08-13 03:41:27'),
(249,231,'INSERT','Anggota baru dibuat: Ansar',NULL,NULL,'2025-08-13 03:42:15'),
(250,232,'INSERT','Anggota baru dibuat: Sriwati',NULL,NULL,'2025-08-13 03:43:04'),
(251,233,'INSERT','Anggota baru dibuat: Sukardi',NULL,NULL,'2025-08-13 03:44:00'),
(252,234,'INSERT','Anggota baru dibuat: Kia',NULL,NULL,'2025-08-13 03:44:49'),
(253,235,'INSERT','Anggota baru dibuat: Erni',NULL,NULL,'2025-08-13 03:45:42'),
(254,236,'INSERT','Anggota baru dibuat: Husain',NULL,NULL,'2025-08-13 03:46:29'),
(255,237,'INSERT','Anggota baru dibuat: Muh. Sahib',NULL,NULL,'2025-08-13 03:57:18'),
(256,238,'INSERT','Anggota baru dibuat: Lysa',NULL,NULL,'2025-08-13 03:58:02'),
(257,239,'INSERT','Anggota baru dibuat: Lilis',NULL,NULL,'2025-08-13 03:58:43'),
(258,240,'INSERT','Anggota baru dibuat: Ical',NULL,NULL,'2025-08-13 04:04:32'),
(259,241,'INSERT','Anggota baru dibuat: Amrul',NULL,NULL,'2025-08-13 04:05:12'),
(260,242,'INSERT','Anggota baru dibuat: Hilda',NULL,NULL,'2025-08-13 04:05:52'),
(261,243,'INSERT','Anggota baru dibuat: Alex',NULL,NULL,'2025-08-13 04:06:25'),
(262,244,'INSERT','Anggota baru dibuat: A. Wulan Matabella',NULL,NULL,'2025-08-13 04:34:25'),
(263,245,'INSERT','Anggota baru dibuat: Indra',NULL,NULL,'2025-08-13 04:35:31'),
(264,246,'INSERT','Anggota baru dibuat: Wahyu',NULL,NULL,'2025-08-13 04:36:19'),
(265,247,'INSERT','Anggota baru dibuat: Lina',NULL,NULL,'2025-08-13 04:37:07'),
(266,248,'INSERT','Anggota baru dibuat: Asnira',NULL,NULL,'2025-08-13 04:39:38'),
(267,249,'INSERT','Anggota baru dibuat: M. Ashar',NULL,NULL,'2025-08-13 04:40:40'),
(268,250,'INSERT','Anggota baru dibuat: Intan',NULL,NULL,'2025-08-13 04:42:23'),
(269,251,'INSERT','Anggota baru dibuat: Rila',NULL,NULL,'2025-08-13 04:43:41'),
(270,252,'INSERT','Anggota baru dibuat: Silmi kadir',NULL,NULL,'2025-08-13 04:45:12'),
(271,253,'INSERT','Anggota baru dibuat: Andi Ratu Balqis',NULL,NULL,'2025-08-13 04:50:15'),
(272,254,'INSERT','Anggota baru dibuat: Erlin',NULL,NULL,'2025-08-13 04:52:31'),
(273,255,'INSERT','Anggota baru dibuat: Muhammad Akram',NULL,NULL,'2025-08-13 04:53:46'),
(274,256,'INSERT','Anggota baru dibuat: Iis Aprianty',NULL,NULL,'2025-08-13 04:54:56'),
(275,257,'INSERT','Anggota baru dibuat: R. Fausan',NULL,NULL,'2025-08-13 04:57:03'),
(276,258,'INSERT','Anggota baru dibuat: Faje',NULL,NULL,'2025-08-13 04:58:09'),
(277,259,'INSERT','Anggota baru dibuat: Alfred',NULL,NULL,'2025-08-13 04:59:54'),
(278,260,'INSERT','Anggota baru dibuat: Sindi',NULL,NULL,'2025-08-13 05:02:09'),
(279,261,'INSERT','Anggota baru dibuat: Tiwi',NULL,NULL,'2025-08-13 05:03:00'),
(280,262,'INSERT','Anggota baru dibuat: Desya FR',NULL,NULL,'2025-08-13 05:03:56'),
(281,263,'INSERT','Anggota baru dibuat: Ekhy',NULL,NULL,'2025-08-13 05:05:22'),
(282,264,'INSERT','Anggota baru dibuat: Masdiana',NULL,NULL,'2025-08-13 05:06:38'),
(283,265,'INSERT','Anggota baru dibuat: Faisol Udo',NULL,NULL,'2025-08-13 05:07:53'),
(284,266,'INSERT','Anggota baru dibuat: Yuli',NULL,NULL,'2025-08-13 05:08:57'),
(285,267,'INSERT','Anggota baru dibuat: Eni Suaib',NULL,NULL,'2025-08-13 05:10:19'),
(286,268,'INSERT','Anggota baru dibuat: Jeff Rian Samuel',NULL,NULL,'2025-08-13 05:11:38'),
(287,269,'INSERT','Anggota baru dibuat: Dedi Gembel',NULL,NULL,'2025-08-13 05:12:52'),
(288,270,'INSERT','Anggota baru dibuat: Adi Gembel',NULL,NULL,'2025-08-13 05:13:52'),
(289,271,'INSERT','Anggota baru dibuat: Kurniawan Aret. P',NULL,NULL,'2025-08-13 05:15:26'),
(290,272,'INSERT','Anggota baru dibuat: Dwi Safitri',NULL,NULL,'2025-08-13 05:16:40'),
(291,273,'INSERT','Anggota baru dibuat: Febri',NULL,NULL,'2025-08-13 05:17:18'),
(292,274,'INSERT','Anggota baru dibuat: Tri',NULL,NULL,'2025-08-13 05:30:19'),
(293,275,'INSERT','Anggota baru dibuat: Gastav',NULL,NULL,'2025-08-13 05:33:22'),
(294,14,'UPDATE','Data anggota diupdate: Muh. Firdaus',NULL,NULL,'2025-08-13 05:38:21'),
(295,276,'INSERT','Anggota baru dibuat: Muh. Yasmin',NULL,NULL,'2025-08-13 05:39:56'),
(296,277,'INSERT','Anggota baru dibuat: Hasni',NULL,NULL,'2025-08-13 05:45:52'),
(297,278,'INSERT','Anggota baru dibuat: Ekawati',NULL,NULL,'2025-08-13 05:46:59'),
(298,279,'INSERT','Anggota baru dibuat: Ani',NULL,NULL,'2025-08-13 05:47:53'),
(299,280,'INSERT','Anggota baru dibuat: Astuti Fahlan',NULL,NULL,'2025-08-13 05:49:21'),
(300,281,'INSERT','Anggota baru dibuat: Caca',NULL,NULL,'2025-08-13 05:51:32'),
(301,282,'INSERT','Anggota baru dibuat: Nimrung',NULL,NULL,'2025-08-13 05:52:56'),
(302,283,'INSERT','Anggota baru dibuat: Samsam',NULL,NULL,'2025-08-13 05:53:48'),
(303,284,'INSERT','Anggota baru dibuat: Dea',NULL,NULL,'2025-08-13 05:55:36'),
(304,285,'INSERT','Anggota baru dibuat: Wulan',NULL,NULL,'2025-08-13 05:57:38'),
(305,286,'INSERT','Anggota baru dibuat: Yusriani',NULL,NULL,'2025-08-13 06:00:58'),
(306,287,'INSERT','Anggota baru dibuat: Rani',NULL,NULL,'2025-08-13 06:02:20'),
(307,288,'INSERT','Anggota baru dibuat: Tira',NULL,NULL,'2025-08-13 06:03:39'),
(308,289,'INSERT','Anggota baru dibuat: Arfas',NULL,NULL,'2025-08-13 06:04:56'),
(309,290,'INSERT','Anggota baru dibuat: Sarwan',NULL,NULL,'2025-08-13 06:36:16'),
(310,291,'INSERT','Anggota baru dibuat: Risma',NULL,NULL,'2025-08-13 06:37:38'),
(311,292,'INSERT','Anggota baru dibuat: Reski Aska',NULL,NULL,'2025-08-13 06:40:05'),
(312,293,'INSERT','Anggota baru dibuat: Adiba',NULL,NULL,'2025-08-13 06:41:02'),
(313,294,'INSERT','Anggota baru dibuat: Ika',NULL,NULL,'2025-08-13 06:42:28'),
(314,295,'INSERT','Anggota baru dibuat: Heru',NULL,NULL,'2025-08-13 06:43:35'),
(315,296,'INSERT','Anggota baru dibuat: Wani',NULL,NULL,'2025-08-13 06:44:44'),
(316,297,'INSERT','Anggota baru dibuat: Irna',NULL,NULL,'2025-08-13 06:45:33'),
(317,298,'INSERT','Anggota baru dibuat: Eka',NULL,NULL,'2025-08-13 06:47:15'),
(318,299,'INSERT','Anggota baru dibuat: Meifa',NULL,NULL,'2025-08-13 06:48:18'),
(319,300,'INSERT','Anggota baru dibuat: Ani Hasyim',NULL,NULL,'2025-08-13 06:49:17'),
(320,301,'INSERT','Anggota baru dibuat: Adwan',NULL,NULL,'2025-08-13 07:02:04'),
(321,302,'INSERT','Anggota baru dibuat: Key',NULL,NULL,'2025-08-13 07:03:31'),
(322,303,'INSERT','Anggota baru dibuat: Hugo',NULL,NULL,'2025-08-13 07:04:47'),
(323,304,'INSERT','Anggota baru dibuat: Diyat',NULL,NULL,'2025-08-13 07:06:18'),
(324,305,'INSERT','Anggota baru dibuat: Hasrul',NULL,NULL,'2025-08-13 07:07:17'),
(325,306,'INSERT','Anggota baru dibuat: Anton',NULL,NULL,'2025-08-13 07:07:57'),
(326,307,'INSERT','Anggota baru dibuat: Tenri Oten',NULL,NULL,'2025-08-13 07:08:48'),
(327,308,'INSERT','Anggota baru dibuat: Magfira',NULL,NULL,'2025-08-13 07:11:42'),
(328,309,'INSERT','Anggota baru dibuat: Caca',NULL,NULL,'2025-08-13 07:12:47'),
(329,310,'INSERT','Anggota baru dibuat: Satri',NULL,NULL,'2025-08-13 07:14:13'),
(330,311,'INSERT','Anggota baru dibuat: Ruslan',NULL,NULL,'2025-08-13 07:15:09'),
(331,312,'INSERT','Anggota baru dibuat: Ana',NULL,NULL,'2025-08-13 07:15:50'),
(332,313,'INSERT','Anggota baru dibuat: Indra Wulan',NULL,NULL,'2025-08-13 07:17:57'),
(333,314,'INSERT','Anggota baru dibuat: Agnes',NULL,NULL,'2025-08-13 07:18:36'),
(334,315,'INSERT','Anggota baru dibuat: Mayang',NULL,NULL,'2025-08-13 07:19:24'),
(335,316,'INSERT','Anggota baru dibuat: Astin',NULL,NULL,'2025-08-13 07:20:08'),
(336,317,'INSERT','Anggota baru dibuat: Ana',NULL,NULL,'2025-08-13 07:21:15'),
(337,318,'INSERT','Anggota baru dibuat: Fajar',NULL,NULL,'2025-08-13 07:47:28'),
(338,319,'INSERT','Anggota baru dibuat: Herman',NULL,NULL,'2025-08-13 07:48:02'),
(339,320,'INSERT','Anggota baru dibuat: Melisya',NULL,NULL,'2025-08-13 07:48:49'),
(340,321,'INSERT','Anggota baru dibuat: Sultan',NULL,NULL,'2025-08-13 07:49:29'),
(341,322,'INSERT','Anggota baru dibuat: Varensa',NULL,NULL,'2025-08-13 08:07:17'),
(342,323,'INSERT','Anggota baru dibuat: Eki',NULL,NULL,'2025-08-13 08:08:10'),
(343,324,'INSERT','Anggota baru dibuat: Syahril',NULL,NULL,'2025-08-13 08:15:01'),
(344,325,'INSERT','Anggota baru dibuat: Syiarul Amin',NULL,NULL,'2025-08-14 09:15:59'),
(345,326,'INSERT','Anggota baru dibuat: Asrurrowi',NULL,NULL,'2025-08-14 11:52:22'),
(346,15,'UPDATE','Data anggota diupdate: Nur Ristra Jariani',NULL,NULL,'2025-08-15 05:49:30'),
(347,327,'INSERT','Anggota baru dibuat: Afjan Afrisal Basri. R',NULL,NULL,'2025-08-15 06:25:23'),
(348,328,'INSERT','Anggota baru dibuat: Abd. Qahhar',NULL,NULL,'2025-08-16 13:36:46'),
(349,329,'INSERT','Anggota baru dibuat: Lini',NULL,NULL,'2025-08-18 06:07:57'),
(350,330,'INSERT','Anggota baru dibuat: Yoga',NULL,NULL,'2025-08-18 13:31:44'),
(351,331,'INSERT','Anggota baru dibuat: Nurul fitia',NULL,NULL,'2025-08-18 23:37:25'),
(352,332,'INSERT','Anggota baru dibuat: Andi saiful',NULL,NULL,'2025-08-19 23:35:19'),
(353,333,'INSERT','Anggota baru dibuat: Salim',NULL,NULL,'2025-08-20 11:08:50'),
(354,334,'INSERT','Anggota baru dibuat: Anca',NULL,NULL,'2025-08-20 13:07:07'),
(355,335,'INSERT','Anggota baru dibuat: Jane Natalia Mekel',NULL,NULL,'2025-08-21 01:40:56'),
(356,336,'INSERT','Anggota baru dibuat: Abyan',NULL,NULL,'2025-08-21 09:02:40'),
(357,337,'INSERT','Anggota baru dibuat: Darnawati',NULL,NULL,'2025-08-23 02:42:19'),
(358,338,'INSERT','Anggota baru dibuat: Marini',NULL,NULL,'2025-08-23 10:41:34'),
(359,338,'UPDATE','Data anggota diupdate: Marini',NULL,NULL,'2025-08-23 10:42:43'),
(360,338,'UPDATE','Data anggota diupdate: Marini',NULL,NULL,'2025-08-23 10:43:24'),
(361,339,'INSERT','Anggota baru dibuat: Marwah',NULL,NULL,'2025-08-23 15:03:28'),
(362,340,'INSERT','Anggota baru dibuat: Erwi',NULL,NULL,'2025-08-24 01:15:16'),
(363,341,'INSERT','Anggota baru dibuat: Andi Anita',NULL,NULL,'2025-08-25 03:36:02'),
(364,342,'INSERT','Anggota baru dibuat: Ayu sartika',NULL,NULL,'2025-08-25 23:53:37'),
(365,343,'INSERT','Anggota baru dibuat: Iqbal',NULL,NULL,'2025-08-26 12:18:07'),
(366,344,'INSERT','Anggota baru dibuat: Muh akram',NULL,NULL,'2025-08-26 12:22:52'),
(367,345,'INSERT','Anggota baru dibuat: Hartati',NULL,NULL,'2025-08-28 23:51:18'),
(368,346,'INSERT','Anggota baru dibuat: Mispa',NULL,NULL,'2025-08-30 09:36:50'),
(369,346,'UPDATE','Data anggota diupdate: Mispa',NULL,NULL,'2025-08-30 09:38:56'),
(370,347,'INSERT','Anggota baru dibuat: Hanif',NULL,NULL,'2025-08-31 12:11:34'),
(371,348,'INSERT','Anggota baru dibuat: Aca',NULL,NULL,'2025-08-31 23:55:48'),
(372,349,'INSERT','Anggota baru dibuat: Misda',NULL,NULL,'2025-09-01 11:40:47'),
(373,350,'INSERT','Anggota baru dibuat: Sri hartati',NULL,NULL,'2025-09-02 12:00:06'),
(374,351,'INSERT','Anggota baru dibuat: Wanti',NULL,NULL,'2025-09-03 23:24:03'),
(375,352,'INSERT','Anggota baru dibuat: Haslan',NULL,NULL,'2025-09-03 23:40:00'),
(376,353,'INSERT','Anggota baru dibuat: Syam',NULL,NULL,'2025-09-04 00:42:26'),
(377,354,'INSERT','Anggota baru dibuat: Ira kamelia',NULL,NULL,'2025-09-05 09:26:44'),
(378,355,'INSERT','Anggota baru dibuat: Dhita',NULL,NULL,'2025-09-06 22:46:25'),
(379,356,'INSERT','Anggota baru dibuat: Tuty',NULL,NULL,'2025-09-06 22:59:28'),
(380,357,'INSERT','Anggota baru dibuat: Sru Wahyuni',NULL,NULL,'2025-09-06 23:09:04'),
(381,357,'UPDATE','Data anggota diupdate: Sri Wahyuni',NULL,NULL,'2025-09-06 23:22:47'),
(382,358,'INSERT','Anggota baru dibuat: Rahmini',NULL,NULL,'2025-09-07 00:15:08'),
(383,359,'INSERT','Anggota baru dibuat: Mustika dewi',NULL,NULL,'2025-09-07 00:22:36'),
(384,360,'INSERT','Anggota baru dibuat: Syofyan Chan',NULL,NULL,'2025-09-08 13:37:54'),
(385,361,'INSERT','Anggota baru dibuat: Astin',NULL,NULL,'2025-09-08 23:39:53'),
(386,362,'INSERT','Anggota baru dibuat: Anggun',NULL,NULL,'2025-09-09 11:52:35'),
(387,363,'INSERT','Anggota baru dibuat: Herlina',NULL,NULL,'2025-09-10 06:02:55'),
(388,364,'INSERT','Anggota baru dibuat: Sardi',NULL,NULL,'2025-09-12 05:28:06'),
(389,365,'INSERT','Anggota baru dibuat: Gisel',NULL,NULL,'2025-09-13 22:38:35'),
(390,366,'INSERT','Anggota baru dibuat: Resky',NULL,NULL,'2025-09-13 22:53:28'),
(391,367,'INSERT','Anggota baru dibuat: Eva',NULL,NULL,'2025-09-13 23:28:12'),
(392,368,'INSERT','Anggota baru dibuat: Nurfahmi arbie',NULL,NULL,'2025-09-15 00:07:56'),
(393,369,'INSERT','Anggota baru dibuat: ARLAN',NULL,NULL,'2025-09-15 02:28:42'),
(394,370,'INSERT','Anggota baru dibuat: Fita',NULL,NULL,'2025-09-15 12:50:01'),
(395,371,'INSERT','Anggota baru dibuat: Sahara',NULL,NULL,'2025-09-16 13:03:19'),
(396,372,'INSERT','Anggota baru dibuat: Iin lompi',NULL,NULL,'2025-09-19 06:04:22'),
(397,373,'INSERT','Anggota baru dibuat: Rahmat',NULL,NULL,'2025-09-21 13:10:21'),
(398,374,'INSERT','Anggota baru dibuat: Dian',NULL,NULL,'2025-09-24 03:00:24'),
(399,375,'INSERT','Anggota baru dibuat: Ayrin chesa',NULL,NULL,'2025-09-25 12:09:24'),
(400,376,'INSERT','Anggota baru dibuat: Cayarani',NULL,NULL,'2025-09-26 09:50:24'),
(401,377,'INSERT','Anggota baru dibuat: Sulastri',NULL,NULL,'2025-09-27 09:01:46'),
(402,378,'INSERT','Anggota baru dibuat: Agnes',NULL,NULL,'2025-09-27 09:21:42'),
(403,379,'INSERT','Anggota baru dibuat: Rina',NULL,NULL,'2025-09-27 09:38:13'),
(404,380,'INSERT','Anggota baru dibuat: Naufal Aldian',NULL,NULL,'2025-09-27 22:52:02'),
(405,381,'INSERT','Anggota baru dibuat: Intan',NULL,NULL,'2025-09-27 23:02:57'),
(406,382,'INSERT','Anggota baru dibuat: Martina',NULL,NULL,'2025-09-27 23:04:11'),
(407,383,'INSERT','Anggota baru dibuat: Astusi arifin',NULL,NULL,'2025-09-27 23:10:34'),
(408,384,'INSERT','Anggota baru dibuat: Ris oktavia',NULL,NULL,'2025-09-29 12:29:00'),
(409,385,'INSERT','Anggota baru dibuat: Safa',NULL,NULL,'2025-10-02 11:06:47'),
(410,386,'INSERT','Anggota baru dibuat: Dirja',NULL,NULL,'2025-10-03 04:42:01'),
(411,387,'INSERT','Anggota baru dibuat: Muh Panji Ramarsani',NULL,NULL,'2025-10-04 03:12:24'),
(412,388,'INSERT','Anggota baru dibuat: Sukma',NULL,NULL,'2025-10-04 12:28:34'),
(413,389,'INSERT','Anggota baru dibuat: RUSLAN',NULL,NULL,'2025-10-05 01:41:52'),
(414,390,'INSERT','Anggota baru dibuat: Monic',NULL,NULL,'2025-10-07 11:59:16'),
(415,391,'INSERT','Anggota baru dibuat: Marno',NULL,NULL,'2025-10-10 07:57:09'),
(416,392,'INSERT','Anggota baru dibuat: Rizal',NULL,NULL,'2025-10-10 12:30:51'),
(417,393,'INSERT','Anggota baru dibuat: Muhammad dodi',NULL,NULL,'2025-10-10 13:32:40'),
(418,394,'INSERT','Anggota baru dibuat: BAGUS DWI SULAKSONO',NULL,NULL,'2025-10-11 09:21:46'),
(419,395,'INSERT','Anggota baru dibuat: Hasbi bidol',NULL,NULL,'2025-10-12 07:29:13'),
(420,396,'INSERT','Anggota baru dibuat: Sehay',NULL,NULL,'2025-10-14 09:01:22'),
(421,397,'INSERT','Anggota baru dibuat: Tedi Cahyadi',NULL,NULL,'2025-10-14 09:35:46'),
(422,398,'INSERT','Anggota baru dibuat: Misra',NULL,NULL,'2025-10-14 09:47:40'),
(423,399,'INSERT','Anggota baru dibuat: Febrian',NULL,NULL,'2025-10-14 11:09:51'),
(424,400,'INSERT','Anggota baru dibuat: Tendi Irawan',NULL,NULL,'2025-10-16 09:24:51'),
(425,401,'INSERT','Anggota baru dibuat: Junaedi',NULL,NULL,'2025-10-16 12:23:32'),
(426,402,'INSERT','Anggota baru dibuat: Said',NULL,NULL,'2025-10-17 12:21:12'),
(427,403,'INSERT','Anggota baru dibuat: Sinta',NULL,NULL,'2025-10-17 22:49:18'),
(428,404,'INSERT','Anggota baru dibuat: Erwandi',NULL,NULL,'2025-10-18 23:00:57'),
(429,405,'INSERT','Anggota baru dibuat: Putri amelia',NULL,NULL,'2025-10-19 02:26:51'),
(430,406,'INSERT','Anggota baru dibuat: Titania',NULL,NULL,'2025-10-21 13:46:44'),
(431,407,'INSERT','Anggota baru dibuat: Diana',NULL,NULL,'2025-10-22 00:59:06'),
(432,408,'INSERT','Anggota baru dibuat: Oceng',NULL,NULL,'2025-10-22 05:44:20'),
(433,409,'INSERT','Anggota baru dibuat: Eka Nurwahyuni',NULL,NULL,'2025-10-24 09:21:56'),
(434,410,'INSERT','Anggota baru dibuat: Wulan Amalia Putri',NULL,NULL,'2025-10-27 09:04:19'),
(435,411,'INSERT','Anggota baru dibuat: Andi Duddin',NULL,NULL,'2025-11-01 13:27:36'),
(436,412,'INSERT','Anggota baru dibuat: Alfiah',NULL,NULL,'2025-11-03 03:09:22'),
(437,413,'INSERT','Anggota baru dibuat: Agriani',NULL,NULL,'2025-11-04 03:24:13'),
(438,414,'INSERT','Anggota baru dibuat: LINDA',NULL,NULL,'2025-11-04 03:25:27'),
(439,415,'INSERT','Anggota baru dibuat: Afifa',NULL,NULL,'2025-11-04 12:46:23'),
(440,416,'INSERT','Anggota baru dibuat: Ummil rahimatul afiah',NULL,NULL,'2025-11-06 07:20:22'),
(441,417,'INSERT','Anggota baru dibuat: Nurhidayat',NULL,NULL,'2025-11-11 10:25:56'),
(442,418,'INSERT','Anggota baru dibuat: Widya',NULL,NULL,'2025-11-11 10:29:44'),
(443,419,'INSERT','Anggota baru dibuat: Zaskia putri Rahmadani',NULL,NULL,'2025-11-13 08:36:50'),
(444,420,'INSERT','Anggota baru dibuat: Idawaty djaelany',NULL,NULL,'2025-11-15 02:32:49'),
(445,421,'INSERT','Anggota baru dibuat: Maria Aurel Sonda',NULL,NULL,'2025-11-15 12:37:02'),
(446,422,'INSERT','Anggota baru dibuat: Narisa',NULL,NULL,'2025-11-16 03:01:21'),
(447,423,'INSERT','Anggota baru dibuat: Aldilla Afifah Aisyah Halik',NULL,NULL,'2025-11-16 11:47:47');
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
commit;

--
-- Table structure for table `admin_activity_log`
--

DROP TABLE IF EXISTS `admin_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL COMMENT 'ID admin yang melakukan aktivitas',
  `admin_name` varchar(100) NOT NULL COMMENT 'Nama admin yang melakukan aktivitas',
  `activity_type` enum('login','member_add','member_edit','member_delete','admin_create','admin_delete','transaction','download') NOT NULL COMMENT 'Jenis aktivitas',
  `title` varchar(255) NOT NULL COMMENT 'Judul aktivitas',
  `description` text DEFAULT NULL COMMENT 'Deskripsi aktivitas',
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Detail aktivitas dalam format JSON' CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP address admin',
  `user_agent` text DEFAULT NULL COMMENT 'User agent admin',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Waktu aktivitas',
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_activity_type` (`activity_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_admin_activity` (`admin_id`,`activity_type`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log aktivitas admin';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_activity_log`
--

/*!40000 ALTER TABLE `admin_activity_log` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `admin_activity_log` VALUES
(44,4,'arya','download','Download Data CSV',NULL,'{\"filename\":\"data_pelanggan_2025-08-13.csv\",\"total_records\":266,\"download_time\":\"2025-08-13 12:45:19\"}','2001:448a:70b0:2105:f9c5:fa47:c1dc:c534','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','2025-08-13 04:45:19'),
(45,4,'arya','member_edit','Data Member Diubah',NULL,'{\"member_name\":\"Nur Ristra Jariani\",\"whatsapp\":\"081210442581\",\"member_id\":15,\"changes\":\"Data member diperbarui\"}','2001:448a:70b0:17a2:2396:830:6e2e:4c54','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-15 04:49:30'),
(46,4,'arya','member_edit','Data Member Diubah',NULL,'{\"member_name\":\"Marini\",\"whatsapp\":\"087784802351\",\"member_id\":338,\"changes\":\"Data member diperbarui\"}','2404:c0:6710::761:b6d2','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36','2025-08-23 09:42:43'),
(47,4,'arya','member_edit','Data Member Diubah',NULL,'{\"member_name\":\"Marini\",\"whatsapp\":\"087848023513\",\"member_id\":338,\"changes\":\"Data member diperbarui\"}','2404:c0:6710::761:b6d2','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36','2025-08-23 09:43:25'),
(48,4,'arya','member_edit','Data Member Diubah',NULL,'{\"member_name\":\"Mispa\",\"whatsapp\":\"082293333646\",\"member_id\":346,\"changes\":\"Data member diperbarui\"}','2404:c0:6710::798:c434','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36','2025-08-30 08:38:56'),
(49,4,'arya','member_edit','Data Member Diubah',NULL,'{\"member_name\":\"Sri Wahyuni\",\"whatsapp\":\"082298971398\",\"member_id\":357,\"changes\":\"Data member diperbarui\"}','2404:c0:6610::860:e024','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36','2025-09-06 22:22:47');
/*!40000 ALTER TABLE `admin_activity_log` ENABLE KEYS */;
commit;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT 'Username admin',
  `password_hash` varchar(255) NOT NULL COMMENT 'Hash password admin',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email admin',
  `role` enum('admin','moderator') DEFAULT 'moderator' COMMENT 'Role admin',
  `last_login` timestamp NULL DEFAULT NULL COMMENT 'Login terakhir',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Tanggal dibuat',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Status aktif admin',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel admin users';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `admin_users` VALUES
(2,'daus','$2y$10$D9EIla/r33ee5Oggvkappu1uF2QosjIJQc7uMxhHuuAAHK.X0qWsK','admin@memberdocterbee.site','admin','2025-08-10 06:24:08','2025-08-07 12:01:32',1),
(4,'arya','$2y$10$G0cwz8aKzxP1DnMczTY3e.1tqn.z6DFzucnipMHNp2Newl/2h8A5e',NULL,NULL,'2025-11-16 03:01:27','2025-08-07 12:53:21',1);
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
commit;

--
-- Temporary table structure for view `daily_registrations`
--

DROP TABLE IF EXISTS `daily_registrations`;
/*!50001 DROP VIEW IF EXISTS `daily_registrations`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `daily_registrations` AS SELECT
 1 AS `registration_date`,
  1 AS `registrations`,
  1 AS `active_worker_count`,
  1 AS `family_member_count`,
  1 AS `healthy_smart_kids_count`,
  1 AS `mums_baby_count`,
  1 AS `new_couple_count`,
  1 AS `pregnant_preparation_count`,
  1 AS `senja_ceria_count` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `member_statistics`
--

DROP TABLE IF EXISTS `member_statistics`;
/*!50001 DROP VIEW IF EXISTS `member_statistics`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `member_statistics` AS SELECT
 1 AS `jenis_kartu`,
  1 AS `total_members`,
  1 AS `average_age`,
  1 AS `first_registration`,
  1 AS `latest_registration` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) NOT NULL COMMENT 'Nama lengkap anggota',
  `whatsapp` varchar(20) NOT NULL COMMENT 'Nomor WhatsApp anggota',
  `email` varchar(255) NOT NULL COMMENT 'Email anggota',
  `alamat` text NOT NULL COMMENT 'Alamat lengkap anggota',
  `umur` int(11) NOT NULL COMMENT 'Umur anggota',
  `kegiatan` varchar(255) NOT NULL COMMENT 'Kegiatan atau profesi anggota',
  `jenis_kartu` enum('active_worker','family_member','healthy_smart_kids','mums_baby','new_couple','pregnant_preparation','senja_ceria') NOT NULL COMMENT 'Jenis kartu anggota',
  `kode_unik` varchar(50) NOT NULL COMMENT 'Kode unik untuk setiap kartu',
  `tanggal_berlaku` varchar(100) NOT NULL COMMENT 'Tanggal berlaku kartu',
  `jumlah_pembelian` int(11) DEFAULT 0 COMMENT 'Jumlah transaksi pembelian pelanggan',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Tanggal pendaftaran',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Tanggal update terakhir',
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_unik` (`kode_unik`),
  KEY `idx_kode_unik` (`kode_unik`),
  KEY `idx_whatsapp` (`whatsapp`),
  KEY `idx_email` (`email`),
  KEY `idx_alamat` (`alamat`(100)),
  KEY `idx_umur` (`umur`),
  KEY `idx_kegiatan` (`kegiatan`),
  KEY `idx_jenis_kartu` (`jenis_kartu`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_jumlah_pembelian` (`jumlah_pembelian`)
) ENGINE=InnoDB AUTO_INCREMENT=424 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel data anggota DocterBee';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

/*!40000 ALTER TABLE `members` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `members` VALUES
(7,'ARYA WIBAWA. AR','081342619887','','Kolaka',22,'Founder','active_worker','9887570982260','VALID August 2025 - August 2030',1,'2025-08-07 12:49:42','2025-08-10 06:15:30'),
(12,'Indah wardani','0811408787','','Kolaka',37,'IRT','family_member','8787785154379','VALID August 2025 - August 2030',0,'2025-08-10 00:19:14','2025-08-10 00:19:14'),
(13,'Khusnul amalia ramadhani','082296977980','husnulramadhani496@gmail.con','Jl.daeng passau',24,'Karyawan','active_worker','7980787737330','VALID August 2025 - August 2030',0,'2025-08-10 01:02:17','2025-08-10 01:02:17'),
(14,'Muh. Firdaus','0895374751414','','Makassar',24,'Mahasiswa','active_worker','1414804129317','VALID August 2025 - August 2030',0,'2025-08-10 05:35:29','2025-08-13 05:38:21'),
(15,'Nur Ristra Jariani','081210442581','ristrajariani5@gmail.com','Kendari',22,'IRT','active_worker','2581817164225','VALID August 2025 - August 2030',0,'2025-08-10 09:12:44','2025-08-15 05:49:30'),
(16,'Andi hakim','082373111263','andihakam20@gmail.com','Kolaka',23,'Karyawan','active_worker','1263818689289','VALID August 2025 - August 2030',0,'2025-08-10 09:38:09','2025-08-10 09:38:09'),
(17,'Fitri Permata Sari','082386715653','','Kolaka',34,'Pekerja','active_worker','5653877993224','VALID August 2025 - August 2030',0,'2025-08-11 02:06:33','2025-08-11 02:06:33'),
(18,'Irmayanti','085255436671','','Kolaka',22,'Mahasiswa','family_member','6671878160968','VALID August 2025 - August 2030',0,'2025-08-11 02:09:20','2025-08-11 02:09:20'),
(19,'Umi Helvdah','082292134034','','Kolaka',23,'Pekerja','active_worker','4034878266767','VALID August 2025 - August 2030',0,'2025-08-11 02:11:06','2025-08-11 02:11:06'),
(20,'Satmanto Said','08114055275','','Kolaka',30,'Pekerja','active_worker','5275878508270','VALID August 2025 - August 2030',0,'2025-08-11 02:15:08','2025-08-11 02:15:08'),
(21,'Muhammad','082194463321','','Kolaka',50,'Pekerja','active_worker','3321878588519','VALID August 2025 - August 2030',0,'2025-08-11 02:16:28','2025-08-11 02:16:28'),
(22,'Sigit Umar','085216181444','','Kolaka',32,'Pekerja','active_worker','1444878684682','VALID August 2025 - August 2030',0,'2025-08-11 02:18:04','2025-08-11 02:18:04'),
(23,'Didin','081343595820','','Kolaka',25,'Pekerja','active_worker','5820878770318','VALID August 2025 - August 2030',0,'2025-08-11 02:19:30','2025-08-11 02:19:30'),
(24,'Ilham','082260632622','','Kolaka',27,'Wiraswasta','active_worker','2622878891610','VALID August 2025 - August 2030',0,'2025-08-11 02:21:31','2025-08-11 02:21:31'),
(25,'Uga','082188816661','','Kolaka',34,'Pekerja','active_worker','6661878975206','VALID August 2025 - August 2030',0,'2025-08-11 02:22:55','2025-08-11 02:22:55'),
(26,'Muliadi','081243337576','','Kolaka',40,'Pekerja','active_worker','7576879050530','VALID August 2025 - August 2030',0,'2025-08-11 02:24:10','2025-08-11 02:24:10'),
(27,'Sukadi','082187035222','','Kolaka',30,'Pekerja','active_worker','5222879162214','VALID August 2025 - August 2030',0,'2025-08-11 02:26:02','2025-08-11 02:26:02'),
(28,'Chida','081244297156','','Kolaka',35,'Pekerja','active_worker','7156879252860','VALID August 2025 - August 2030',0,'2025-08-11 02:27:32','2025-08-11 02:27:32'),
(29,'Dhanti','081280266630','','Kolaka',38,'Ibu Rumah Tangga','family_member','6630879340219','VALID August 2025 - August 2030',0,'2025-08-11 02:29:00','2025-08-11 02:29:00'),
(30,'Rizka','082259455055','','Kolaka',18,'Mahasiswa','family_member','5055879423680','VALID August 2025 - August 2030',0,'2025-08-11 02:30:23','2025-08-11 02:30:23'),
(31,'Zulfikar','085399554906','','Kolaka',30,'Pekerja','active_worker','4906879493678','VALID August 2025 - August 2030',0,'2025-08-11 02:31:33','2025-08-11 02:31:33'),
(32,'Defra','082188188203','','Kolaka',32,'Pekerja','active_worker','8203879581855','VALID August 2025 - August 2030',0,'2025-08-11 02:33:01','2025-08-11 02:33:01'),
(33,'Putri','085222911840','','Kolaka',37,'Pekerja','active_worker','1840879677403','VALID August 2025 - August 2030',0,'2025-08-11 02:34:37','2025-08-11 02:34:37'),
(34,'Vuma','085226179105','','Kolaka',31,'Pekerja','active_worker','9105879790330','VALID August 2025 - August 2030',0,'2025-08-11 02:36:30','2025-08-11 02:36:30'),
(35,'Nia','082278464135','','Kolaka',37,'Pekerja','active_worker','4135879867519','VALID August 2025 - August 2030',0,'2025-08-11 02:37:47','2025-08-11 02:37:47'),
(36,'Hamka','085241578199','','Kolaka',44,'Pekerja','active_worker','8199879969384','VALID August 2025 - August 2030',0,'2025-08-11 02:39:29','2025-08-11 02:39:29'),
(37,'Ilga','082291333458','','Kolaka',29,'Wiraswasta','active_worker','3458880045745','VALID August 2025 - August 2030',0,'2025-08-11 02:40:45','2025-08-11 02:40:45'),
(38,'Geby','081253075641','','Kolaka',30,'Pekerja','active_worker','5641880117297','VALID August 2025 - August 2030',0,'2025-08-11 02:41:57','2025-08-11 02:41:57'),
(39,'Ardinan','085215359510','','Kolaka',25,'Pekerja','active_worker','9510880269870','VALID August 2025 - August 2030',0,'2025-08-11 02:44:29','2025-08-11 02:44:29'),
(40,'Azizah','082217981068','','Kolaka',25,'Pekerja','active_worker','1068880342790','VALID August 2025 - August 2030',0,'2025-08-11 02:45:42','2025-08-11 02:45:42'),
(41,'H. Darmi','0811400567','','Kolaka',57,'Pekerja','active_worker','0567880403521','VALID August 2025 - August 2030',0,'2025-08-11 02:46:43','2025-08-11 02:46:43'),
(42,'Erni','085359499337','','Kolaka',27,'Pekerja','active_worker','9337880497588','VALID August 2025 - August 2030',0,'2025-08-11 02:48:17','2025-08-11 02:48:17'),
(43,'Sanjay','082397885182','','Kolaka',18,'Mahasiswa','family_member','5182880613254','VALID August 2025 - August 2030',0,'2025-08-11 02:50:13','2025-08-11 02:50:13'),
(44,'Lisna Uju','085299545390','','Kolaka',50,'Pekerja','active_worker','5390880769345','VALID August 2025 - August 2030',0,'2025-08-11 02:52:49','2025-08-11 02:52:49'),
(45,'Rahma','085342695555','','Kolaka',42,'Ibu Rumah Tangga','family_member','5555880825389','VALID August 2025 - August 2030',0,'2025-08-11 02:53:45','2025-08-11 02:53:45'),
(46,'Ayu','082298943469','','Kolaka',31,'Ibu Rumah Tangga','family_member','3469880894969','VALID August 2025 - August 2030',0,'2025-08-11 02:54:54','2025-08-11 02:54:54'),
(47,'Putri Rahayu Ningsih','082329752526','','Kolaka',25,'Pekerja','active_worker','2526881098565','VALID August 2025 - August 2030',0,'2025-08-11 02:58:18','2025-08-11 02:58:18'),
(48,'Putri Maharani','081215507338','','Kolaka',22,'Pekerja','active_worker','7338881218442','VALID August 2025 - August 2030',0,'2025-08-11 03:00:18','2025-08-11 03:00:18'),
(49,'Arman Sagita','085242184750','','Kolaka',31,'Pekerja','active_worker','4750881385168','VALID August 2025 - August 2030',0,'2025-08-11 03:03:05','2025-08-11 03:03:05'),
(50,'Norma','082296255414','','Kolaka',32,'Pekerja','active_worker','5414881489303','VALID August 2025 - August 2030',0,'2025-08-11 03:04:49','2025-08-11 03:04:49'),
(51,'Arjuna SKM','082259606287','','Kolaka',19,'Pekerja','active_worker','6287881600133','VALID August 2025 - August 2030',0,'2025-08-11 03:06:40','2025-08-11 03:06:40'),
(52,'Hasnah','085299266181','','Kolaka',45,'Pekerja','active_worker','6181881726488','VALID August 2025 - August 2030',0,'2025-08-11 03:08:46','2025-08-11 03:08:46'),
(53,'Adienia','082210713409','','Kolaka',31,'Ibu Rumah Tangga','family_member','3409881868612','VALID August 2025 - August 2030',0,'2025-08-11 03:11:08','2025-08-11 03:11:08'),
(54,'Khusnul Khotimah','081354569371','','Kolaka',25,'Pekerja','active_worker','9371881980909','VALID August 2025 - August 2030',0,'2025-08-11 03:13:00','2025-08-11 03:13:00'),
(55,'Akbar','082296312398','','Kolaka',30,'Pekerja','active_worker','2398882058997','VALID August 2025 - August 2030',0,'2025-08-11 03:14:18','2025-08-11 03:14:18'),
(56,'Irwan','082333881949','','Kolaka',30,'Pekerja','active_worker','1949882183144','VALID August 2025 - August 2030',0,'2025-08-11 03:16:23','2025-08-11 03:16:23'),
(57,'Firman','081341542659','','Kolaka',45,'Wiraswasta','active_worker','2659882279240','VALID August 2025 - August 2030',0,'2025-08-11 03:17:59','2025-08-11 03:17:59'),
(58,'Yudis','081231731447','','Kolaka',23,'Pekerja','active_worker','1447882380382','VALID August 2025 - August 2030',0,'2025-08-11 03:19:40','2025-08-11 03:19:40'),
(59,'Irfan','085333375778','','Kolaka',45,'Pekerja','active_worker','5778882480615','VALID August 2025 - August 2030',0,'2025-08-11 03:21:20','2025-08-11 03:21:20'),
(60,'Tenri','085242716937','','Kolaka',30,'Ibu Rumah Tangga','family_member','6937882554432','VALID August 2025 - August 2030',0,'2025-08-11 03:22:34','2025-08-11 03:22:34'),
(61,'Ummy','081329239112','','Kolaka',23,'Mahasiswa','family_member','9112882630798','VALID August 2025 - August 2030',0,'2025-08-11 03:23:50','2025-08-11 03:23:50'),
(62,'Agus Leman','085241521299','','Kolaka',37,'Wiraswasta','active_worker','1299882695738','VALID August 2025 - August 2030',0,'2025-08-11 03:24:55','2025-08-11 03:24:55'),
(63,'Darmawati','082234606737','','Kolaka',35,'Ibu Rumah Tangga','family_member','6737882759877','VALID August 2025 - August 2030',0,'2025-08-11 03:25:59','2025-08-11 03:25:59'),
(64,'Samdar','082259415155','','Kolaka',23,'Pekerja','active_worker','5155883759994','VALID August 2025 - August 2030',0,'2025-08-11 03:42:39','2025-08-11 03:42:39'),
(65,'Hikma','082217980633','','Kolaka',36,'Pekerja','active_worker','0633883948594','VALID August 2025 - August 2030',0,'2025-08-11 03:45:48','2025-08-11 03:45:48'),
(66,'Wawan','085203017854','','Kolaka',35,'Pekerja','active_worker','7854884146825','VALID August 2025 - August 2030',0,'2025-08-11 03:49:06','2025-08-11 03:49:06'),
(67,'Muthmainnah','085796240801','','Kol',36,'Pekerja','active_worker','0801884212301','VALID August 2025 - August 2030',0,'2025-08-11 03:50:12','2025-08-11 03:50:12'),
(68,'Aldo','081245255166','','Kolaka',23,'Peker','active_worker','5166884285527','VALID August 2025 - August 2030',0,'2025-08-11 03:51:25','2025-08-11 03:51:25'),
(69,'Hermin','082234322800','','Kolaka',29,'Pekerja','active_worker','2800884386711','VALID August 2025 - August 2030',0,'2025-08-11 03:53:06','2025-08-11 03:53:06'),
(70,'Neng Ira F','085363848072','','Kolaka',34,'Pekerja','active_worker','8072884468731','VALID August 2025 - August 2030',0,'2025-08-11 03:54:28','2025-08-11 03:54:28'),
(71,'Fanny Sanasri','082393211615','','Kolaka',34,'Pek','active_worker','1615884549751','VALID August 2025 - August 2030',0,'2025-08-11 03:55:49','2025-08-11 03:55:49'),
(72,'Takdir','085342726419','','Kolaka',27,'Pekerja','active_worker','6419884626361','VALID August 2025 - August 2030',0,'2025-08-11 03:57:06','2025-08-11 03:57:06'),
(73,'Ito','081916776488','','Kolaka',26,'Wiraswasta','active_worker','6488884699581','VALID August 2025 - August 2030',0,'2025-08-11 03:58:19','2025-08-11 03:58:19'),
(74,'Nurul Izzah','081356874855','','Kolaka',33,'Ibu Rumah Tangga','active_worker','4855884772981','VALID August 2025 - August 2030',0,'2025-08-11 03:59:32','2025-08-11 03:59:32'),
(75,'Wulan Harun','082348609803','','Kolaka',25,'Mahasiswa','family_member','9803884832593','VALID August 2025 - August 2030',0,'2025-08-11 04:00:32','2025-08-11 04:00:32'),
(76,'Febrian','081311913691','','Kolaka',29,'Wiraswasta','active_worker','3691884911621','VALID August 2025 - August 2030',0,'2025-08-11 04:01:51','2025-08-11 04:01:51'),
(77,'Riezka Eka','085255159550','','Kolaka',41,'Pekerja','active_worker','9550885052892','VALID August 2025 - August 2030',0,'2025-08-11 04:04:12','2025-08-11 04:04:12'),
(78,'Marben','082290522515','','Kolaka',42,'Pekerja','active_worker','2515886611297','VALID August 2025 - August 2030',0,'2025-08-11 04:30:11','2025-08-11 04:30:11'),
(79,'Fina','081245671236','','Kolaka',30,'Ibu Rumah Tangga','family_member','1236886700793','VALID August 2025 - August 2030',0,'2025-08-11 04:31:40','2025-08-11 04:31:40'),
(80,'Uni','085298426606','','Kolaka',41,'Pekerja','active_worker','6606886909560','VALID August 2025 - August 2030',0,'2025-08-11 04:35:09','2025-08-11 04:35:09'),
(81,'Irwan','085299037188','','Kolaka',32,'Pekerja','active_worker','7188887019204','VALID August 2025 - August 2030',0,'2025-08-11 04:36:59','2025-08-11 04:36:59'),
(82,'Ian','085241758789','','Kolaka',52,'Wiraswasta','active_worker','8789887113225','VALID August 2025 - August 2030',0,'2025-08-11 04:38:33','2025-08-11 04:38:33'),
(83,'Andhika','082191482150','','Kolaka',23,'Wiraswasta','active_worker','2150887231350','VALID August 2025 - August 2030',0,'2025-08-11 04:40:31','2025-08-11 04:40:31'),
(84,'Baskara','085256486441','','Kolaka',28,'Wiraswasta','active_worker','6441887337685','VALID August 2025 - August 2030',0,'2025-08-11 04:42:17','2025-08-11 04:42:17'),
(85,'Amanda','082190936706','','Kolaka',19,'Mahasiswa','active_worker','6706887451112','VALID August 2025 - August 2030',0,'2025-08-11 04:44:11','2025-08-11 04:44:11'),
(86,'Jumaria','082346518850','','Kolaka',36,'Ibu Rumah Tangga','family_member','8850887624471','VALID August 2025 - August 2030',0,'2025-08-11 04:47:04','2025-08-11 04:47:04'),
(87,'Aini Indrijawati','082191941588','','Kolaka',27,'Peker','active_worker','1588887779762','VALID August 2025 - August 2030',0,'2025-08-11 04:49:39','2025-08-11 04:49:39'),
(88,'A. Besse Patadjai','082327777515','','Kolaka',30,'Pekerja','active_worker','7515887883714','VALID August 2025 - August 2030',0,'2025-08-11 04:51:23','2025-08-11 04:51:23'),
(89,'Intihanah','08114033117','','Kolaka',25,'Pekerja','active_worker','3117888036551','VALID August 2025 - August 2030',0,'2025-08-11 04:53:56','2025-08-11 04:53:56'),
(90,'Rosnawintang','082290313739','','Kolaka',30,'Pekerja','active_worker','3739888137549','VALID August 2025 - August 2030',0,'2025-08-11 04:55:37','2025-08-11 04:55:37'),
(91,'Nono','081341789199','','Kolaka',44,'Wiraswasta','active_worker','9199888215776','VALID August 2025 - August 2030',0,'2025-08-11 04:56:55','2025-08-11 04:56:55'),
(92,'Herman Saputra','085253843788','','Kolaka',36,'Pekerja','active_worker','3788888306653','VALID August 2025 - August 2030',0,'2025-08-11 04:58:26','2025-08-11 04:58:26'),
(93,'Syahria Nur','081341880280','','Kolaka',44,'Ibu Rumah Tangga','active_worker','0280888382278','VALID August 2025 - August 2030',0,'2025-08-11 04:59:42','2025-08-11 04:59:42'),
(94,'Endri Bakti','085242644512','','Kolaka',32,'Pekerja','active_worker','4512888479411','VALID August 2025 - August 2030',0,'2025-08-11 05:01:19','2025-08-11 05:01:19'),
(95,'Serly Wahyuni','0811400528','','Kolaka',32,'Pekerja','active_worker','0528888579358','VALID August 2025 - August 2030',0,'2025-08-11 05:02:59','2025-08-11 05:02:59'),
(96,'Fatwa','082189574787','','Kolaka',39,'Wiraswasta','active_worker','4787890311805','VALID August 2025 - August 2030',0,'2025-08-11 05:31:51','2025-08-11 05:31:51'),
(97,'Sabril','085299621222','','Kolaka',34,'Wiraswasta','active_worker','1222890414503','VALID August 2025 - August 2030',0,'2025-08-11 05:33:34','2025-08-11 05:33:34'),
(98,'Risfa','081245657320','','Kolaka',25,'Wiraswasta','active_worker','7320890548966','VALID August 2025 - August 2030',0,'2025-08-11 05:35:48','2025-08-11 05:35:48'),
(99,'Ramla','085146261634','','Kolaka',25,'Pekerja','active_worker','1634890736888','VALID August 2025 - August 2030',0,'2025-08-11 05:38:56','2025-08-11 05:38:56'),
(100,'Erwin Sain','0822551466804','','Kolaka',33,'Pekerja','active_worker','6804891255923','VALID August 2025 - August 2030',0,'2025-08-11 05:47:35','2025-08-11 05:47:35'),
(101,'Angel','082191142683','','Kolaka',26,'Pekerja','active_worker','2683891316272','VALID August 2025 - August 2030',0,'2025-08-11 05:48:36','2025-08-11 05:48:36'),
(102,'Siti Adinela','085157732557','','Kolaka',25,'Wiraswasta','active_worker','2557891537173','VALID August 2025 - August 2030',0,'2025-08-11 05:52:17','2025-08-11 05:52:17'),
(103,'Alex','083169033687','','Kolaka',25,'Pekerja','active_worker','3687891794981','VALID August 2025 - August 2030',0,'2025-08-11 05:56:34','2025-08-11 05:56:34'),
(104,'Indah','08114087877','','Kolaka',24,'Pekerja','active_worker','7877891914708','VALID August 2025 - August 2030',0,'2025-08-11 05:58:34','2025-08-11 05:58:34'),
(105,'Sri','085823584802','','Kolaka',24,'Pekerja','active_worker','4802892006421','VALID August 2025 - August 2030',0,'2025-08-11 06:00:06','2025-08-11 06:00:06'),
(106,'Iksan','08114359805','','Kolaka',28,'Pekerja','active_worker','9805892588531','VALID August 2025 - August 2030',0,'2025-08-11 06:09:48','2025-08-11 06:09:48'),
(107,'Andi Mirwat','085255109219','','Kolaka',34,'Pekerja','active_worker','9219892681926','VALID August 2025 - August 2030',0,'2025-08-11 06:11:21','2025-08-11 06:11:21'),
(108,'Sultan','082237640330','','Kolaka',27,'Pekerja','active_worker','0330892732740','VALID August 2025 - August 2030',0,'2025-08-11 06:12:12','2025-08-11 06:12:12'),
(109,'Ririn','085340579378','','Kolaka',30,'Pekerja','active_worker','9378892785536','VALID August 2025 - August 2030',0,'2025-08-11 06:13:05','2025-08-11 06:13:05'),
(110,'Reka','082291734895','','Kolaka',25,'Pekerja','active_worker','4895892924526','VALID August 2025 - August 2030',0,'2025-08-11 06:15:24','2025-08-11 06:15:24'),
(111,'Zahra','082292420540','','Kolaka',24,'Peker','active_worker','0540893114852','VALID August 2025 - August 2030',0,'2025-08-11 06:18:34','2025-08-11 06:18:34'),
(112,'Andi Sastra','081241235957','','Kolaka',62,'Pekerja','active_worker','5957893181681','VALID August 2025 - August 2030',0,'2025-08-11 06:19:41','2025-08-11 06:19:41'),
(113,'Armi','082349552699','','Kolaka',41,'Pekerja','active_worker','2699893219700','VALID August 2025 - August 2030',0,'2025-08-11 06:20:19','2025-08-11 06:20:19'),
(114,'Wirandha','082140005931','','Kolaka',21,'Pekerja','active_worker','5931893539339','VALID August 2025 - August 2030',0,'2025-08-11 06:25:39','2025-08-11 06:25:39'),
(115,'Padiatno','085241825036','','Kolaka',48,'Pekerja','active_worker','5036893663424','VALID August 2025 - August 2030',0,'2025-08-11 06:27:43','2025-08-11 06:27:43'),
(116,'Wiwi','085241955774','','Kolaka',40,'Pek','active_worker','5774894763422','VALID August 2025 - August 2030',0,'2025-08-11 06:46:03','2025-08-11 06:46:03'),
(117,'Nur','082329287324','','Kolaka',25,'Pekerja','active_worker','7324894872857','VALID August 2025 - August 2030',0,'2025-08-11 06:47:52','2025-08-11 06:47:52'),
(118,'Jamil','082211678737','','Kolaka',33,'Pekerja','active_worker','8737894989862','VALID August 2025 - August 2030',0,'2025-08-11 06:49:49','2025-08-11 06:49:49'),
(119,'Fitri','085294458162','','Kolaka',33,'Pekerja','active_worker','8162895114527','VALID August 2025 - August 2030',0,'2025-08-11 06:51:54','2025-08-11 06:51:54'),
(120,'Vivi','085398790906','','Kolaka',34,'Pekerja','active_worker','0906895197607','VALID August 2025 - August 2030',0,'2025-08-11 06:53:17','2025-08-11 06:53:17'),
(121,'Emy','0811417056','','Kolaka',50,'Pekerja','active_worker','7056895291653','VALID August 2025 - August 2030',0,'2025-08-11 06:54:51','2025-08-11 06:54:51'),
(122,'Dila','082190312049','','Kolaka',28,'Pekerja','active_worker','2049895393374','VALID August 2025 - August 2030',0,'2025-08-11 06:56:33','2025-08-11 06:56:33'),
(123,'Uki','082290034767','','Kolaka',36,'Pekerja','active_worker','4767895456573','VALID August 2025 - August 2030',0,'2025-08-11 06:57:36','2025-08-11 06:57:36'),
(124,'Taufik','085255189244','','Kolaka',28,'Pekerja','active_worker','9244895621841','VALID August 2025 - August 2030',0,'2025-08-11 07:00:21','2025-08-11 07:00:21'),
(125,'Syamsu Riam','082347903070','','Kolaka',30,'Pekerja','active_worker','3070895702338','VALID August 2025 - August 2030',0,'2025-08-11 07:01:42','2025-08-11 07:01:42'),
(126,'Rio','081216824082','','Kolaka',27,'Pekerja','active_worker','4082895789944','VALID August 2025 - August 2030',0,'2025-08-11 07:03:09','2025-08-11 07:03:09'),
(127,'Adrian','085294171584','','Kolaka',25,'Pekerja','active_worker','1584895886285','VALID August 2025 - August 2030',0,'2025-08-11 07:04:46','2025-08-11 07:04:46'),
(128,'Irma','081355616225','','Kolaka',36,'Pekerja','active_worker','6225895947869','VALID August 2025 - August 2030',0,'2025-08-11 07:05:47','2025-08-11 07:05:47'),
(129,'Wawan','081362130159','','Kolaka',25,'Pekerja','active_worker','0159896007500','VALID August 2025 - August 2030',0,'2025-08-11 07:06:47','2025-08-11 07:06:47'),
(130,'Vira','082292835562','','Kolaka',25,'Pekerja','active_worker','5562896129469','VALID August 2025 - August 2030',0,'2025-08-11 07:08:49','2025-08-11 07:08:49'),
(131,'Bu. Ros','082337050612','','Kolaka',50,'Pekerja','active_worker','0612896292371','VALID August 2025 - August 2030',0,'2025-08-11 07:11:32','2025-08-11 07:11:32'),
(132,'Arya','082393620133','','Kolaka',16,'Mahasiswa','family_member','0133896355660','VALID August 2025 - August 2030',0,'2025-08-11 07:12:35','2025-08-11 07:12:35'),
(133,'Ibu Novi','085211552204','','Kolaka',42,'Pekerja','active_worker','2204896427193','VALID August 2025 - August 2030',0,'2025-08-11 07:13:47','2025-08-11 07:13:47'),
(134,'Cika Jessica','082190488810','','Kolaka',26,'Pekerja','active_worker','8810896476611','VALID August 2025 - August 2030',0,'2025-08-11 07:14:36','2025-08-11 07:14:36'),
(135,'Aisyah','082288894873','','Kolaka',25,'Pekerja','active_worker','4873897208269','VALID August 2025 - August 2030',0,'2025-08-11 07:26:48','2025-08-11 07:26:48'),
(136,'Andi Lukman','082152402568','','Kolaka',44,'Pekerja','active_worker','2568897311620','VALID August 2025 - August 2030',0,'2025-08-11 07:28:31','2025-08-11 07:28:31'),
(137,'Sintia','081264446000','','Kolaka',27,'Pekerja','active_worker','6000897489815','VALID August 2025 - August 2030',0,'2025-08-11 07:31:29','2025-08-11 07:31:29'),
(138,'Andrita purnamasari','085648352058','andritapurnama@gmail.com','Lalombaa',32,'Pns','active_worker','2058913277176','VALID August 2025 - August 2030',0,'2025-08-11 11:54:37','2025-08-11 11:54:37'),
(139,'Nita Natalia','082214782724','','Kolaka',40,'Pekerja','active_worker','2724047730889','VALID August 2025 - August 2030',0,'2025-08-13 01:15:30','2025-08-13 01:15:30'),
(140,'A. Wahyuni','085255693963','','Kolaka',27,'Pekerja','active_worker','3963047820724','VALID August 2025 - August 2030',0,'2025-08-13 01:17:00','2025-08-13 01:17:00'),
(141,'Siti Ramadi','082195535121','','Kolaka',40,'Ibu Rumah Tangga','family_member','5121047911951','VALID August 2025 - August 2030',0,'2025-08-13 01:18:31','2025-08-13 01:18:31'),
(142,'Sri Hariati','085242450729','','Kolaka',30,'Pekerja','active_worker','0729047982716','VALID August 2025 - August 2030',0,'2025-08-13 01:19:42','2025-08-13 01:19:42'),
(143,'Yuditya Efrizal Nur','082345687859','','Kolaka',25,'Pekerja','active_worker','7859048063349','VALID August 2025 - August 2030',0,'2025-08-13 01:21:03','2025-08-13 01:21:03'),
(144,'Faisal','085397912026','','Kolaka',26,'Pekerja','active_worker','2026048141163','VALID August 2025 - August 2030',0,'2025-08-13 01:22:21','2025-08-13 01:22:21'),
(145,'Fathia Wafi','085711547936','','Kolaka',25,'Pekerja','active_worker','7936048237403','VALID August 2025 - August 2030',0,'2025-08-13 01:23:57','2025-08-13 01:23:57'),
(146,'Rul','08134645475','','Kolaka',40,'Pekerja','active_worker','5475048371545','VALID August 2025 - August 2030',0,'2025-08-13 01:26:11','2025-08-13 01:26:11'),
(147,'Farida','085213802899','','Kolaka',45,'Pekerja','active_worker','2899048435212','VALID August 2025 - August 2030',0,'2025-08-13 01:27:15','2025-08-13 01:27:15'),
(148,'Achmad','082190451117','','Kolaka',41,'Pekerja','active_worker','1117048541865','VALID August 2025 - August 2030',0,'2025-08-13 01:29:01','2025-08-13 01:29:01'),
(149,'Nur Leli','081341960123','','Kolaka',50,'Pekerja','active_worker','0123048597190','VALID August 2025 - August 2030',0,'2025-08-13 01:29:57','2025-08-13 01:29:57'),
(150,'Hasbi','085241516270','','Kolaka',60,'Pekerja','active_worker','6270048722991','VALID August 2025 - August 2030',0,'2025-08-13 01:32:02','2025-08-13 01:32:02'),
(151,'Iva','081343866808','','Kolaka',39,'Pekerja','active_worker','6808048775774','VALID August 2025 - August 2030',0,'2025-08-13 01:32:55','2025-08-13 01:32:55'),
(152,'Andi Nurul Hidaya Azzahara','082190561827','','Kolaka',25,'Pekerja','active_worker','1827048842918','VALID August 2025 - August 2030',0,'2025-08-13 01:34:02','2025-08-13 01:34:02'),
(153,'Hasnawati','081341612204','','Kolaka',49,'Pekerja','active_worker','2204048935141','VALID August 2025 - August 2030',0,'2025-08-13 01:35:35','2025-08-13 01:35:35'),
(154,'Nasrul','087840055000','','Kolaka',54,'Pekerja','active_worker','5000049044103','VALID August 2025 - August 2030',0,'2025-08-13 01:37:24','2025-08-13 01:37:24'),
(155,'Apriani','085255053123','','Kolaka',40,'Pekerja','active_worker','3123050269803','VALID August 2025 - August 2030',0,'2025-08-13 01:57:49','2025-08-13 01:57:49'),
(156,'Yuli','081355026964','','Kolaka',38,'Pekerja','active_worker','6964050330691','VALID August 2025 - August 2030',0,'2025-08-13 01:58:50','2025-08-13 01:58:50'),
(157,'Dian','085343911120','','Kolaka',35,'Pekerja','active_worker','1120050395485','VALID August 2025 - August 2030',0,'2025-08-13 01:59:55','2025-08-13 01:59:55'),
(158,'Yulita','085241703103','','Kolaka',26,'Pekerja','active_worker','3103050479548','VALID August 2025 - August 2030',0,'2025-08-13 02:01:19','2025-08-13 02:01:19'),
(159,'Erwin Hatta','085241255757','','Kolaka',53,'Pekerja','active_worker','5757050562145','VALID August 2025 - August 2030',0,'2025-08-13 02:02:42','2025-08-13 02:02:42'),
(160,'Salam','085341845678','','Kolaka',40,'Pekerja','active_worker','5678050639640','VALID August 2025 - August 2030',0,'2025-08-13 02:03:59','2025-08-13 02:03:59'),
(161,'Titi','08781828769','','Kolaka',41,'Ibu Rumah Tangga','family_member','8769050776629','VALID August 2025 - August 2030',0,'2025-08-13 02:06:16','2025-08-13 02:06:16'),
(162,'Ibu Ipah','081341513181','','Kolaka',30,'Ibu Rumah Tangga','active_worker','3181050841839','VALID August 2025 - August 2030',0,'2025-08-13 02:07:21','2025-08-13 02:07:21'),
(163,'Riyanto','081342312369','','Kolaka',40,'Pekerja','active_worker','2369050903162','VALID August 2025 - August 2030',0,'2025-08-13 02:08:23','2025-08-13 02:08:23'),
(164,'Syahra Annisa','082393279307','','Kolaka',24,'Pekerja','active_worker','9307050972508','VALID August 2025 - August 2030',0,'2025-08-13 02:09:32','2025-08-13 02:09:32'),
(165,'Naswar','085395228333','','Kolaka',40,'Wiraswasta','active_worker','8333051044242','VALID August 2025 - August 2030',0,'2025-08-13 02:10:44','2025-08-13 02:10:44'),
(166,'Kiki','081342354253','','Kola',52,'Pekerja','active_worker','4253051101529','VALID August 2025 - August 2030',0,'2025-08-13 02:11:41','2025-08-13 02:11:41'),
(167,'Marwa','082296667928','','Kolaka',29,'Ibu Rumah Tangga','active_worker','7928051227444','VALID August 2025 - August 2030',0,'2025-08-13 02:13:47','2025-08-13 02:13:47'),
(168,'Leny','082191362178','','Kolaka',45,'Pekerja','active_worker','2178051288338','VALID August 2025 - August 2030',0,'2025-08-13 02:14:48','2025-08-13 02:14:48'),
(169,'Ully Hidayah','082330998466','','Kolaka',31,'Pekerja','active_worker','8466051364606','VALID August 2025 - August 2030',0,'2025-08-13 02:16:04','2025-08-13 02:16:04'),
(170,'Miswandi Tendi','082345803293','','Kolaka',32,'Pekerja','active_worker','3293051567396','VALID August 2025 - August 2030',0,'2025-08-13 02:19:27','2025-08-13 02:19:27'),
(171,'Dewi Intan','0811401417','','Kolaka',39,'Pekerja','active_worker','1417051617716','VALID August 2025 - August 2030',0,'2025-08-13 02:20:17','2025-08-13 02:20:17'),
(172,'Yunita Nur','081340263672','','Kolaka',31,'Pekerja','active_worker','3672051684599','VALID August 2025 - August 2030',0,'2025-08-13 02:21:24','2025-08-13 02:21:24'),
(173,'Hj. Asma','081341218946','','Kolaka',53,'Ibu Rumah Tangga','family_member','8946051746736','VALID August 2025 - August 2030',0,'2025-08-13 02:22:26','2025-08-13 02:22:26'),
(174,'Mappatoba','082349580669','','Kolaka',56,'Pekerja','active_worker','0669052040111','VALID August 2025 - August 2030',0,'2025-08-13 02:27:20','2025-08-13 02:27:20'),
(175,'Risna','082347786385','','Kolaka',39,'Pekerja','active_worker','6385052162514','VALID August 2025 - August 2030',0,'2025-08-13 02:29:22','2025-08-13 02:29:22'),
(176,'Andi Firman','081343609999','','Kolaka',52,'Pekerja','active_worker','9999052302359','VALID August 2025 - August 2030',0,'2025-08-13 02:31:42','2025-08-13 02:31:42'),
(177,'Lina','085341823506','','Kolaka',48,'Pekerja','active_worker','3506052389187','VALID August 2025 - August 2030',0,'2025-08-13 02:33:09','2025-08-13 02:33:09'),
(178,'Abdul Kadir','082346742375','','Kolaka',30,'Pekerja','active_worker','2375052438620','VALID August 2025 - August 2030',0,'2025-08-13 02:33:58','2025-08-13 02:33:58'),
(179,'Astuti','0811401280','','Kolaka',44,'Pekerja','active_worker','1280052481441','VALID August 2025 - August 2030',0,'2025-08-13 02:34:41','2025-08-13 02:34:41'),
(180,'Hatianti','085945892316','','Kolaka',48,'Pekerja','active_worker','2316052553506','VALID August 2025 - August 2030',0,'2025-08-13 02:35:53','2025-08-13 02:35:53'),
(181,'Musyarrafah','085246633379','','Kolaka',30,'Pekerja','active_worker','3379052646968','VALID August 2025 - August 2030',0,'2025-08-13 02:37:26','2025-08-13 02:37:26'),
(182,'Muh. Syafwan. N','082189226633','','Kolaka',25,'Mahasiswa','family_member','6633052817739','VALID August 2025 - August 2030',0,'2025-08-13 02:40:17','2025-08-13 02:40:17'),
(183,'Feby Haspika','081314565642','','Kolaka',22,'Mahasiswa','family_member','5642052943490','VALID August 2025 - August 2030',0,'2025-08-13 02:42:23','2025-08-13 02:42:23'),
(184,'Cica','081344000866','','Kolaka',33,'Pekerja','active_worker','0866053018620','VALID August 2025 - August 2030',0,'2025-08-13 02:43:38','2025-08-13 02:43:38'),
(185,'Putri Nur Qalbi','082324008882','','Kolaka',35,'Ibu Rumah Tangga','family_member','8882053158416','VALID August 2025 - August 2030',0,'2025-08-13 02:45:58','2025-08-13 02:45:58'),
(186,'Nurdin','085241045337','','Kolaka',48,'Pekerja','active_worker','5337053218501','VALID August 2025 - August 2030',0,'2025-08-13 02:46:58','2025-08-13 02:46:58'),
(187,'Ifan Bonafat','085242111977','','Kolaka',25,'Wiraswasta','active_worker','1977053282522','VALID August 2025 - August 2030',0,'2025-08-13 02:48:02','2025-08-13 02:48:02'),
(188,'Megawati','085340453538','','Kolaka',24,'Pekerja','active_worker','3538053383863','VALID August 2025 - August 2030',0,'2025-08-13 02:49:43','2025-08-13 02:49:43'),
(189,'Aldi','082255714669','','Kolaka',32,'Pekerja','active_worker','4669053443447','VALID August 2025 - August 2030',0,'2025-08-13 02:50:43','2025-08-13 02:50:43'),
(190,'Ceria','085242466228','','Kolaka',25,'Pekerja','active_worker','6228053504433','VALID August 2025 - August 2030',0,'2025-08-13 02:51:44','2025-08-13 02:51:44'),
(191,'Desy','085241444830','','Kolaka',27,'Pekerja','active_worker','4830053570999','VALID August 2025 - August 2030',0,'2025-08-13 02:52:50','2025-08-13 02:52:50'),
(192,'Aulia','085342156463','','Kolaka',25,'Pekerja','active_worker','6463053642363','VALID August 2025 - August 2030',0,'2025-08-13 02:54:02','2025-08-13 02:54:02'),
(193,'Cece','085285121492','','Kolaka',34,'Pekerja','active_worker','1492053689417','VALID August 2025 - August 2030',0,'2025-08-13 02:54:49','2025-08-13 02:54:49'),
(194,'Ena Suaib','082346534466','','Kolaka',25,'Pekerja','active_worker','4466053773109','VALID August 2025 - August 2030',0,'2025-08-13 02:56:13','2025-08-13 02:56:13'),
(195,'Sudi','082323311113','','Kolaka',45,'Wiraswasta','active_worker','1113053969777','VALID August 2025 - August 2030',0,'2025-08-13 02:59:29','2025-08-13 02:59:29'),
(196,'Ekal','082292587935','','Kolaka',30,'Wiraswasta','active_worker','7935054028147','VALID August 2025 - August 2030',0,'2025-08-13 03:00:28','2025-08-13 03:00:28'),
(197,'Isnawati','082189274843','','Kolaka',30,'Pekerja','active_worker','4843054095673','VALID August 2025 - August 2030',0,'2025-08-13 03:01:35','2025-08-13 03:01:35'),
(198,'Muli','085145011038','','Kolaka',30,'Pekerja','active_worker','1038054152473','VALID August 2025 - August 2030',0,'2025-08-13 03:02:32','2025-08-13 03:02:32'),
(199,'Hj. Yuli','081245672566','','Kolaka',30,'Pekerja','active_worker','2566054367896','VALID August 2025 - August 2030',0,'2025-08-13 03:06:07','2025-08-13 03:06:07'),
(200,'Hj. Rosnawi','081344977197','','Kolaka',40,'Pekerja','active_worker','7197054451350','VALID August 2025 - August 2030',0,'2025-08-13 03:07:31','2025-08-13 03:07:31'),
(201,'Hj. Ida','085396875556','','Kolaka',40,'Pekerja','active_worker','5556054514541','VALID August 2025 - August 2030',0,'2025-08-13 03:08:34','2025-08-13 03:08:34'),
(202,'Nana','082193287537','','Kolaka',33,'Pekerja','active_worker','7537054580825','VALID August 2025 - August 2030',0,'2025-08-13 03:09:40','2025-08-13 03:09:40'),
(203,'Nur Ainun','082398679866','','Kolaka',29,'Pekerja','active_worker','9866054656744','VALID August 2025 - August 2030',0,'2025-08-13 03:10:56','2025-08-13 03:10:56'),
(204,'Junaedi','085342248698','','Kolaka',32,'Pekerja','active_worker','8698054712337','VALID August 2025 - August 2030',0,'2025-08-13 03:11:52','2025-08-13 03:11:52'),
(205,'Amid','081393333860','','Kolaka',37,'Pekerja','active_worker','3860054766687','VALID August 2025 - August 2030',0,'2025-08-13 03:12:46','2025-08-13 03:12:46'),
(206,'Hasna','081342028889','','Kolaka',51,'Pekerja','active_worker','8889054817481','VALID August 2025 - August 2030',0,'2025-08-13 03:13:37','2025-08-13 03:13:37'),
(207,'Nurianti','082271295014','','Kolaka',40,'Pekerja','active_worker','5014054882808','VALID August 2025 - August 2030',0,'2025-08-13 03:14:42','2025-08-13 03:14:42'),
(208,'Suhaji','081341717144','','Kolaka',29,'Pekerja','active_worker','7144054937614','VALID August 2025 - August 2030',0,'2025-08-13 03:15:37','2025-08-13 03:15:37'),
(209,'Dede','081232330342','','Kolaka',37,'Pekerja','active_worker','0342054984186','VALID August 2025 - August 2030',0,'2025-08-13 03:16:24','2025-08-13 03:16:24'),
(210,'Bambang','08114377572','','Kolaka',52,'Pekerja','active_worker','7572055034735','VALID August 2025 - August 2030',0,'2025-08-13 03:17:14','2025-08-13 03:17:14'),
(211,'Irjan','08124320303','','Kolaka',52,'Pekerja','active_worker','0303055079269','VALID August 2025 - August 2030',0,'2025-08-13 03:17:59','2025-08-13 03:17:59'),
(212,'Nida','082399628570','','Kolaka',22,'Pekerja','active_worker','8570055118937','VALID August 2025 - August 2030',0,'2025-08-13 03:18:38','2025-08-13 03:18:38'),
(213,'Sarwan','082195998177','','Kolaka',40,'Pekerja','active_worker','8177055164358','VALID August 2025 - August 2030',0,'2025-08-13 03:19:24','2025-08-13 03:19:24'),
(214,'Ikrar','085343928046','','Kolaka',25,'Pekerja','active_worker','8046055203525','VALID August 2025 - August 2030',0,'2025-08-13 03:20:03','2025-08-13 03:20:03'),
(215,'Alda','082384176289','','Kolaka',25,'Pekerja','active_worker','6289055238296','VALID August 2025 - August 2030',0,'2025-08-13 03:20:38','2025-08-13 03:20:38'),
(216,'Gadista. B','082189453998','','Kolaka',26,'Pekerja','active_worker','3998055563179','VALID August 2025 - August 2030',0,'2025-08-13 03:26:03','2025-08-13 03:26:03'),
(217,'Yuni','082252847441','','Kolaka',34,'Pekerja','active_worker','7441055601715','VALID August 2025 - August 2030',0,'2025-08-13 03:26:41','2025-08-13 03:26:41'),
(218,'Rita','085241778771','','Kolaka',57,'Pekerja','active_worker','8771055640320','VALID August 2025 - August 2030',0,'2025-08-13 03:27:20','2025-08-13 03:27:20'),
(219,'Virda','0811403944','','Kolaka',27,'Pekerja','active_worker','3944055690203','VALID August 2025 - August 2030',0,'2025-08-13 03:28:10','2025-08-13 03:28:10'),
(220,'Rahmad','0811401939','','Kolaka',38,'Pekerja','active_worker','1939055747157','VALID August 2025 - August 2030',0,'2025-08-13 03:29:07','2025-08-13 03:29:07'),
(221,'Ima','085342999436','','Kolaka',32,'Pekerja','active_worker','9436055798861','VALID August 2025 - August 2030',0,'2025-08-13 03:29:58','2025-08-13 03:29:58'),
(222,'Ahmad','081215123057','','Kolaka',35,'Pekerja','active_worker','3057055873729','VALID August 2025 - August 2030',0,'2025-08-13 03:31:13','2025-08-13 03:31:13'),
(223,'Memes','082189751204','','Kolaka',34,'Pekerja','active_worker','1204055914701','VALID August 2025 - August 2030',0,'2025-08-13 03:31:54','2025-08-13 03:31:54'),
(224,'Rijal','081323844718','','Kolaka',30,'Pekerja','active_worker','4718055960485','VALID August 2025 - August 2030',0,'2025-08-13 03:32:40','2025-08-13 03:32:40'),
(225,'Rian','082347999661','','Kolaka',28,'Pekerja','active_worker','9661056022218','VALID August 2025 - August 2030',0,'2025-08-13 03:33:42','2025-08-13 03:33:42'),
(226,'Sukma','082250918768','','Kolaka',34,'Pekerja','active_worker','8768056246288','VALID August 2025 - August 2030',0,'2025-08-13 03:37:26','2025-08-13 03:37:26'),
(227,'Tira','085255828800','','Kolaka',34,'Pekerja','active_worker','8800056294140','VALID August 2025 - August 2030',0,'2025-08-13 03:38:14','2025-08-13 03:38:14'),
(228,'Ganesha','082152546253','','Kolaka',30,'Pekerja','active_worker','6253056344356','VALID August 2025 - August 2030',0,'2025-08-13 03:39:04','2025-08-13 03:39:04'),
(229,'Ismi. P','085236868881','','Kolaka',30,'Pekerja','active_worker','8881056431119','VALID August 2025 - August 2030',0,'2025-08-13 03:40:31','2025-08-13 03:40:31'),
(230,'Atira','081354792264','','Kolaka',22,'Pekerja','active_worker','2264056487611','VALID August 2025 - August 2030',0,'2025-08-13 03:41:27','2025-08-13 03:41:27'),
(231,'Ansar','082187588420','','Kolaka',40,'Pekerja','active_worker','8420056535210','VALID August 2025 - August 2030',0,'2025-08-13 03:42:15','2025-08-13 03:42:15'),
(232,'Sriwati','08524462099','','Kolaka',31,'Wiraswasta','active_worker','2099056584100','VALID August 2025 - August 2030',0,'2025-08-13 03:43:04','2025-08-13 03:43:04'),
(233,'Sukardi','085656564293','','Kolaka',40,'Pekerja','active_worker','4293056640428','VALID August 2025 - August 2030',0,'2025-08-13 03:44:00','2025-08-13 03:44:00'),
(234,'Kia','082399628556','','Kolaka',25,'Pekerja','active_worker','8556056689296','VALID August 2025 - August 2030',0,'2025-08-13 03:44:49','2025-08-13 03:44:49'),
(235,'Erni','081346766968','','Kolaka',27,'Pekerja','active_worker','6968056742338','VALID August 2025 - August 2030',0,'2025-08-13 03:45:42','2025-08-13 03:45:42'),
(236,'Husain','081243862190','','Kolaka',30,'Pekerja','active_worker','2190056789950','VALID August 2025 - August 2030',0,'2025-08-13 03:46:29','2025-08-13 03:46:29'),
(237,'Muh. Sahib','08521637600','','Kolaka',30,'Pekerja','active_worker','7600057438384','VALID August 2025 - August 2030',0,'2025-08-13 03:57:18','2025-08-13 03:57:18'),
(238,'Lysa','0811400506','','Kolaka',40,'Pekerja','active_worker','0506057482795','VALID August 2025 - August 2030',0,'2025-08-13 03:58:02','2025-08-13 03:58:02'),
(239,'Lilis','085241767323','','Kolaka',27,'Pekerja','active_worker','7323057523160','VALID August 2025 - August 2030',0,'2025-08-13 03:58:43','2025-08-13 03:58:43'),
(240,'Ical','085255910730','','Kolaka',30,'Pekerja','active_worker','0730057872437','VALID August 2025 - August 2030',0,'2025-08-13 04:04:32','2025-08-13 04:04:32'),
(241,'Amrul','085241662512','','Kolaka',27,'Pekerja','active_worker','2512057912340','VALID August 2025 - August 2030',0,'2025-08-13 04:05:12','2025-08-13 04:05:12'),
(242,'Hilda','085394474444','','Kolaka',27,'Pekerja','active_worker','4444057952106','VALID August 2025 - August 2030',0,'2025-08-13 04:05:52','2025-08-13 04:05:52'),
(243,'Alex','087889918316','','Kolaka',24,'Pekerja','active_worker','8316057985264','VALID August 2025 - August 2030',0,'2025-08-13 04:06:25','2025-08-13 04:06:25'),
(244,'A. Wulan Matabella','085823094272','','Kolaka',24,'Pekerja','active_worker','4272059665402','VALID August 2025 - August 2030',0,'2025-08-13 04:34:25','2025-08-13 04:34:25'),
(245,'Indra','085390152205','','Kolaka',25,'Pekerja','active_worker','2205059731574','VALID August 2025 - August 2030',0,'2025-08-13 04:35:31','2025-08-13 04:35:31'),
(246,'Wahyu','085341836857','','Kolaka',44,'Pekerja','active_worker','6857059779529','VALID August 2025 - August 2030',0,'2025-08-13 04:36:19','2025-08-13 04:36:19'),
(247,'Lina','085259195994','','Kolaka',32,'Pekerja','active_worker','5994059827991','VALID August 2025 - August 2030',0,'2025-08-13 04:37:07','2025-08-13 04:37:07'),
(248,'Asnira','085256326005','','Kolaka',30,'Pekerja','active_worker','6005059978922','VALID August 2025 - August 2030',0,'2025-08-13 04:39:38','2025-08-13 04:39:38'),
(249,'M. Ashar','081386644577','','Kolaka',34,'Pekerja','active_worker','4577060040672','VALID August 2025 - August 2030',0,'2025-08-13 04:40:40','2025-08-13 04:40:40'),
(250,'Intan','081212506075','','Kolaka',25,'Pekerja','active_worker','6075060143282','VALID August 2025 - August 2030',0,'2025-08-13 04:42:23','2025-08-13 04:42:23'),
(251,'Rila','085242024689','','Kolaka',27,'Pekerja','active_worker','4689060221779','VALID August 2025 - August 2030',0,'2025-08-13 04:43:41','2025-08-13 04:43:41'),
(252,'Silmi kadir','085241541112','','Kolaka',48,'Pekerja','active_worker','1112060312236','VALID August 2025 - August 2030',0,'2025-08-13 04:45:12','2025-08-13 04:45:12'),
(253,'Andi Ratu Balqis','081342719193','','Kolaka',56,'Pekerja','active_worker','9193060615249','VALID August 2025 - August 2030',0,'2025-08-13 04:50:15','2025-08-13 04:50:15'),
(254,'Erlin','085343581523','','Kolaka',45,'Pekerja','active_worker','1523060751646','VALID August 2025 - August 2030',0,'2025-08-13 04:52:31','2025-08-13 04:52:31'),
(255,'Muhammad Akram','085350065110','','Kolaka',30,'Pekerja','active_worker','5110060826543','VALID August 2025 - August 2030',0,'2025-08-13 04:53:46','2025-08-13 04:53:46'),
(256,'Iis Aprianty','085242166638','','Kolaka',34,'Pekerja','active_worker','6638060896733','VALID August 2025 - August 2030',0,'2025-08-13 04:54:56','2025-08-13 04:54:56'),
(257,'R. Fausan','082211286488','','Kolaka',28,'Wiraswasta','active_worker','6488061023494','VALID August 2025 - August 2030',0,'2025-08-13 04:57:03','2025-08-13 04:57:03'),
(258,'Faje','082328318688','','Kolaka',23,'Pekerja','active_worker','8688061089757','VALID August 2025 - August 2030',0,'2025-08-13 04:58:09','2025-08-13 04:58:09'),
(259,'Alfred','081356544656','','Kolaka',25,'Pekerja','active_worker','4656061194334','VALID August 2025 - August 2030',0,'2025-08-13 04:59:54','2025-08-13 04:59:54'),
(260,'Sindi','085220298947','','Kolaka',24,'Pekerja','active_worker','8947061329454','VALID August 2025 - August 2030',0,'2025-08-13 05:02:09','2025-08-13 05:02:09'),
(261,'Tiwi','081371214260','','Kolaka',26,'Pekerja','active_worker','4260061380642','VALID August 2025 - August 2030',0,'2025-08-13 05:03:00','2025-08-13 05:03:00'),
(262,'Desya FR','082190766639','','Kolaka',26,'Pekerja','active_worker','6639061436894','VALID August 2025 - August 2030',0,'2025-08-13 05:03:56','2025-08-13 05:03:56'),
(263,'Ekhy','082292645616','','Kolaka',36,'Pekerja','active_worker','5616061522719','VALID August 2025 - August 2030',0,'2025-08-13 05:05:22','2025-08-13 05:05:22'),
(264,'Masdiana','082237040043','','Kolaka',36,'Pekerja','active_worker','0043061598405','VALID August 2025 - August 2030',0,'2025-08-13 05:06:38','2025-08-13 05:06:38'),
(265,'Faisol Udo','085396099944','','Kolaka',34,'Pekerja','active_worker','9944061673881','VALID August 2025 - August 2030',0,'2025-08-13 05:07:53','2025-08-13 05:07:53'),
(266,'Yuli','08114033773','','Kolaka',46,'Pekerja','active_worker','3773061737407','VALID August 2025 - August 2030',0,'2025-08-13 05:08:57','2025-08-13 05:08:57'),
(267,'Eni Suaib','081218509595','','Kolaka',35,'Pekerja','active_worker','9595061819442','VALID August 2025 - August 2030',0,'2025-08-13 05:10:19','2025-08-13 05:10:19'),
(268,'Jeff Rian Samuel','085696972833','','Kolaka',17,'Mahasiswa','family_member','2833061898448','VALID August 2025 - August 2030',0,'2025-08-13 05:11:38','2025-08-13 05:11:38'),
(269,'Dedi Gembel','082336774057','','Kolaka',39,'Pekerja','active_worker','4057061972312','VALID August 2025 - August 2030',0,'2025-08-13 05:12:52','2025-08-13 05:12:52'),
(270,'Adi Gembel','085158799581','','Kolaka',21,'Pekerja','active_worker','9581062032467','VALID August 2025 - August 2030',0,'2025-08-13 05:13:52','2025-08-13 05:13:52'),
(271,'Kurniawan Aret. P','081212932316','','Kolaka',30,'Pekerja','active_worker','2316062126107','VALID August 2025 - August 2030',0,'2025-08-13 05:15:26','2025-08-13 05:15:26'),
(272,'Dwi Safitri','085396491362','','Kolaka',29,'Pekerja','active_worker','1362062199230','VALID August 2025 - August 2030',0,'2025-08-13 05:16:40','2025-08-13 05:16:40'),
(273,'Febri','085342545152','','Kolaka',44,'Pekerja','active_worker','5152062238869','VALID August 2025 - August 2030',0,'2025-08-13 05:17:18','2025-08-13 05:17:18'),
(274,'Tri','081355601120','','Kolaka',27,'Pekerja','active_worker','1120063019584','VALID August 2025 - August 2030',0,'2025-08-13 05:30:19','2025-08-13 05:30:19'),
(275,'Gastav','089560015869','','Kolaka',22,'Pekerja','active_worker','5869063202865','VALID August 2025 - August 2030',0,'2025-08-13 05:33:22','2025-08-13 05:33:22'),
(276,'Muh. Yasmin','082345341220','','Kolaka',28,'Pekerja','active_worker','1220063596591','VALID August 2025 - August 2030',0,'2025-08-13 05:39:56','2025-08-13 05:39:56'),
(277,'Hasni','085341588149','','Kolaka',25,'Pekerja','active_worker','8149063952888','VALID August 2025 - August 2030',0,'2025-08-13 05:45:52','2025-08-13 05:45:52'),
(278,'Ekawati','0812419612080','','Kolaka',29,'Pekerja','active_worker','2080064019600','VALID August 2025 - August 2030',0,'2025-08-13 05:46:59','2025-08-13 05:46:59'),
(279,'Ani','085241685606','','Kolaka',27,'Pekerja','active_worker','5606064073597','VALID August 2025 - August 2030',0,'2025-08-13 05:47:53','2025-08-13 05:47:53'),
(280,'Astuti Fahlan','081245422602','','Kolaka',28,'Pekerja','active_worker','2602064161328','VALID August 2025 - August 2030',0,'2025-08-13 05:49:21','2025-08-13 05:49:21'),
(281,'Caca','082233981336','','Kolaka',24,'Pekerja','active_worker','1336064292470','VALID August 2025 - August 2030',0,'2025-08-13 05:51:32','2025-08-13 05:51:32'),
(282,'Nimrung','082261214384','','Kolaka',29,'Pekerja','active_worker','4384064376191','VALID August 2025 - August 2030',0,'2025-08-13 05:52:56','2025-08-13 05:52:56'),
(283,'Samsam','085296510111','','Kolaka',41,'Pekerja','active_worker','0111064428603','VALID August 2025 - August 2030',0,'2025-08-13 05:53:48','2025-08-13 05:53:48'),
(284,'Dea','081322378767','','Kolaka',24,'Pekerja','active_worker','8767064536844','VALID August 2025 - August 2030',0,'2025-08-13 05:55:36','2025-08-13 05:55:36'),
(285,'Wulan','085398532858','','Kolaka',26,'Pekerja','active_worker','2858064658743','VALID August 2025 - August 2030',0,'2025-08-13 05:57:38','2025-08-13 05:57:38'),
(286,'Yusriani','085823114193','','Kolaka',30,'Pekerja','active_worker','4193064858120','VALID August 2025 - August 2030',0,'2025-08-13 06:00:58','2025-08-13 06:00:58'),
(287,'Rani','085236058170','','Kolaka',26,'Pekerja','active_worker','8170064940168','VALID August 2025 - August 2030',0,'2025-08-13 06:02:20','2025-08-13 06:02:20'),
(288,'Tira','082223131119','','Kolaka',30,'Pekerja','active_worker','1119065019381','VALID August 2025 - August 2030',0,'2025-08-13 06:03:39','2025-08-13 06:03:39'),
(289,'Arfas','085299299848','','Kolaka',29,'Pekerja','active_worker','9848065096336','VALID August 2025 - August 2030',0,'2025-08-13 06:04:56','2025-08-13 06:04:56'),
(290,'Sarwan','082328552757','','Kolaka',29,'Pekerja','active_worker','2757066976952','VALID August 2025 - August 2030',0,'2025-08-13 06:36:16','2025-08-13 06:36:16'),
(291,'Risma','082290362772','','Kolaka',24,'Pekerja','active_worker','2772067058738','VALID August 2025 - August 2030',0,'2025-08-13 06:37:38','2025-08-13 06:37:38'),
(292,'Reski Aska','0811405557','','Kolaka',23,'Pekerja','active_worker','5557067205506','VALID August 2025 - August 2030',0,'2025-08-13 06:40:05','2025-08-13 06:40:05'),
(293,'Adiba','082291661808','','Kolaka',25,'Pekerja','active_worker','1808067262106','VALID August 2025 - August 2030',0,'2025-08-13 06:41:02','2025-08-13 06:41:02'),
(294,'Ika','08539444404','','Kolaka',27,'Pekerja','active_worker','4404067348211','VALID August 2025 - August 2030',0,'2025-08-13 06:42:28','2025-08-13 06:42:28'),
(295,'Heru','082194299525','','Kolaka',30,'Pekerja','active_worker','9525067415945','VALID August 2025 - August 2030',0,'2025-08-13 06:43:35','2025-08-13 06:43:35'),
(296,'Wani','085756861792','','Kolaka',30,'Pekerja','active_worker','1792067484575','VALID August 2025 - August 2030',0,'2025-08-13 06:44:44','2025-08-13 06:44:44'),
(297,'Irna','082346052002','','Kolaka',26,'Pekerja','active_worker','2002067533593','VALID August 2025 - August 2030',0,'2025-08-13 06:45:33','2025-08-13 06:45:33'),
(298,'Eka','082187299306','','Kolaka',26,'Pekerja','active_worker','9306067635819','VALID August 2025 - August 2030',0,'2025-08-13 06:47:15','2025-08-13 06:47:15'),
(299,'Meifa','085342297154','','Kolaka',24,'Pekerja','active_worker','7154067698479','VALID August 2025 - August 2030',0,'2025-08-13 06:48:18','2025-08-13 06:48:18'),
(300,'Ani Hasyim','0811400549','','Kolaka',30,'Pekerja','active_worker','0549067757499','VALID August 2025 - August 2030',0,'2025-08-13 06:49:17','2025-08-13 06:49:17'),
(301,'Adwan','082398709009','','Kolaka',29,'Pekerja','active_worker','9009068524553','VALID August 2025 - August 2030',0,'2025-08-13 07:02:04','2025-08-13 07:02:04'),
(302,'Key','081282753168','','Kolaka',19,'Mahasiswa','family_member','3168068611743','VALID August 2025 - August 2030',0,'2025-08-13 07:03:31','2025-08-13 07:03:31'),
(303,'Hugo','085162966424','','Kolaka',25,'Pekerja','active_worker','6424068687125','VALID August 2025 - August 2030',0,'2025-08-13 07:04:47','2025-08-13 07:04:47'),
(304,'Diyat','081243414900','','Kolaka',26,'Pekerja','active_worker','4900068778781','VALID August 2025 - August 2030',0,'2025-08-13 07:06:18','2025-08-13 07:06:18'),
(305,'Hasrul','085279042444','','Kolaka',29,'Pekerja','active_worker','2444068837536','VALID August 2025 - August 2030',0,'2025-08-13 07:07:17','2025-08-13 07:07:17'),
(306,'Anton','085241573006','','Kolaka',30,'Pekerja','active_worker','3006068877706','VALID August 2025 - August 2030',0,'2025-08-13 07:07:57','2025-08-13 07:07:57'),
(307,'Tenri Oten','085299004567','','Kolaka',28,'Pekerja','active_worker','4567068928610','VALID August 2025 - August 2030',0,'2025-08-13 07:08:48','2025-08-13 07:08:48'),
(308,'Magfira','085283002943','','Kolaka',24,'Pekerja','active_worker','2943069102667','VALID August 2025 - August 2030',0,'2025-08-13 07:11:42','2025-08-13 07:11:42'),
(309,'Caca','085210619956','','Kolaka',18,'Mahasiswa','active_worker','9956069167260','VALID August 2025 - August 2030',0,'2025-08-13 07:12:47','2025-08-13 07:12:47'),
(310,'Satri','087718881992','','Kolaka',22,'Pekerja','active_worker','1992069253702','VALID August 2025 - August 2030',0,'2025-08-13 07:14:13','2025-08-13 07:14:13'),
(311,'Ruslan','081341708788','','Kolaka',38,'Pekerja','active_worker','8788069309131','VALID August 2025 - August 2030',0,'2025-08-13 07:15:09','2025-08-13 07:15:09'),
(312,'Ana','08522333485','','Kolaka',26,'Pekerja','active_worker','3485069350774','VALID August 2025 - August 2030',0,'2025-08-13 07:15:50','2025-08-13 07:15:50'),
(313,'Indra Wulan','081252612283','','Kolaka',27,'Pekerja','active_worker','2283069477634','VALID August 2025 - August 2030',0,'2025-08-13 07:17:57','2025-08-13 07:17:57'),
(314,'Agnes','081245192139','','Kolaka',26,'Pekerja','active_worker','2139069516475','VALID August 2025 - August 2030',0,'2025-08-13 07:18:36','2025-08-13 07:18:36'),
(315,'Mayang','0824474934','','Kolaka',26,'Pekerja','active_worker','4934069564376','VALID August 2025 - August 2030',0,'2025-08-13 07:19:24','2025-08-13 07:19:24'),
(316,'Astin','08225988490','','Kolaka',28,'Pekerja','active_worker','8490069608859','VALID August 2025 - August 2030',0,'2025-08-13 07:20:08','2025-08-13 07:20:08'),
(317,'Ana','082121288490','','Kolaka',25,'Pekerja','active_worker','8490069675429','VALID August 2025 - August 2030',0,'2025-08-13 07:21:15','2025-08-13 07:21:15'),
(318,'Fajar','082345141110','','Kolaka',25,'Pekerja','active_worker','1110071248327','VALID August 2025 - August 2030',0,'2025-08-13 07:47:28','2025-08-13 07:47:28'),
(319,'Herman','08522277123','','Kolaka',30,'Pekerja','active_worker','7123071282350','VALID August 2025 - August 2030',0,'2025-08-13 07:48:02','2025-08-13 07:48:02'),
(320,'Melisya','085213358599','','Kolaka',25,'Pekerja','active_worker','8599071329337','VALID August 2025 - August 2030',0,'2025-08-13 07:48:49','2025-08-13 07:48:49'),
(321,'Sultan','081341554223','','Kolaka',27,'Pekerja','active_worker','4223071369408','VALID August 2025 - August 2030',0,'2025-08-13 07:49:29','2025-08-13 07:49:29'),
(322,'Varensa','081217041323','','Kolaka',24,'Pekerja','active_worker','1323072437613','VALID August 2025 - August 2030',0,'2025-08-13 08:07:17','2025-08-13 08:07:17'),
(323,'Eki','082311659348','','Kolaka',24,'Pekerja','active_worker','9348072490980','VALID August 2025 - August 2030',0,'2025-08-13 08:08:10','2025-08-13 08:08:10'),
(324,'Syahril','082143349469','','Kolaka',26,'Pekerja','active_worker','9469072901391','VALID August 2025 - August 2030',0,'2025-08-13 08:15:01','2025-08-13 08:15:01'),
(325,'Syiarul Amin','082271049354','@aminsyiarul@gmail.com','Kolaka',23,'Mahasiswa','family_member','9354162959928','VALID August 2025 - August 2030',0,'2025-08-14 09:15:59','2025-08-14 09:15:59'),
(326,'Asrurrowi','085343540001','rrowiasrur@gmail.com','Makassar',30,'Karyawan','active_worker','0001172342191','VALID August 2025 - August 2030',0,'2025-08-14 11:52:22','2025-08-14 11:52:22'),
(327,'Afjan Afrisal Basri. R','082259077634','','Kolaka',19,'Pekerja','active_worker','7634239123299','VALID August 2025 - August 2030',0,'2025-08-15 06:25:23','2025-08-15 06:25:23'),
(328,'Abd. Qahhar','0811406023','','Kolaka',25,'Kerja','active_worker','6023351406955','VALID August 2025 - August 2030',0,'2025-08-16 13:36:46','2025-08-16 13:36:46'),
(329,'Lini','085341101723','','Kolaka',32,'Kerja','active_worker','1723497277742','VALID August 2025 - August 2030',0,'2025-08-18 06:07:57','2025-08-18 06:07:57'),
(330,'Yoga','082187612496','','Kolaka',24,'Wiraswasta','active_worker','2496523904604','VALID August 2025 - August 2030',0,'2025-08-18 13:31:44','2025-08-18 13:31:44'),
(331,'Nurul fitia','085213201173','','Kolaka',27,'Irt','family_member','1173560245782','VALID August 2025 - August 2030',0,'2025-08-18 23:37:25','2025-08-18 23:37:25'),
(332,'Andi saiful','085167683826','','Kolaka',24,'Fotografer','active_worker','3826646519841','VALID August 2025 - August 2030',0,'2025-08-19 23:35:19','2025-08-19 23:35:19'),
(333,'Salim','081222680811','','Kolaka',31,'Karyawan swasta','active_worker','0811688130274','VALID August 2025 - August 2030',0,'2025-08-20 11:08:50','2025-08-20 11:08:50'),
(334,'Anca','089506647370','','Kolaka',25,'Karyawan','active_worker','7370695227829','VALID August 2025 - August 2030',0,'2025-08-20 13:07:07','2025-08-20 13:07:07'),
(335,'Jane Natalia Mekel','081340386483','jhe.natalia.mekel@gmail.com','Jl Alam Mekongga No. 37   Kel. Balandete Kec. kolaka - Kabupaten Kolaka  Sulawesi Tenggara 95317 (samping Bank BPR Bahtera Mas Kolaka)',41,'Karyawan Swasta','active_worker','6483740456547','VALID August 2025 - August 2030',0,'2025-08-21 01:40:56','2025-08-21 01:40:56'),
(336,'Abyan','08114582727','','Kolaka',37,'Olahraga','active_worker','2727766960811','VALID August 2025 - August 2030',0,'2025-08-21 09:02:40','2025-08-21 09:02:40'),
(337,'Darnawati','081354991818','','Kolaka',48,'IRT','active_worker','1818916939942','VALID August 2025 - August 2030',0,'2025-08-23 02:42:19','2025-08-23 02:42:19'),
(338,'Marini','087848023513','','Kolaka',30,'Kerja','active_worker','2351945694480','VALID August 2025 - August 2030',0,'2025-08-23 10:41:34','2025-08-23 10:43:24'),
(339,'Marwah','085656566408','','Bone',23,'Mahasiswa','active_worker','6408961408250','VALID August 2025 - August 2030',0,'2025-08-23 15:03:28','2025-08-23 15:03:28'),
(340,'Erwi','085399499337','','Kolaka',34,'IRT','family_member','9337998116481','VALID August 2025 - August 2030',0,'2025-08-24 01:15:16','2025-08-24 01:15:16'),
(341,'Andi Anita','081242305254','andi.anita29@gmail.com','Jln pemuda no.80 balandete .depan kampus USN',41,'ASN','family_member','5254092962558','VALID August 2025 - August 2030',0,'2025-08-25 03:36:02','2025-08-25 03:36:02'),
(342,'Ayu sartika','082298684383','','Kolaka',34,'Kerja','active_worker','4383166017713','VALID August 2025 - August 2030',0,'2025-08-25 23:53:37','2025-08-25 23:53:37'),
(343,'Iqbal','085246394113','','Kolaka',29,'Perkerja aktif','active_worker','4113210687274','VALID August 2025 - August 2030',0,'2025-08-26 12:18:07','2025-08-26 12:18:07'),
(344,'Muh akram','085350065116','','Kolaka',31,'Pekerja','active_worker','5116210972424','VALID August 2025 - August 2030',0,'2025-08-26 12:22:52','2025-08-26 12:22:52'),
(345,'Hartati','081341513251','','Kolaka',47,'WIRASWASTA','family_member','3251425078260','VALID August 2025 - August 2030',0,'2025-08-28 23:51:18','2025-08-28 23:51:18'),
(346,'Mispa','082293333646','','Kolaka',33,'IRT','family_member','3646546610418','VALID August 2025 - August 2030',0,'2025-08-30 09:36:50','2025-08-30 09:38:56'),
(347,'Hanif','081243824009','','Kolaka',31,'Barista','active_worker','4009642294148','VALID August 2025 - August 2030',0,'2025-08-31 12:11:34','2025-08-31 12:11:34'),
(348,'Aca','081388279696','','Kolaka',23,'Kerja','active_worker','9696684548125','VALID September 2025 - September 2030',0,'2025-08-31 23:55:48','2025-08-31 23:55:48'),
(349,'Misda','082261832795','','Kolaka',30,'Kerja','active_worker','2795726847990','VALID September 2025 - September 2030',0,'2025-09-01 11:40:47','2025-09-01 11:40:47'),
(350,'Sri hartati','08114044445','','Kolaka',46,'IRT','family_member','4445814406514','VALID September 2025 - September 2030',0,'2025-09-02 12:00:06','2025-09-02 12:00:06'),
(351,'Wanti','082189132551','','Kolaka',43,'Wiraswasta','family_member','2551941843887','VALID September 2025 - September 2030',0,'2025-09-03 23:24:03','2025-09-03 23:24:03'),
(352,'Haslan','087866153708','','Kolaka',28,'Karyawan','active_worker','3708942800647','VALID September 2025 - September 2030',0,'2025-09-03 23:40:00','2025-09-03 23:40:00'),
(353,'Syam','082198530477','','Kolaka',43,'Kerja','active_worker','0477946546695','VALID September 2025 - September 2030',0,'2025-09-04 00:42:26','2025-09-04 00:42:26'),
(354,'Ira kamelia','085231443133','','Kolaka',41,'KERJA','active_worker','3133064404725','VALID September 2025 - September 2030',0,'2025-09-05 09:26:44','2025-09-05 09:26:44'),
(355,'Dhita','082118902302','','Kolaka',28,'Kerja','active_worker','2302198785720','VALID September 2025 - September 2030',0,'2025-09-06 22:46:25','2025-09-06 22:46:25'),
(356,'Tuty','082115573721','','Kolaka',31,'Kerja','active_worker','3721199568578','VALID September 2025 - September 2030',0,'2025-09-06 22:59:28','2025-09-06 22:59:28'),
(357,'Sri Wahyuni','082298971398','','Kolaka',27,'Kerja','active_worker','1398200144880','VALID September 2025 - September 2030',0,'2025-09-06 23:09:04','2025-09-06 23:22:47'),
(358,'Rahmini','082272330273','','Kolaka',51,'Kerja','active_worker','0273204108391','VALID September 2025 - September 2030',0,'2025-09-07 00:15:08','2025-09-07 00:15:08'),
(359,'Mustika dewi','085256170699','','Kolaka',43,'Kerja','active_worker','0699204556761','VALID September 2025 - September 2030',0,'2025-09-07 00:22:36','2025-09-07 00:22:36'),
(360,'Syofyan Chan','087719990333','syofyan.chan9191@gmail.com','Batam',33,'Wiraswasta','active_worker','0333338674933','VALID September 2025 - September 2030',0,'2025-09-08 13:37:54','2025-09-08 13:37:54'),
(361,'Astin','082346027996','','Kolaka',33,'Kerja','active_worker','7996374793223','VALID September 2025 - September 2030',0,'2025-09-08 23:39:53','2025-09-08 23:39:53'),
(362,'Anggun','082328056305','','Kolaka',25,'Kerja','family_member','6305418755799','VALID September 2025 - September 2030',0,'2025-09-09 11:52:35','2025-09-09 11:52:35'),
(363,'Herlina','082344891534','','Kolaka',45,'Mahasiswa','family_member','1534484175739','VALID September 2025 - September 2030',0,'2025-09-10 06:02:55','2025-09-10 06:02:55'),
(364,'Sardi','085342861494','','Kolaka',35,'Kerja','active_worker','1494654886193','VALID September 2025 - September 2030',0,'2025-09-12 05:28:06','2025-09-12 05:28:06'),
(365,'Gisel','08995862765','','Kolaka',27,'Kerja','family_member','2765803115696','VALID September 2025 - September 2030',0,'2025-09-13 22:38:35','2025-09-13 22:38:35'),
(366,'Resky','082199999403','','Kolaka',34,'Pekerja','active_worker','9403804008409','VALID September 2025 - September 2030',0,'2025-09-13 22:53:28','2025-09-13 22:53:28'),
(367,'Eva','082293434930','','Kolaka',23,'Kerja','family_member','4930806092491','VALID September 2025 - September 2030',0,'2025-09-13 23:28:12','2025-09-13 23:28:12'),
(368,'Nurfahmi arbie','082399627276','','Kolaka',35,'Ibu rumah tangga','mums_baby','7276894876552','VALID September 2025 - September 2030',0,'2025-09-15 00:07:56','2025-09-15 00:07:56'),
(369,'ARLAN','085241654047','arlan.ruwiang@gmail.com','Jl. Nuri no. 5 kel. Laloeha kec. Kolaka kab. Kolaka',34,'Karyawan','family_member','4047903322695','VALID September 2025 - September 2030',0,'2025-09-15 02:28:42','2025-09-15 02:28:42'),
(370,'Fita','082348788008','','Kolaka',27,'Kerja','active_worker','8008940601796','VALID September 2025 - September 2030',0,'2025-09-15 12:50:01','2025-09-15 12:50:01'),
(371,'Sahara','082271081599','','Kolaka',34,'Bisnis','family_member','1599027799360','VALID September 2025 - September 2030',0,'2025-09-16 13:03:19','2025-09-16 13:03:19'),
(372,'Iin lompi','082196804410','','Kolaka',35,'Kerja','active_worker','4410261862596','VALID September 2025 - September 2030',0,'2025-09-19 06:04:22','2025-09-19 06:04:22'),
(373,'Rahmat','082284688097','','Kolaka',28,'Kerja','active_worker','8097460221132','VALID September 2025 - September 2030',0,'2025-09-21 13:10:21','2025-09-21 13:10:21'),
(374,'Dian','082299386242','','Kolaka',19,'Karyawan','active_worker','6242682824265','VALID September 2025 - September 2030',0,'2025-09-24 03:00:24','2025-09-24 03:00:24'),
(375,'Ayrin chesa','082347179542','','Kolaka',24,'Kerja','active_worker','9542802164457','VALID September 2025 - September 2030',0,'2025-09-25 12:09:24','2025-09-25 12:09:24'),
(376,'Cayarani','085242212656','','Kolaka',47,'As','active_worker','2656880224146','VALID September 2025 - September 2030',0,'2025-09-26 09:50:24','2025-09-26 09:50:24'),
(377,'Sulastri','082189828447','','Kolaka',33,'IRT','family_member','8447963706388','VALID September 2025 - September 2030',0,'2025-09-27 09:01:46','2025-09-27 09:01:46'),
(378,'Agnes','085298409166','','Kolaka',22,'Kerja','active_worker','9166964902557','VALID September 2025 - September 2030',0,'2025-09-27 09:21:42','2025-09-27 09:21:42'),
(379,'Rina','082286459838','','Kolaka',40,'Kerja','active_worker','9838965893420','VALID September 2025 - September 2030',0,'2025-09-27 09:38:13','2025-09-27 09:38:13'),
(380,'Naufal Aldian','081228878407','naufalaldian21@gmail.com','Kolaka',22,'Karyawan','active_worker','8407013522362','VALID September 2025 - September 2030',0,'2025-09-27 22:52:02','2025-09-27 22:52:02'),
(381,'Intan','082332796312','','Kolaka',32,'Kerja','active_worker','6312014177379','VALID September 2025 - September 2030',0,'2025-09-27 23:02:57','2025-09-27 23:02:57'),
(382,'Martina','082292705002','','Kolaka',40,'Kerja','active_worker','5002014251770','VALID September 2025 - September 2030',0,'2025-09-27 23:04:11','2025-09-27 23:04:11'),
(383,'Astusi arifin','081243429672','','Kolaka',39,'Kerja','active_worker','9672014634204','VALID September 2025 - September 2030',0,'2025-09-27 23:10:34','2025-09-27 23:10:34'),
(384,'Ris oktavia','085394109361','','Kolaka',37,'Kerja','family_member','9361148940483','VALID September 2025 - September 2030',0,'2025-09-29 12:29:00','2025-09-29 12:29:00'),
(385,'Safa','082293629850','','Kolaka',26,'Kerja','active_worker','9850403207902','VALID October 2025 - October 2030',0,'2025-10-02 11:06:47','2025-10-02 11:06:47'),
(386,'Dirja','085394163596','','Kolaka',28,'Asn','active_worker','3596466521125','VALID October 2025 - October 2030',0,'2025-10-03 04:42:01','2025-10-03 04:42:01'),
(387,'Muh Panji Ramarsani','085333229435','panjiramarsani@gmail.com','Jl Ahmad Mustin',25,'asn','active_worker','9435547544514','VALID October 2025 - October 2030',0,'2025-10-04 03:12:24','2025-10-04 03:12:24'),
(388,'Sukma','085147264312','','Kolaka',22,'Kuliah','family_member','4312580914522','VALID October 2025 - October 2030',0,'2025-10-04 12:28:34','2025-10-04 12:28:34'),
(389,'RUSLAN','085298692888','ruslanrahman04@gmail.com','KOLAKA',38,'PNS','active_worker','2888628512121','VALID October 2025 - October 2030',0,'2025-10-05 01:41:52','2025-10-05 01:41:52'),
(390,'Monic','085161171794','','Kolaka',26,'Irt','family_member','1794838356762','VALID October 2025 - October 2030',0,'2025-10-07 11:59:16','2025-10-07 11:59:16'),
(391,'Marno','082324939899','','Kolaka',32,'Wiraswasta','family_member','9899083029445','VALID October 2025 - October 2030',0,'2025-10-10 07:57:09','2025-10-10 07:57:09'),
(392,'Rizal','082336130005','','Kolaka',37,'Kerja','active_worker','0005099451653','VALID October 2025 - October 2030',0,'2025-10-10 12:30:51','2025-10-10 12:30:51'),
(393,'Muhammad dodi','082397860911','','Kolaka',29,'Kerja','active_worker','0911103160757','VALID October 2025 - October 2030',0,'2025-10-10 13:32:40','2025-10-10 13:32:40'),
(394,'BAGUS DWI SULAKSONO','081235529948','sulaksonobd05@gmail.com','Madura',38,'Karyawan','active_worker','9948174506601','VALID October 2025 - October 2030',0,'2025-10-11 09:21:46','2025-10-11 09:21:46'),
(395,'Hasbi bidol','082193129777','','Kolaka',58,'Kantoran','active_worker','9777254153636','VALID October 2025 - October 2030',0,'2025-10-12 07:29:13','2025-10-12 07:29:13'),
(396,'Sehay','085340400090','','Kolaka',32,'Kerja','family_member','0090432482212','VALID October 2025 - October 2030',0,'2025-10-14 09:01:22','2025-10-14 09:01:22'),
(397,'Tedi Cahyadi','081214046789','tedihav@gmail.com','Bandung',37,'Karyawan','active_worker','6789434546568','VALID October 2025 - October 2030',0,'2025-10-14 09:35:46','2025-10-14 09:35:46'),
(398,'Misra','085284077518','','Kolaka',35,'Kerja','family_member','7518435260817','VALID October 2025 - October 2030',0,'2025-10-14 09:47:40','2025-10-14 09:47:40'),
(399,'Febrian','081229870603','','Kolaka',32,'Kerja','active_worker','0603440191196','VALID October 2025 - October 2030',0,'2025-10-14 11:09:51','2025-10-14 11:09:51'),
(400,'Tendi Irawan','081313662665','tendi337@gmail.com','Ciputat desa Cikawung, RT-25/RW-07, Kec. Terisi, Kab. Indramayu. Jawa Barat',25,'Karyawan','active_worker','2665606691773','VALID October 2025 - October 2030',0,'2025-10-16 09:24:51','2025-10-16 09:24:51'),
(401,'Junaedi','082244239590','','Kolaka',23,'Kerja','active_worker','9590617412264','VALID October 2025 - October 2030',0,'2025-10-16 12:23:32','2025-10-16 12:23:32'),
(402,'Said','085260540600','','Kolaka',37,'Kerja','active_worker','0600703672402','VALID October 2025 - October 2030',0,'2025-10-17 12:21:12','2025-10-17 12:21:12'),
(403,'Sinta','085242785934','','Kolaka',24,'Kerja','active_worker','5934741358902','VALID October 2025 - October 2030',0,'2025-10-17 22:49:18','2025-10-17 22:49:18'),
(404,'Erwandi','082287029792','erwandiari@gmail.com','Kolaka',28,'Wiraswasta','family_member','9792828457719','VALID October 2025 - October 2030',0,'2025-10-18 23:00:57','2025-10-18 23:00:57'),
(405,'Putri amelia','081342805119','putryamelya473@gmail.com','Ngapa',22,'Mahasiswa','family_member','5119840811636','VALID October 2025 - October 2030',0,'2025-10-19 02:26:51','2025-10-19 02:26:51'),
(406,'Titania','0811400996','$','Kolaka',11,'Karyawan','family_member','0996054404924','VALID October 2025 - October 2030',0,'2025-10-21 13:46:44','2025-10-21 13:46:44'),
(407,'Diana','087753149831','','Kolaka',25,'Kerja','family_member','9831094746412','VALID October 2025 - October 2030',0,'2025-10-22 00:59:06','2025-10-22 00:59:06'),
(408,'Oceng','082135559818','','Kolaka',46,'Kerja','family_member','9818111860478','VALID October 2025 - October 2030',0,'2025-10-22 05:44:20','2025-10-22 05:44:20'),
(409,'Eka Nurwahyuni','081717402442','ekanw2021@gmail.com','Kolaka',34,'ASN','family_member','2442297716617','VALID October 2025 - October 2030',0,'2025-10-24 09:21:56','2025-10-24 09:21:56'),
(410,'Wulan Amalia Putri','082396272744','wulannyahilman@gmail.com','BTN Bendungan Kolaka',37,'PNS','active_worker','2744555859514','VALID October 2025 - October 2030',0,'2025-10-27 09:04:19','2025-10-27 09:04:19'),
(411,'Andi Duddin','082291604433','duddincupane@gmail.com','Pomalaa',34,'Cari rejeki yang halal','family_member','4433003656234','VALID November 2025 - November 2030',0,'2025-11-01 13:27:36','2025-11-01 13:27:36'),
(412,'Alfiah','085255255516','','Kolaka',32,'Kerja','active_worker','5516139362731','VALID November 2025 - November 2030',0,'2025-11-03 03:09:22','2025-11-03 03:09:22'),
(413,'Agriani','082259658884','aniagriani85@gmaildotcom','Jln.suktan hasanuddin',45,'PNS','active_worker','8884226653448','VALID November 2025 - November 2030',0,'2025-11-04 03:24:13','2025-11-04 03:24:13'),
(414,'LINDA','081528986313','lindaoktavianti08@gmail.com','Jl.jendral sudirman',45,'Karyawan','active_worker','6313226727435','VALID November 2025 - November 2030',0,'2025-11-04 03:25:27','2025-11-04 03:25:27'),
(415,'Afifa','082280000395','','Kolaka',30,'Kerja','active_worker','0395260383255','VALID November 2025 - November 2030',0,'2025-11-04 12:46:23','2025-11-04 12:46:23'),
(416,'Ummil rahimatul afiah','082233493457','ummilafiah@gmail.com','watubangga',25,'ibu rumah tangga','family_member','3457413622996','VALID November 2025 - November 2030',0,'2025-11-06 07:20:22','2025-11-06 07:20:22'),
(417,'Nurhidayat','082323268237','','Kolaka',30,'Karyawan','active_worker','8237856756208','VALID November 2025 - November 2030',0,'2025-11-11 10:25:56','2025-11-11 10:25:56'),
(418,'Widya','085398719911','','Kolaka',28,'Kerja','active_worker','9911856984976','VALID November 2025 - November 2030',0,'2025-11-11 10:29:44','2025-11-11 10:29:44'),
(419,'Zaskia putri Rahmadani','085393983598','','Kolaka',23,'Kerja','family_member','3598023010553','VALID November 2025 - November 2030',0,'2025-11-13 08:36:50','2025-11-13 08:36:50'),
(420,'Idawaty djaelany','082196339352','','Kolaka',54,'Asn','active_worker','9352173969228','VALID November 2025 - November 2030',0,'2025-11-15 02:32:49','2025-11-15 02:32:49'),
(421,'Maria Aurel Sonda','085311747188','aurelmaria35@gmail.com','Kolaka',15,'Pelajar','family_member','7188210222944','VALID November 2025 - November 2030',0,'2025-11-15 12:37:02','2025-11-15 12:37:02'),
(422,'Narisa','08114058998','','Kolaka',29,'Asn','active_worker','8998262081930','VALID November 2025 - November 2030',0,'2025-11-16 03:01:21','2025-11-16 03:01:21'),
(423,'Aldilla Afifah Aisyah Halik','085247918004','','Kolaka',25,'Bumd','active_worker','8004293667541','VALID November 2025 - November 2030',0,'2025-11-16 11:47:47','2025-11-16 11:47:47');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
commit;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u508442634_docterbee`@`127.0.0.1`*/ /*!50003 TRIGGER member_insert_log 
AFTER INSERT ON members
FOR EACH ROW
BEGIN
    INSERT INTO activity_log (member_id, action, details, created_at)
    VALUES (NEW.id, 'INSERT', CONCAT('Anggota baru dibuat: ', NEW.nama), NOW());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u508442634_docterbee`@`127.0.0.1`*/ /*!50003 TRIGGER member_update_log 
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    INSERT INTO activity_log (member_id, action, details, created_at)
    VALUES (NEW.id, 'UPDATE', CONCAT('Data anggota diupdate: ', NEW.nama), NOW());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'u508442634_data_pelanggan'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetMemberByCode` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`u508442634_docterbee`@`127.0.0.1` PROCEDURE `GetMemberByCode`(IN p_kode_unik VARCHAR(50))
BEGIN
    SELECT * FROM members WHERE kode_unik = p_kode_unik;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetMembersByCardType` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`u508442634_docterbee`@`127.0.0.1` PROCEDURE `GetMembersByCardType`(IN p_jenis_kartu VARCHAR(20))
BEGIN
    SELECT * FROM members 
    WHERE jenis_kartu = p_jenis_kartu 
    ORDER BY created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetMemberStats` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`u508442634_docterbee`@`127.0.0.1` PROCEDURE `GetMemberStats`()
BEGIN
    SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN jenis_kartu = 'active_worker' THEN 1 END) as active_worker_members,
        COUNT(CASE WHEN jenis_kartu = 'family_member' THEN 1 END) as family_member_members,
        COUNT(CASE WHEN jenis_kartu = 'healthy_smart_kids' THEN 1 END) as healthy_smart_kids_members,
        COUNT(CASE WHEN jenis_kartu = 'mums_baby' THEN 1 END) as mums_baby_members,
        COUNT(CASE WHEN jenis_kartu = 'new_couple' THEN 1 END) as new_couple_members,
        COUNT(CASE WHEN jenis_kartu = 'pregnant_preparation' THEN 1 END) as pregnant_preparation_members,
        COUNT(CASE WHEN jenis_kartu = 'senja_ceria' THEN 1 END) as senja_ceria_members,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_registrations,
        COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as week_registrations,
        COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as month_registrations,
        AVG(umur) as average_age,
        MIN(created_at) as first_member_date,
        MAX(created_at) as latest_member_date
    FROM members;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetRecentMembers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`u508442634_docterbee`@`127.0.0.1` PROCEDURE `GetRecentMembers`(IN p_limit INT)
BEGIN
    SELECT * FROM members 
    ORDER BY created_at DESC 
    LIMIT p_limit;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `daily_registrations`
--

/*!50001 DROP VIEW IF EXISTS `daily_registrations`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`u508442634_docterbee`@`127.0.0.1` SQL SECURITY DEFINER */
/*!50001 VIEW `daily_registrations` AS select cast(`members`.`created_at` as date) AS `registration_date`,count(0) AS `registrations`,count(case when `members`.`jenis_kartu` = 'active_worker' then 1 end) AS `active_worker_count`,count(case when `members`.`jenis_kartu` = 'family_member' then 1 end) AS `family_member_count`,count(case when `members`.`jenis_kartu` = 'healthy_smart_kids' then 1 end) AS `healthy_smart_kids_count`,count(case when `members`.`jenis_kartu` = 'mums_baby' then 1 end) AS `mums_baby_count`,count(case when `members`.`jenis_kartu` = 'new_couple' then 1 end) AS `new_couple_count`,count(case when `members`.`jenis_kartu` = 'pregnant_preparation' then 1 end) AS `pregnant_preparation_count`,count(case when `members`.`jenis_kartu` = 'senja_ceria' then 1 end) AS `senja_ceria_count` from `members` where `members`.`created_at` >= curdate() - interval 30 day group by cast(`members`.`created_at` as date) order by cast(`members`.`created_at` as date) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `member_statistics`
--

/*!50001 DROP VIEW IF EXISTS `member_statistics`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`u508442634_docterbee`@`127.0.0.1` SQL SECURITY DEFINER */
/*!50001 VIEW `member_statistics` AS select `members`.`jenis_kartu` AS `jenis_kartu`,count(0) AS `total_members`,avg(`members`.`umur`) AS `average_age`,min(`members`.`created_at`) AS `first_registration`,max(`members`.`created_at`) AS `latest_registration` from `members` group by `members`.`jenis_kartu` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-11-18 11:15:19
