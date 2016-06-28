# ************************************************************
# Sequel Pro SQL dump
# Version 4529
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.13)
# Database: youtubelib
# Generation Time: 2016-06-28 19:08:36 +0000
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
  `vid_id` int(100) DEFAULT NULL,
  `track_num` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vid_id` (`vid_id`),
  CONSTRAINT `albums_ibfk_1` FOREIGN KEY (`vid_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table artists
# ------------------------------------------------------------

DROP TABLE IF EXISTS `artists`;

CREATE TABLE `artists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city_id` int(100) DEFAULT NULL,
  `country_id` int(100) DEFAULT NULL,
  `start_year` date DEFAULT NULL,
  `end_year` date DEFAULT NULL,
  `artist_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table countries
# ------------------------------------------------------------

DROP TABLE IF EXISTS `countries`;

CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table genres
# ------------------------------------------------------------

DROP TABLE IF EXISTS `genres`;

CREATE TABLE `genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table listens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `listens`;

CREATE TABLE `listens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vid_id` int(100) DEFAULT NULL,
  `user_id` int(100) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vid_id` (`vid_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `listens_ibfk_1` FOREIGN KEY (`vid_id`) REFERENCES `videos` (`id`),
  CONSTRAINT `listens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



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
  `user_id` int(11),
  `vid_id` int(11),
  `rating` float(10,10) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`vid_id`) REFERENCES `videos` (`id`),
  PRIMARY KEY (`user_id`, `vid_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table saved_vids
# ------------------------------------------------------------

DROP TABLE IF EXISTS `saved_vids`;

CREATE TABLE `saved_vids` (
  `vid_id` int(11),
  `user_id` int(11),
  `date_saved` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `saved_vids_ibfk_1` FOREIGN KEY (`vid_id`) REFERENCES `videos` (`id`),
  CONSTRAINT `saved_vids_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  PRIMARY KEY (`vid_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table similar_artists
# ------------------------------------------------------------

DROP TABLE IF EXISTS `similar_artists`;

CREATE TABLE `similar_artists` (
  `artist_id1` int(11),
  `artist_id2` int(11),
  `verification_level` int(11) DEFAULT NULL,
  CONSTRAINT `similar_artists_ibfk_1` FOREIGN KEY (`artist_id1`) REFERENCES `artists` (`id`),
  CONSTRAINT `similar_artists_ibfk_2` FOREIGN KEY (`artist_id2`) REFERENCES `artists` (`id`),
  PRIMARY KEY (`artist_id1`,`artist_id2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table videos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `videos`;

CREATE TABLE `videos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `artist_id` int(100) DEFAULT NULL,
  `album_id` int(100) DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table vids_genres
# ------------------------------------------------------------

DROP TABLE IF EXISTS `vids_genres`;

CREATE TABLE `vids_genres` (
  `vid_id` int(11),
  `genre_id` int(11),
  `verification_level` int(11) DEFAULT NULL,
  CONSTRAINT `vids_genres_ibfk_1` FOREIGN KEY (`vid_id`) REFERENCES `videos` (`id`),
  CONSTRAINT `vids_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`),
  PRIMARY KEY (`vid_id`,`genre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
