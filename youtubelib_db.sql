# ************************************************************
# Sequel Pro SQL dump
# Version 4529
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.13)
# Database: youtubelib
# Generation Time: 2016-07-18 19:12:44 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table albums
# ------------------------------------------------------------

DROP TABLE IF EXISTS `albums`;

CREATE TABLE `albums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `track_num` int(5) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;

LOCK TABLES `albums` WRITE;
/*!40000 ALTER TABLE `albums` DISABLE KEYS */;

INSERT INTO `albums` (`id`, `track_num`, `name`)
VALUES
  (2,NULL,'undefined'),
  (4,NULL,'Live in Concert - Live from Wacken - Full Show'),
  (5,NULL,'Live Wacken Open Air 2014 [Full Show]'),
  (10,NULL,'Dimmu Borgir live At Wacken 2007 [Full Concert]'),
  (11,NULL,'test'),
  (12,NULL,'Nightwish Live in Concert - Live from Wacken - Full Show]'),
  (13,NULL,'#1 Record [Full Record]'),
  (16,NULL,'Radio City'),
  (17,NULL,'Local Live: Glue (Full Set)'),
  (18,NULL,'Salt EP'),
  (19,NULL,'Local Live: Breakout (Full Set)'),
  (20,NULL,'THE UNDERTONES - the very best of [full]'),
  (21,NULL,'The Curse of Zounds - Singles (1980-2002)'),
  (22,NULL,'Only Life'),
  (23,NULL,'Crazy Rhythms'),
  (24,NULL,' S/T LP'),
  (25,NULL,'Greatest Hits');

/*!40000 ALTER TABLE `albums` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table artists
# ------------------------------------------------------------

DROP TABLE IF EXISTS `artists`;

CREATE TABLE `artists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city_id` int(100) DEFAULT '2',
  `country_id` int(100) DEFAULT '1',
  `start_year` date DEFAULT NULL,
  `end_year` date DEFAULT NULL,
  `artist_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;

LOCK TABLES `artists` WRITE;
/*!40000 ALTER TABLE `artists` DISABLE KEYS */;

INSERT INTO `artists` (`id`, `city_id`, `country_id`, `start_year`, `end_year`, `artist_name`)
VALUES
  (1,2,1,NULL,NULL,'undefined'),
  (2,2,1,NULL,NULL,'The Cure'),
  (3,2,1,NULL,NULL,'The Smiths'),
  (13,2,1,NULL,NULL,'Nightwish'),
  (14,2,1,NULL,NULL,'CC DUST'),
  (15,2,1,NULL,NULL,'Amon Amarth'),
  (27,2,1,NULL,NULL,'test'),
  (28,2,1,NULL,NULL,'Dimmu Borgir '),
  (29,2,1,NULL,NULL,'Big Star'),
  (30,2,1,NULL,NULL,'Glue'),
  (31,2,1,NULL,NULL,'Institute'),
  (32,2,1,NULL,NULL,'Breakout'),
  (33,2,1,NULL,NULL,'THE UNDERTONES'),
  (34,2,1,NULL,NULL,'Zounds'),
  (35,2,1,NULL,NULL,'The Feelies'),
  (36,2,1,NULL,NULL,'Crazy Spirit');

/*!40000 ALTER TABLE `artists` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table cities
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cities`;

CREATE TABLE `cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `country_id` (`country_id`),
  CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;

INSERT INTO `cities` (`id`, `country_id`, `name`)
VALUES
  (2,1,'undefined');

/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table countries
# ------------------------------------------------------------

DROP TABLE IF EXISTS `countries`;

CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;

INSERT INTO `countries` (`id`, `name`)
VALUES
  (1,'undefined');

/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table genres
# ------------------------------------------------------------

DROP TABLE IF EXISTS `genres`;

CREATE TABLE `genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8;

LOCK TABLES `genres` WRITE;
/*!40000 ALTER TABLE `genres` DISABLE KEYS */;

INSERT INTO `genres` (`id`, `name`, `description`)
VALUES
  (1,'music',NULL),
  (2,'rock',NULL),
  (3,'rap',NULL),
  (4,'r&b',NULL),
  (5,'hardcore punk',NULL),
  (6,'art punk',NULL),
  (7,'alternative rock',NULL),
  (8,'goth',NULL),
  (9,'grunge',NULL),
  (10,'indie rock',NULL),
  (11,'lo-fi',NULL),
  (12,'garage rock',NULL),
  (13,'psychedelic rock',NULL),
  (14,'new wave',NULL),
  (15,'no wave',NULL),
  (16,'progressive rock',NULL),
  (17,'shoegaze',NULL),
  (18,'steampunk',NULL),
  (19,'folk',NULL),
  (20,'folk punk',NULL),
  (21,'cow punk',NULL),
  (22,'blues',NULL),
  (23,'acoustic blues',NULL),
  (24,'electric blues',NULL),
  (25,'contemporary blues',NULL),
  (26,'delta blues',NULL),
  (27,'classical',NULL),
  (28,'avant-garde ',NULL),
  (29,'baroque',NULL),
  (30,'choral',NULL),
  (31,'chant',NULL),
  (32,'minimalism',NULL),
  (33,'renaissance',NULL),
  (34,'modern composition',NULL),
  (35,'meditation',NULL),
  (36,'expressionist',NULL),
  (37,'impressionist',NULL),
  (38,'opera',NULL),
  (39,'orchestral',NULL),
  (40,'novelty',NULL),
  (41,'standup comedy',NULL),
  (42,'country',NULL),
  (43,'alternative country',NULL),
  (44,'americana',NULL),
  (45,'bluegrass',NULL),
  (46,'pop country',NULL),
  (47,'pop punk',NULL),
  (48,'gospel',NULL),
  (49,'honkey tonk',NULL),
  (50,'urban cowboy',NULL),
  (51,'dance',NULL),
  (52,'EDM',NULL),
  (53,'house',NULL),
  (54,'club',NULL),
  (55,'top 40',NULL),
  (56,'dubstep',NULL),
  (57,'glitch pop',NULL),
  (58,'trip hop',NULL),
  (59,'techno',NULL),
  (60,'trance',NULL),
  (61,'trap',NULL),
  (62,'easy listening',NULL),
  (63,'lounge',NULL),
  (64,'soft rock',NULL),
  (65,'post grunge',NULL),
  (66,'metal',NULL),
  (67,'industrial',NULL),
  (68,'kroutrock',NULL),
  (69,'hardcore rap',NULL),
  (70,'hip hop',NULL),
  (71,'east coast rap',NULL),
  (72,'west coast rap',NULL),
  (73,'latin rap',NULL),
  (74,'old school rap',NULL),
  (75,'underground rap',NULL),
  (76,'french pop',NULL),
  (77,'holiday',NULL),
  (78,'holloween',NULL),
  (79,'indie pop',NULL),
  (80,'j pop',NULL),
  (81,'karaoke',NULL),
  (82,'death metal',NULL),
  (83,'doom metal',NULL),
  (84,'math rock',NULL),
  (85,'metal core',NULL),
  (86,'jam band',NULL),
  (87,'noise',NULL),
  (88,'post punk',NULL),
  (89,'grindcore',NULL),
  (90,'afro punk',NULL),
  (91,'surf',NULL),
  (92,'stoner metal',NULL),
  (93,'queer',NULL),
  (94,'anti-racist',NULL),
  (95,'feminist',NULL),
  (96,'soundtrack',NULL),
  (97,'podcast',NULL),
  (98,'radio',NULL),
  (99,'latin',NULL),
  (100,'flamenco',NULL),
  (101,'brazilian',NULL),
  (102,'bossa nova',NULL),
  (103,'tango',NULL),
  (104,'salsa',NULL),
  (105,'pop latino',NULL),
  (106,'dream pop',NULL),
  (107,'dark wave',NULL),
  (108,'doo wop',NULL),
  (109,'funk',NULL),
  (110,'motown',NULL),
  (111,'neo-soul',NULL),
  (112,'reggae',NULL),
  (113,'ska',NULL),
  (114,'singer/songwriter',NULL),
  (115,'j pop',NULL),
  (116,'world',NULL);

/*!40000 ALTER TABLE `genres` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table listens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `listens`;

CREATE TABLE `listens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `youtube_id` varchar(200) DEFAULT NULL,
  `user_id` int(100) DEFAULT NULL,
  `time_start` double(100,5) DEFAULT NULL,
  `time_end` double(100,5) DEFAULT NULL,
  `time_of_listen` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `listened_to_end` int(2) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `youtube_id` (`youtube_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `listens_ibfk_1` FOREIGN KEY (`youtube_id`) REFERENCES `videos` (`youtube_id`),
  CONSTRAINT `listens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=259 DEFAULT CHARSET=utf8;

LOCK TABLES `listens` WRITE;
/*!40000 ALTER TABLE `listens` DISABLE KEYS */;

INSERT INTO `listens` (`id`, `youtube_id`, `user_id`, `time_start`, `time_end`, `time_of_listen`, `listened_to_end`)
VALUES
  (3,'ohxcgnJTiPI',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (4,'98T3lkkdKqk',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (5,'YIdcDL64KCE',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (6,'MadlqMKwWB8',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (7,'QxsmWxxouIM',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (8,'xw49UgKoZnQ',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (9,'x81VNgPXRaw',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (10,'Ja2PEFD6t-c',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (11,'ojuhqUA5_o8',1,0.00281,100.50000,'2016-07-05 19:12:18',0),
  (12,'nnBKL01gD8A',1,0.01722,100.50000,'2016-07-05 19:12:18',0),
  (13,'tNVdziest58',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (14,'O3adXwLVIaY',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (15,'98T3lkkdKqk',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (16,'x81VNgPXRaw',1,0.00000,100.50000,'2016-07-05 19:12:18',0),
  (17,'B7Z4Pmf-tQk',1,0.01175,100.50000,'2016-07-05 19:12:18',0),
  (18,'YR5ApYxkU-U',1,0.00552,100.50000,'2016-07-05 19:12:18',0),
  (19,'lQb3lT-s8_0',1,0.01328,100.50000,'2016-07-05 19:13:04',0),
  (20,'MadlqMKwWB8',1,0.00000,100.50000,'2016-07-07 12:04:28',0),
  (21,'3vnD5cBWqaA',1,0.00853,100.50000,'2016-07-07 12:12:07',0),
  (22,'4DIFUpXs7l8',1,0.00000,100.50000,'2016-07-07 12:12:14',0),
  (23,'B7Z4Pmf-tQk',1,0.00000,100.50000,'2016-07-07 12:24:49',0),
  (24,'4DIFUpXs7l8',1,0.01107,100.50000,'2016-07-07 12:41:41',0),
  (25,'aJRnh0avKtA',1,0.01988,100.50000,'2016-07-07 12:41:55',0),
  (26,'3vnD5cBWqaA',1,0.01564,100.50000,'2016-07-07 12:42:08',0),
  (27,'aJRnh0avKtA',1,0.02043,100.50000,'2016-07-07 12:48:38',0),
  (28,'3vnD5cBWqaA',1,0.00656,100.50000,'2016-07-07 12:48:47',0),
  (29,'4DIFUpXs7l8',1,0.00606,100.50000,'2016-07-07 12:50:55',0),
  (30,'cuwT000iMWo',1,0.00000,100.50000,'2016-07-07 12:51:04',0),
  (31,'4DIFUpXs7l8',1,0.01077,100.50000,'2016-07-07 13:21:38',0),
  (32,'aJRnh0avKtA',1,0.00219,100.50000,'2016-07-07 13:21:53',0),
  (33,'QdbRSVxdvvs',1,0.05551,100.50000,'2016-07-07 13:22:43',0),
  (34,'B7Z4Pmf-tQk',1,0.00000,100.50000,'2016-07-07 16:36:08',0),
  (35,'xvbEyU-GrQs',1,0.00000,100.50000,'2016-07-08 10:53:01',0),
  (36,'x81VNgPXRaw',1,0.00000,100.50000,'2016-07-08 11:22:24',0),
  (37,'4DIFUpXs7l8',1,0.00000,100.50000,'2016-07-08 12:34:24',0),
  (38,'4DIFUpXs7l8',1,0.01148,100.50000,'2016-07-08 12:34:29',0),
  (39,'aJRnh0avKtA',1,0.01787,100.50000,'2016-07-08 12:37:08',0),
  (40,'-cIXFA-sr1c',1,0.00000,100.50000,'2016-07-08 12:37:15',0),
  (41,'x81VNgPXRaw',1,0.00000,100.50000,'2016-07-08 12:37:27',0),
  (42,'ohxcgnJTiPI',1,0.00000,100.50000,'2016-07-08 12:37:29',0),
  (43,'XM2ZxxZ634g',1,0.00000,100.50000,'2016-07-08 12:37:32',0),
  (44,'7Ay5QvVHmq0',1,0.00000,100.50000,'2016-07-08 12:37:39',0),
  (45,'wManX5Ne-Fg',1,0.00655,100.50000,'2016-07-08 12:37:54',0),
  (46,'x81VNgPXRaw',1,0.00000,100.50000,'2016-07-08 13:49:10',0),
  (47,'x81VNgPXRaw',1,0.01260,100.50000,'2016-07-08 13:49:14',0),
  (48,'ohxcgnJTiPI',1,0.00225,100.50000,'2016-07-08 13:49:32',0),
  (49,'XM2ZxxZ634g',1,0.00000,100.50000,'2016-07-08 13:49:41',0),
  (50,'ohxcgnJTiPI',1,0.00394,6845.86100,'2016-07-08 13:52:40',0),
  (51,'B7Z4Pmf-tQk',1,0.00865,0.00000,'2016-07-08 14:00:36',0),
  (52,'B7Z4Pmf-tQk',1,0.00865,1306.14698,'2016-07-08 14:00:38',0),
  (53,'4DIFUpXs7l8',1,0.00709,0.00709,'2016-07-08 14:01:38',0),
  (54,'MadlqMKwWB8',1,0.00000,11.38799,'2016-07-08 14:02:45',0),
  (55,'MadlqMKwWB8',1,0.00000,823.44547,'2016-07-08 14:02:50',0),
  (56,'CN42I3oViX8',1,0.00680,4.70864,'2016-07-08 14:04:19',0),
  (57,'98T3lkkdKqk',1,2575.02100,2575.02100,'2016-07-08 14:32:02',1),
  (58,'x81VNgPXRaw',1,NULL,NULL,'2016-07-08 14:36:16',0),
  (59,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 14:36:23',0),
  (60,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 14:37:45',1),
  (61,'cuwT000iMWo',1,NULL,NULL,'2016-07-08 14:39:06',0),
  (62,'ZoMPT7hJEtU',1,NULL,NULL,'2016-07-08 14:39:12',0),
  (63,'ZoMPT7hJEtU',1,NULL,NULL,'2016-07-08 14:40:44',1),
  (64,'7ExftMMTbWM',1,NULL,NULL,'2016-07-08 15:01:15',0),
  (65,'x81VNgPXRaw',1,NULL,NULL,'2016-07-08 15:29:22',0),
  (66,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-08 15:35:34',0),
  (67,'7ZQWjKMQsQw',1,NULL,NULL,'2016-07-08 15:35:38',0),
  (68,'lz233gJSzK0',1,NULL,NULL,'2016-07-08 15:35:41',0),
  (69,'lz233gJSzK0',1,NULL,NULL,'2016-07-08 15:37:03',1),
  (70,'98T3lkkdKqk',1,NULL,NULL,'2016-07-08 15:38:24',0),
  (71,'98T3lkkdKqk',1,NULL,NULL,'2016-07-08 15:38:55',1),
  (72,'wa2nLEhUcZ0',1,NULL,NULL,'2016-07-08 16:41:55',0),
  (73,'wa2nLEhUcZ0',1,NULL,NULL,'2016-07-08 16:45:36',1),
  (74,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-08 16:56:02',0),
  (75,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-08 16:56:42',1),
  (76,'98T3lkkdKqk',1,NULL,NULL,'2016-07-08 17:11:49',1),
  (77,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:11:51',0),
  (78,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:11:58',1),
  (79,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:11:58',0),
  (80,'7Ay5QvVHmq0',1,NULL,NULL,'2016-07-08 17:11:59',0),
  (81,'7Ay5QvVHmq0',1,NULL,NULL,'2016-07-08 17:12:19',1),
  (82,'7ZQWjKMQsQw',1,NULL,NULL,'2016-07-08 17:12:20',0),
  (83,'7ZQWjKMQsQw',1,NULL,NULL,'2016-07-08 17:13:15',1),
  (84,'lz233gJSzK0',1,NULL,NULL,'2016-07-08 17:13:24',0),
  (85,'98T3lkkdKqk',1,NULL,NULL,'2016-07-08 17:17:41',1),
  (86,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:17:42',0),
  (87,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:17:49',1),
  (88,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:17:50',0),
  (89,'7Ay5QvVHmq0',1,NULL,NULL,'2016-07-08 17:17:51',0),
  (90,'98T3lkkdKqk',1,NULL,NULL,'2016-07-08 17:18:07',1),
  (91,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:18:08',0),
  (92,'98T3lkkdKqk',1,NULL,NULL,'2016-07-08 17:23:26',1),
  (93,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:23:27',0),
  (94,'98T3lkkdKqk',1,NULL,NULL,'2016-07-08 17:31:54',1),
  (95,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:31:55',0),
  (96,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:35:04',0),
  (97,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:35:08',1),
  (98,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-08 17:35:08',0),
  (99,'7Ay5QvVHmq0',1,NULL,NULL,'2016-07-08 17:35:09',0),
  (100,'7Ay5QvVHmq0',1,NULL,NULL,'2016-07-08 17:35:16',1),
  (101,'wManX5Ne-Fg',1,NULL,NULL,'2016-07-08 17:35:17',0),
  (102,'wManX5Ne-Fg',1,NULL,NULL,'2016-07-08 17:35:22',1),
  (103,'wManX5Ne-Fg',1,NULL,NULL,'2016-07-08 17:35:22',0),
  (104,'dJVaxD8GDWw',1,NULL,NULL,'2016-07-08 17:35:23',0),
  (105,'dJVaxD8GDWw',1,NULL,NULL,'2016-07-08 17:35:25',1),
  (106,'dJVaxD8GDWw',1,NULL,NULL,'2016-07-08 17:35:25',0),
  (107,'_QTL8gYdc8M',1,NULL,NULL,'2016-07-08 17:35:26',0),
  (108,'_QTL8gYdc8M',1,NULL,NULL,'2016-07-08 17:35:29',1),
  (109,'_QTL8gYdc8M',1,NULL,NULL,'2016-07-08 17:35:29',0),
  (110,'dJVaxD8GDWw',1,NULL,NULL,'2016-07-08 17:35:30',0),
  (111,'dJVaxD8GDWw',1,NULL,NULL,'2016-07-08 17:35:36',1),
  (112,'dJVaxD8GDWw',1,NULL,NULL,'2016-07-08 17:35:36',0),
  (113,'ymwJBgcYrIM',1,NULL,NULL,'2016-07-08 17:35:37',0),
  (114,'EVOSPb9B1SU',1,NULL,NULL,'2016-07-08 17:37:23',0),
  (115,'EVOSPb9B1SU',1,NULL,NULL,'2016-07-08 17:37:25',1),
  (116,'-GZ3H6WCEK0',1,NULL,NULL,'2016-07-08 17:37:27',0),
  (117,'8yhufgtRHrU',1,NULL,NULL,'2016-07-08 17:38:25',0),
  (118,'tnbwxJuCBHo',1,NULL,NULL,'2016-07-08 17:38:34',0),
  (119,'L3-CLD1-WD8',1,NULL,NULL,'2016-07-08 17:38:39',0),
  (120,'c2OIAImlFxk',1,NULL,NULL,'2016-07-08 17:38:43',0),
  (121,'c2OIAImlFxk',1,NULL,NULL,'2016-07-08 17:38:47',1),
  (122,'N2oNGAhGXB4',1,NULL,NULL,'2016-07-08 17:38:48',0),
  (123,'wNBFtw2FuLQ',1,NULL,NULL,'2016-07-08 17:38:54',0),
  (124,'wNBFtw2FuLQ',1,NULL,NULL,'2016-07-08 17:39:01',1),
  (125,'wNBFtw2FuLQ',1,NULL,NULL,'2016-07-08 17:39:01',0),
  (126,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-08 17:39:08',0),
  (127,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-08 17:39:12',1),
  (128,'EVOSPb9B1SU',1,NULL,NULL,'2016-07-08 17:39:13',0),
  (129,'EVOSPb9B1SU',1,NULL,NULL,'2016-07-08 17:39:17',1),
  (130,'-GZ3H6WCEK0',1,NULL,NULL,'2016-07-08 17:39:18',0),
  (131,'-GZ3H6WCEK0',1,NULL,NULL,'2016-07-08 17:39:21',1),
  (132,'-GZ3H6WCEK0',1,NULL,NULL,'2016-07-08 17:39:21',0),
  (133,'rLUBeeGgmwE',1,NULL,NULL,'2016-07-08 17:39:22',0),
  (134,'7ZQWjKMQsQw',1,NULL,NULL,'2016-07-08 17:39:27',0),
  (135,'svD2N4aDR5s',1,NULL,NULL,'2016-07-08 17:47:17',0),
  (136,'svD2N4aDR5s',1,NULL,NULL,'2016-07-08 17:47:22',1),
  (137,'svD2N4aDR5s',1,NULL,NULL,'2016-07-08 17:47:22',0),
  (138,'9-NFosnfd2c',1,NULL,NULL,'2016-07-08 17:47:23',0),
  (139,'9-NFosnfd2c',1,NULL,NULL,'2016-07-08 17:47:30',1),
  (140,'7ZQWjKMQsQw',1,NULL,NULL,'2016-07-08 17:47:31',0),
  (141,'7ZQWjKMQsQw',1,NULL,NULL,'2016-07-08 17:47:38',1),
  (142,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-08 17:47:39',0),
  (143,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-08 17:47:47',1),
  (144,'EVOSPb9B1SU',1,NULL,NULL,'2016-07-08 17:47:48',0),
  (145,'BNKSs1J38EA',1,NULL,NULL,'2016-07-11 13:38:10',0),
  (146,'BNKSs1J38EA',1,NULL,NULL,'2016-07-11 13:41:07',1),
  (147,'Fhy76l7iOOs',1,NULL,NULL,'2016-07-11 13:42:41',0),
  (148,'Fhy76l7iOOs',1,NULL,NULL,'2016-07-11 13:47:02',1),
  (149,'nnBKL01gD8A',1,NULL,NULL,'2016-07-11 13:47:18',0),
  (150,'3asYvcNGf_E',1,NULL,NULL,'2016-07-11 13:48:12',0),
  (151,'3asYvcNGf_E',1,NULL,NULL,'2016-07-11 14:29:54',1),
  (152,'efnAzvDw_nw',1,NULL,NULL,'2016-07-11 14:32:27',0),
  (153,'efnAzvDw_nw',1,NULL,NULL,'2016-07-11 15:51:15',1),
  (154,'_ERgOABYY0k',1,NULL,NULL,'2016-07-11 15:53:07',0),
  (155,'2nF2dcH7T9w',1,NULL,NULL,'2016-07-11 16:22:25',0),
  (156,'MW6E_TNgCsY',1,NULL,NULL,'2016-07-11 20:30:12',0),
  (157,'MW6E_TNgCsY',1,NULL,NULL,'2016-07-11 20:33:32',1),
  (158,'D1vQJFF2TKQ',1,NULL,NULL,'2016-07-11 20:33:55',0),
  (159,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-12 16:39:21',0),
  (160,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-12 16:39:41',1),
  (161,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-12 16:39:41',0),
  (162,'x81VNgPXRaw',1,NULL,NULL,'2016-07-12 16:39:43',0),
  (163,'x81VNgPXRaw',1,NULL,NULL,'2016-07-12 16:39:56',1),
  (164,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-12 16:39:57',0),
  (165,'aYZJ3OLtDMY',1,NULL,NULL,'2016-07-12 16:40:09',0),
  (166,'aYZJ3OLtDMY',1,NULL,NULL,'2016-07-12 16:40:15',1),
  (167,'aYZJ3OLtDMY',1,NULL,NULL,'2016-07-12 16:40:15',0),
  (168,'FbeNGHhYTdg',1,NULL,NULL,'2016-07-12 16:40:16',0),
  (169,'eXbLTiCs2rA',1,NULL,NULL,'2016-07-12 18:00:17',0),
  (170,'eXbLTiCs2rA',1,NULL,NULL,'2016-07-12 18:00:27',1),
  (171,'eXbLTiCs2rA',1,NULL,NULL,'2016-07-12 18:00:27',0),
  (172,'Vnyx9w4dP-0',1,NULL,NULL,'2016-07-12 18:00:29',0),
  (173,'Vnyx9w4dP-0',1,NULL,NULL,'2016-07-12 18:00:35',0),
  (174,'3ogMD7wUXNU',1,NULL,NULL,'2016-07-12 18:00:44',0),
  (175,'YgQRRI9goFg',1,NULL,NULL,'2016-07-12 18:02:55',0),
  (176,'tccZs_veliA',1,NULL,NULL,'2016-07-12 18:02:57',0),
  (177,'Nb6JiKL3d1s',1,NULL,NULL,'2016-07-12 18:03:00',0),
  (178,'9Ba-2ag3tgo',1,NULL,NULL,'2016-07-12 18:03:02',0),
  (179,'VhoHnKuf-HI',1,NULL,NULL,'2016-07-12 18:03:07',0),
  (180,'-YC4WJcvd7Y',1,NULL,NULL,'2016-07-12 18:03:10',0),
  (181,'7N5QI-s1y8Q',1,NULL,NULL,'2016-07-12 18:03:12',0),
  (182,'YCnL5KuNrTY',1,NULL,NULL,'2016-07-12 18:03:14',0),
  (183,'ulN7_7v5Jfk',1,NULL,NULL,'2016-07-12 18:03:17',0),
  (184,'YCnL5KuNrTY',1,NULL,NULL,'2016-07-12 18:03:20',0),
  (185,'ulN7_7v5Jfk',1,NULL,NULL,'2016-07-12 18:03:34',0),
  (186,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-14 13:52:02',0),
  (187,'x81VNgPXRaw',1,NULL,NULL,'2016-07-14 13:52:05',0),
  (188,'x1zDASZWo7w',1,NULL,NULL,'2016-07-14 13:52:09',0),
  (189,'4DIFUpXs7l8',1,NULL,NULL,'2016-07-14 13:57:19',0),
  (190,'HR9gP0n5-CU',1,NULL,NULL,'2016-07-14 13:57:47',0),
  (191,'LFEckqYQWoM',1,NULL,NULL,'2016-07-14 13:58:31',0),
  (192,'FnDIjkcRwFo',1,NULL,NULL,'2016-07-14 13:58:43',0),
  (193,'U4ZSsRkG9Cc',1,NULL,NULL,'2016-07-14 13:58:46',0),
  (194,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-15 20:09:47',1),
  (195,'3elPO-FSLoY',1,NULL,NULL,'2016-07-15 20:10:30',1),
  (196,'x81VNgPXRaw',1,NULL,NULL,'2016-07-15 20:10:34',1),
  (197,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-16 00:57:02',0),
  (198,'EVOSPb9B1SU',1,NULL,NULL,'2016-07-16 00:57:19',0),
  (199,'yS2XSvy6Kag',1,NULL,NULL,'2016-07-16 00:57:46',0),
  (200,'WqgMbC6eWR4',1,NULL,NULL,'2016-07-16 00:57:57',0),
  (201,'WqgMbC6eWR4',1,NULL,NULL,'2016-07-16 00:58:03',1),
  (202,'WqgMbC6eWR4',1,NULL,NULL,'2016-07-16 00:58:03',0),
  (203,'LY3YojJlk1g',1,NULL,NULL,'2016-07-16 00:58:05',0),
  (204,'zg69ID6jGfo',1,NULL,NULL,'2016-07-16 01:02:19',0),
  (205,'DeDeu1w8oqA',1,NULL,NULL,'2016-07-16 01:02:26',0),
  (206,'DeDeu1w8oqA',1,NULL,NULL,'2016-07-16 01:02:28',1),
  (207,'DeDeu1w8oqA',1,NULL,NULL,'2016-07-16 01:02:28',0),
  (208,'cuwT000iMWo',1,NULL,NULL,'2016-07-16 01:02:30',0),
  (209,'MadlqMKwWB8',1,NULL,NULL,'2016-07-16 01:05:41',0),
  (210,'MadlqMKwWB8',1,NULL,NULL,'2016-07-16 01:05:43',1),
  (211,'MadlqMKwWB8',1,NULL,NULL,'2016-07-16 01:05:43',0),
  (212,'ZCagrRM-YTI',1,NULL,NULL,'2016-07-16 01:05:45',0),
  (213,'-XzBXPWnPj8',1,NULL,NULL,'2016-07-16 01:06:20',0),
  (214,'-XzBXPWnPj8',1,NULL,NULL,'2016-07-16 01:06:22',1),
  (215,'-XzBXPWnPj8',1,NULL,NULL,'2016-07-16 01:06:22',0),
  (216,'9lteV_mRWPU',1,NULL,NULL,'2016-07-16 01:06:24',0),
  (217,'4OsYwrNm8b0',1,NULL,NULL,'2016-07-16 01:06:29',0),
  (218,'A_MjCqQoLLA',1,NULL,NULL,'2016-07-18 10:58:19',0),
  (219,'A_MjCqQoLLA',1,NULL,NULL,'2016-07-18 10:58:32',1),
  (220,'A_MjCqQoLLA',1,NULL,NULL,'2016-07-18 10:58:32',0),
  (221,'VJDJs9dumZI',1,NULL,NULL,'2016-07-18 10:58:34',0),
  (222,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:42:46',0),
  (223,'05GTWKu4uU8',1,NULL,NULL,'2016-07-18 11:44:06',0),
  (224,'05GTWKu4uU8',1,NULL,NULL,'2016-07-18 11:44:07',1),
  (225,'05GTWKu4uU8',1,NULL,NULL,'2016-07-18 11:44:07',0),
  (226,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:44:08',0),
  (227,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:44:18',1),
  (228,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:44:18',0),
  (229,'aPWFcWUbKgo',1,NULL,NULL,'2016-07-18 11:44:19',0),
  (230,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:46:21',0),
  (231,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:46:26',1),
  (232,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:46:26',0),
  (233,'iVveFqy9mMg',1,NULL,NULL,'2016-07-18 11:46:28',0),
  (234,'iVveFqy9mMg',1,NULL,NULL,'2016-07-18 11:52:11',1),
  (235,'XIqTGRrfVAw',1,NULL,NULL,'2016-07-18 11:52:25',0),
  (236,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:58:33',0),
  (237,'05GTWKu4uU8',1,NULL,NULL,'2016-07-18 11:58:39',0),
  (238,'05GTWKu4uU8',1,NULL,NULL,'2016-07-18 11:58:44',1),
  (239,'05GTWKu4uU8',1,NULL,NULL,'2016-07-18 11:58:44',0),
  (240,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 11:58:46',0),
  (241,'ohxcgnJTiPI',1,NULL,NULL,'2016-07-18 13:34:30',0),
  (242,'x1zDASZWo7w',1,NULL,NULL,'2016-07-18 13:34:34',0),
  (243,'VXAsMQuq0W4',1,NULL,NULL,'2016-07-18 13:34:43',0),
  (244,'clzpX_hUQfc',1,NULL,NULL,'2016-07-18 14:36:45',0),
  (245,'aPWFcWUbKgo',1,NULL,NULL,'2016-07-18 14:37:02',0),
  (246,'aPWFcWUbKgo',1,NULL,NULL,'2016-07-18 14:37:11',1),
  (247,'aPWFcWUbKgo',1,NULL,NULL,'2016-07-18 14:37:11',0),
  (248,'i7i83yoQSo0',1,NULL,NULL,'2016-07-18 14:37:12',0),
  (249,'B7Z4Pmf-tQk',1,NULL,NULL,'2016-07-18 14:40:13',0),
  (250,'YIdcDL64KCE',1,NULL,NULL,'2016-07-18 15:08:06',0),
  (251,'3lEko6kMfng',1,NULL,NULL,'2016-07-18 15:08:10',0),
  (252,'3lEko6kMfng',1,NULL,NULL,'2016-07-18 15:08:12',1),
  (253,'3lEko6kMfng',1,NULL,NULL,'2016-07-18 15:08:12',0),
  (254,'YIdcDL64KCE',1,NULL,NULL,'2016-07-18 15:08:13',0),
  (255,'svD2N4aDR5s',1,NULL,NULL,'2016-07-18 15:11:28',0),
  (256,'9-NFosnfd2c',1,NULL,NULL,'2016-07-18 15:11:30',0),
  (257,'9-NFosnfd2c',1,NULL,NULL,'2016-07-18 15:11:32',1),
  (258,'7ZQWjKMQsQw',1,NULL,NULL,'2016-07-18 15:11:34',0);

/*!40000 ALTER TABLE `listens` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table migrate_version
# ------------------------------------------------------------

DROP TABLE IF EXISTS `migrate_version`;

CREATE TABLE `migrate_version` (
  `repository_id` varchar(250) NOT NULL,
  `repository_path` text,
  `version` int(11) DEFAULT NULL,
  PRIMARY KEY (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table ratings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ratings`;

CREATE TABLE `ratings` (
  `user_id` int(11) NOT NULL,
  `youtube_id` varchar(200) NOT NULL,
  `rating` float(10,10) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`youtube_id`),
  KEY `youtube_id` (`youtube_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`youtube_id`) REFERENCES `videos` (`youtube_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table saved_vids
# ------------------------------------------------------------

DROP TABLE IF EXISTS `saved_vids`;

CREATE TABLE `saved_vids` (
  `youtube_id` varchar(200) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_saved` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`youtube_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `saved_vids_ibfk_1` FOREIGN KEY (`youtube_id`) REFERENCES `videos` (`youtube_id`),
  CONSTRAINT `saved_vids_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `saved_vids` WRITE;
/*!40000 ALTER TABLE `saved_vids` DISABLE KEYS */;

INSERT INTO `saved_vids` (`youtube_id`, `user_id`, `date_saved`)
VALUES
  ('4DIFUpXs7l8',1,'2016-07-14 21:04:45'),
  ('4DIFUpXs7l8',2,'2016-07-14 20:10:58'),
  ('4OsYwrNm8b0',1,'2016-07-16 01:06:41'),
  ('aYZJ3OLtDMY',1,'2016-07-14 21:05:38'),
  ('B7Z4Pmf-tQk',1,'2016-07-18 15:08:44'),
  ('BNKSs1J38EA',2,'2016-07-14 20:10:59'),
  ('clzpX_hUQfc',1,'2016-07-18 11:59:41'),
  ('D1vQJFF2TKQ',2,'2016-07-14 20:11:01'),
  ('DeDeu1w8oqA',1,'2016-07-16 01:05:24'),
  ('FbeNGHhYTdg',1,'2016-07-14 21:05:38'),
  ('FnDIjkcRwFo',1,'2016-07-14 21:03:47'),
  ('MadlqMKwWB8',1,'2016-07-18 12:10:31'),
  ('x1zDASZWo7w',1,'2016-07-14 21:09:14'),
  ('yS2XSvy6Kag',1,'2016-07-16 01:00:34'),
  ('zg69ID6jGfo',1,'2016-07-16 01:03:31');

/*!40000 ALTER TABLE `saved_vids` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table similar_artists
# ------------------------------------------------------------

DROP TABLE IF EXISTS `similar_artists`;

CREATE TABLE `similar_artists` (
  `artist_id1` int(11) NOT NULL,
  `artist_id2` int(11) NOT NULL,
  `verification_level` int(11) DEFAULT NULL,
  PRIMARY KEY (`artist_id1`,`artist_id2`),
  KEY `artist_id2` (`artist_id2`),
  CONSTRAINT `similar_artists_ibfk_1` FOREIGN KEY (`artist_id1`) REFERENCES `artists` (`id`),
  CONSTRAINT `similar_artists_ibfk_2` FOREIGN KEY (`artist_id2`) REFERENCES `artists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `similar_artists` WRITE;
/*!40000 ALTER TABLE `similar_artists` DISABLE KEYS */;

INSERT INTO `similar_artists` (`artist_id1`, `artist_id2`, `verification_level`)
VALUES
  (2,3,1),
  (3,2,NULL);

/*!40000 ALTER TABLE `similar_artists` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `verification_level` int(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `verification_level`, `email`, `first_name`, `last_name`)
VALUES
  (1,100,'elenacaseyroby@gmail.com','Casey','Roby'),
  (2,NULL,'test@test.com',NULL,NULL);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table videos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `videos`;

CREATE TABLE `videos` (
  `youtube_id` varchar(200) NOT NULL,
  `artist_id` int(100) DEFAULT '1',
  `album_id` int(100) DEFAULT '2',
  `youtube_title` varchar(150) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `music` int(2) DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`youtube_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;

INSERT INTO `videos` (`youtube_id`, `artist_id`, `album_id`, `youtube_title`, `release_date`, `music`, `title`)
VALUES
  ('-cIXFA-sr1c',1,2,'cc dust - TONOPAH (home demo) [fan video slideshow] - track originally prod. by carlos sandoval 2014',NULL,1,'cc dust - TONOPAH (home demo) [fan video slideshow] - track originally prod. by carlos sandoval 2014'),
  ('-GZ3H6WCEK0',2,2,'The Cure\'s Greatest Hits | The Very Best of The Cure',NULL,1,'The Cure\'s Greatest Hits | The Very Best of The Cure'),
  ('-XzBXPWnPj8',1,2,'Crisis - Frustration',NULL,1,'Crisis - Frustration'),
  ('-YC4WJcvd7Y',1,2,'Dimmu Borgir - Forces Of The Northern Night - Live At Spektrum, Oslo [2011/HD]',NULL,1,'Dimmu Borgir - Forces Of The Northern Night - Live At Spektrum, Oslo [2011/HD]'),
  ('05GTWKu4uU8',1,2,'The Feelies - Crazy Rhythms',NULL,1,'The Feelies - Crazy Rhythms'),
  ('2nF2dcH7T9w',1,1,'Mindset -  Leave No Doubt [Full LP]',NULL,NULL,'Mindset -  Leave No Doubt [Full LP]'),
  ('3asYvcNGf_E',1,2,'Big Star: Third/ Sister Lovers',NULL,1,'Big Star: Third/ Sister Lovers'),
  ('3elPO-FSLoY',1,2,'Teenage  Fanclub-A Catholic Education(Full Album)',NULL,NULL,'Teenage  Fanclub-A Catholic Education(Full Album)'),
  ('3lEko6kMfng',1,2,'Crass - Bloody Revolution',NULL,1,'Crass - Bloody Revolution'),
  ('3ogMD7wUXNU',1,2,'Emperor - Emperial Live Ceremony [HD]',NULL,1,'Emperor - Emperial Live Ceremony [HD]'),
  ('3vnD5cBWqaA',1,2,'CC DUST - Never going to die @ Almo2bar 15.06.2016',NULL,1,'CC DUST - Never going to die @ Almo2bar 15.06.2016'),
  ('4DIFUpXs7l8',1,2,'CC DUST -  Never Going To Die',NULL,1,'CC DUST -  Never Going To Die'),
  ('4OsYwrNm8b0',1,2,'Crisis - White Youth',NULL,1,'Crisis - White Youth'),
  ('7Ay5QvVHmq0',1,2,'Smiths The Very Best Of [Full album]',NULL,1,'Smiths The Very Best Of [Full album]'),
  ('7ExftMMTbWM',1,2,'ANGRY SAMOANS - the unboxed set [full]',NULL,1,'ANGRY SAMOANS - the unboxed set [full]'),
  ('7N5QI-s1y8Q',28,10,'Dimmu Borgir live At Wacken 2007 [Full Concert]',NULL,1,'Dimmu Borgir live At Wacken 2007 [Full Concert]'),
  ('7ZQWjKMQsQw',1,2,'Best of The Smiths - The Smiths',NULL,1,'Best of The Smiths - The Smiths'),
  ('8yhufgtRHrU',1,2,'Super Grupo Birra y Perdiz - La fuerza',NULL,1,'Super Grupo Birra y Perdiz - La fuerza'),
  ('9-NFosnfd2c',1,2,'New Order - Substance 1987 (Disc One)',NULL,1,'New Order - Substance 1987 (Disc One)'),
  ('98T3lkkdKqk',1,2,'Teenage Fanclub - Bandwagonesque - Full Album - 1991',NULL,1,'Teenage Fanclub - Bandwagonesque - Full Album - 1991'),
  ('9Ba-2ag3tgo',1,2,'Emperor - Live @ Wacken 2014 (Full Show, Pro Shot) [HD]',NULL,1,'Emperor - Live @ Wacken 2014 (Full Show, Pro Shot) [HD]'),
  ('9lteV_mRWPU',1,2,'Crisis - Holocaust',NULL,1,'Crisis - Holocaust'),
  ('aJRnh0avKtA',1,2,'CC DUST - Live Barcelona @ Almo2bar - Full Set',NULL,1,'CC DUST - Live Barcelona @ Almo2bar - Full Set'),
  ('aPWFcWUbKgo',1,2,'Au Pairs - Playing With A Different Sex (Full Album)',NULL,1,'Au Pairs - Playing With A Different Sex (Full Album)'),
  ('aYZJ3OLtDMY',1,2,'Sonic Youth -  Dirty (full album)',NULL,1,'Sonic Youth -  Dirty (full album)'),
  ('A_MjCqQoLLA',1,2,'The Beatles - Hey Jude',NULL,1,'The Beatles - Hey Jude'),
  ('B7Z4Pmf-tQk',2,25,'The Cure - Greatest Hits (Remastered Album)',NULL,1,'Greatest Hits'),
  ('BNKSs1J38EA',29,16,'Big Star - September Gurls',NULL,1,'September Gurls'),
  ('c2OIAImlFxk',1,2,'1 HORA DE MUSICA CRISTIANA SOLO INSTRUMENTAL LA GLORIA DE DIOS',NULL,1,'1 HORA DE MUSICA CRISTIANA SOLO INSTRUMENTAL LA GLORIA DE DIOS'),
  ('clzpX_hUQfc',35,22,'The Feelies - Only Life (Full Album)',NULL,1,'Only Life (Full Album)'),
  ('CN42I3oViX8',1,2,'Best of The Spits',NULL,1,'Best of The Spits'),
  ('cuwT000iMWo',1,2,'Crass - The Feeding Of The 5,000 Full Album HD',NULL,1,'Crass - The Feeding Of The 5,000 Full Album HD'),
  ('D1vQJFF2TKQ',1,2,'Everclear - Everything To Everyone',NULL,1,'Everclear - Everything To Everyone'),
  ('DeDeu1w8oqA',1,2,'Crass - Christ Full Album HD 2K',NULL,1,'Crass - Christ Full Album HD 2K'),
  ('dJVaxD8GDWw',3,2,'The Smiths - The Queen is Dead (1986) - Full Album',NULL,1,'The Smiths - The Queen is Dead (1986) - Full Album'),
  ('efnAzvDw_nw',1,2,'Brian Eno - Here Come The Warm Jets (1974) Full Album',NULL,1,'Brian Eno - Here Come The Warm Jets (1974) Full Album'),
  ('EVOSPb9B1SU',2,2,'The Cure - Disintegration (Full Album Remastered)',NULL,1,'The Cure - Disintegration (Full Album Remastered)'),
  ('eXbLTiCs2rA',1,2,'Emperor - Empty (OFFICIAL VIDEO)',NULL,1,'Emperor - Empty (OFFICIAL VIDEO)'),
  ('FbeNGHhYTdg',1,2,'Sonic Youth - Washing Machine (full album)',NULL,1,'Sonic Youth - Washing Machine (full album)'),
  ('Fhy76l7iOOs',29,13,'Big Star - The Ballad of El Goodo',NULL,1,'The Ballad of El Goodo'),
  ('FnDIjkcRwFo',30,17,'Local Live: Glue (Full Set)',NULL,1,'Local Live: Glue (Full Set)'),
  ('HR9gP0n5-CU',31,18,'Institute - Salt EP',NULL,1,'Institute - Salt EP'),
  ('i7i83yoQSo0',1,2,'Kraftwerk - Trans-Europe Express (Full Album + Bonus Tracks) [1977]',NULL,1,'Kraftwerk - Trans-Europe Express (Full Album + Bonus Tracks) [1977]'),
  ('iVveFqy9mMg',1,2,'Real Estate - Days (2011) [full album]',NULL,1,'Real Estate - Days (2011) [full album]'),
  ('Ja2PEFD6t-c',1,2,'ANTONIA - Gresesc | Videoclip Oficial',NULL,1,'ANTONIA - Gresesc | Videoclip Oficial'),
  ('L3-CLD1-WD8',1,2,'Tus amigos (versión)',NULL,1,'Tus amigos (versión)'),
  ('LFEckqYQWoM',1,2,'Local Live: Institute (Full Set)',NULL,1,'Local Live: Institute (Full Set)'),
  ('lQb3lT-s8_0',1,2,'Pink Floyd - \"Top 10 Songs\"  +',NULL,1,'Pink Floyd - \"Top 10 Songs\"  +'),
  ('LY3YojJlk1g',1,2,'Eric Clapton - SLOWHAND Full Album (HD)',NULL,1,'Eric Clapton - SLOWHAND Full Album (HD)'),
  ('lz233gJSzK0',1,2,'Best of Joy Division - Joy Division',NULL,1,'Best of Joy Division - Joy Division'),
  ('MadlqMKwWB8',36,24,'Crazy Spirit - S/T LP (full)',NULL,1,' S/T LP (full)'),
  ('MW6E_TNgCsY',1,1,'Everclear - Santa Monica',NULL,NULL,'Everclear - Santa Monica'),
  ('N2oNGAhGXB4',1,2,'1 HORA DE MUSICA  INSTRUMENTAL CRISTIANA &&',NULL,1,'1 HORA DE MUSICA  INSTRUMENTAL CRISTIANA &&'),
  ('Nb6JiKL3d1s',1,2,'Emperor - In the Nightside Eclipse (1994) full album, vinyl',NULL,1,'Emperor - In the Nightside Eclipse (1994) full album, vinyl'),
  ('nnBKL01gD8A',29,13,'Big Star - #1 Record (full album)',NULL,1,'#1 Record [Full Record]'),
  ('O3adXwLVIaY',1,2,'Crass - Penis Envy (Full Album)',NULL,1,'Crass - Penis Envy (Full Album)'),
  ('ohxcgnJTiPI',1,2,'Teenage Fanclub - Compilation Best Of (Full Album)',NULL,1,'Teenage Fanclub - Compilation Best Of (Full Album)'),
  ('ojuhqUA5_o8',1,2,'Marc Antona . Soundwall Podcast 065 . 26 SEP 2011.',NULL,1,'Marc Antona . Soundwall Podcast 065 . 26 SEP 2011.'),
  ('QdbRSVxdvvs',1,2,'Creedence Clearwater Revival greatest hits - CCR Collection 2015',NULL,1,'Creedence Clearwater Revival greatest hits - CCR Collection 2015'),
  ('QxsmWxxouIM',1,2,'Beyoncé - Sorry',NULL,1,'Beyoncé - Sorry'),
  ('rLUBeeGgmwE',2,2,'The Cure - Greatest Hits [Full Album] (Track at Once)',NULL,1,'The Cure - Greatest Hits [Full Album] (Track at Once)'),
  ('svD2N4aDR5s',3,2,'The Smiths- BEST I - (1992) Full Album',NULL,1,'The Smiths- BEST I - (1992) Full Album'),
  ('tccZs_veliA',1,2,'Emperor - Into The Infinity Of Thoughts',NULL,1,'Emperor - Into The Infinity Of Thoughts'),
  ('tnbwxJuCBHo',1,2,'Los Subordinados feat. Claudio & Iñaki - Monja por mí',NULL,1,'Los Subordinados feat. Claudio & Iñaki - Monja por mí'),
  ('tNVdziest58',1,2,'Wire - Pink Flag (Full Album)',NULL,1,'Wire - Pink Flag (Full Album)'),
  ('U4ZSsRkG9Cc',32,19,'Local Live: Breakout (Full Set)',NULL,1,'Local Live: Breakout (Full Set)'),
  ('ulN7_7v5Jfk',13,12,'Nightwish - Live in Concert - Live from Wacken - Full Show - 01:30:13 - HD [ 2013 Wacken, Germany ]',NULL,1,'Live in Concert - Live from Wacken - Full Show]'),
  ('VhoHnKuf-HI',1,2,'Satyricon with the Norwegian National Opera Chorus',NULL,1,'Satyricon with the Norwegian National Opera Chorus'),
  ('VJDJs9dumZI',1,2,'The Beatles - While My Guitar Gently Weeps',NULL,1,'The Beatles - While My Guitar Gently Weeps'),
  ('Vnyx9w4dP-0',1,2,'Emperor -  Inno a Satana (Subtitulada) Live',NULL,1,'Emperor -  Inno a Satana (Subtitulada) Live'),
  ('VXAsMQuq0W4',1,2,'Good Vibrations - The Punk Singles Collection (Full Album)',NULL,1,'Good Vibrations - The Punk Singles Collection (Full Album)'),
  ('wa2nLEhUcZ0',2,2,'The Cure - Friday Im In Love',NULL,1,'The Cure - Friday Im In Love'),
  ('wManX5Ne-Fg',3,2,'The Smiths  - Louder Than Bombs [FULL ALBUM]',NULL,1,'The Smiths  - Louder Than Bombs [FULL ALBUM]'),
  ('wNBFtw2FuLQ',1,2,'Los Subordinados - Jugando con fuego',NULL,1,'Los Subordinados - Jugando con fuego'),
  ('WqgMbC6eWR4',1,2,'JJ Cale & Eric Clapton - The Road To Escondido (Full Album HD)',NULL,1,'JJ Cale & Eric Clapton - The Road To Escondido (Full Album HD)'),
  ('x1zDASZWo7w',33,20,'THE UNDERTONES - the very best of [full]',NULL,1,'THE UNDERTONES - the very best of [full]'),
  ('x81VNgPXRaw',1,2,'Teenage Fanclub - Grand Prix - Full Album',NULL,1,'Teenage Fanclub - Grand Prix - Full Album'),
  ('XIqTGRrfVAw',1,2,'Real Estate - Days FULL ALBUM',NULL,1,'Real Estate - Days FULL ALBUM'),
  ('XM2ZxxZ634g',1,2,'The Replacements - Compilation The Best Of (Full Album)',NULL,1,'The Replacements - Compilation The Best Of (Full Album)'),
  ('xvbEyU-GrQs',1,2,'The Replacements - Tim (1985)',NULL,1,'The Replacements - Tim (1985)'),
  ('xw49UgKoZnQ',1,2,'Teenage Fanclub - Star Sign',NULL,1,'Teenage Fanclub - Star Sign'),
  ('YCnL5KuNrTY',15,5,'Amon Amarth - Live Wacken Open Air 2014 [Full Show]',NULL,1,'Live Wacken Open Air 2014 [Full Show]'),
  ('YgQRRI9goFg',1,2,'Emperor - I Am the Black Wizards',NULL,1,'Emperor - I Am the Black Wizards'),
  ('YIdcDL64KCE',1,2,'Crass - Big A Little A',NULL,1,'Crass - Big A Little A'),
  ('ymwJBgcYrIM',3,2,'The Smiths- Hatful Of Hollow (1984) Full Abum',NULL,1,'The Smiths- Hatful Of Hollow (1984) Full Abum'),
  ('YR5ApYxkU-U',1,2,'Pink Floyd - Another Brick In The Wall (HQ)',NULL,1,'Pink Floyd - Another Brick In The Wall (HQ)'),
  ('yS2XSvy6Kag',1,2,'J.J. Cale -  1976 Troubadour',NULL,1,'J.J. Cale -  1976 Troubadour'),
  ('ZCagrRM-YTI',1,2,'Hank Wood & The Hammerheads - Go Home! LP (full)',NULL,1,'Hank Wood & The Hammerheads - Go Home! LP (full)'),
  ('zg69ID6jGfo',34,21,'Zounds - The Curse of Zounds - Singles (1980-2002) - PUNK 100%',NULL,1,'The Curse of Zounds - Singles (1980-2002) - PUNK 100%'),
  ('ZoMPT7hJEtU',1,2,'Subhumans - The Day the Country Died (LP 1983)',NULL,1,'Subhumans - The Day the Country Died (LP 1983)'),
  ('_ERgOABYY0k',1,1,'Brian Eno - Textures (Full Album)',NULL,1,'Brian Eno - Textures (Full Album)'),
  ('_QTL8gYdc8M',3,2,'The Smiths- Meat is Murder (1985) Full Album',NULL,1,'The Smiths- Meat is Murder (1985) Full Album');

/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table vids_genres
# ------------------------------------------------------------

DROP TABLE IF EXISTS `vids_genres`;

CREATE TABLE `vids_genres` (
  `youtube_id` varchar(200) NOT NULL,
  `genre_id` int(11) NOT NULL DEFAULT '1',
  `verification_level` int(11) DEFAULT NULL,
  PRIMARY KEY (`youtube_id`,`genre_id`),
  KEY `genre_id` (`genre_id`),
  CONSTRAINT `vids_genres_ibfk_1` FOREIGN KEY (`youtube_id`) REFERENCES `videos` (`youtube_id`),
  CONSTRAINT `vids_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `vids_genres` WRITE;
/*!40000 ALTER TABLE `vids_genres` DISABLE KEYS */;

INSERT INTO `vids_genres` (`youtube_id`, `genre_id`, `verification_level`)
VALUES
  ('EVOSPb9B1SU',1,NULL),
  ('EVOSPb9B1SU',107,NULL);

/*!40000 ALTER TABLE `vids_genres` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
