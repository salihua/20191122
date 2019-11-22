/*
Navicat MySQL Data Transfer

Source Server         : conn2
Source Server Version : 50622
Source Host           : 39.108.142.250:3306
Source Database       : wky

Target Server Type    : MYSQL
Target Server Version : 50622
File Encoding         : 65001

Date: 2019-11-22 21:55:21
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for actuatinfos
-- ----------------------------
DROP TABLE IF EXISTS `actuatinfos`;
CREATE TABLE `actuatinfos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `deviceid` varchar(255) DEFAULT NULL,
  `actuatname` varchar(255) DEFAULT NULL,
  `actuatident` varchar(255) DEFAULT NULL,
  `actuatdatatype` varchar(255) DEFAULT NULL,
  `actuatid` varchar(255) DEFAULT NULL,
  `actuatopen` varchar(255) DEFAULT NULL,
  `actuatclose` varchar(255) DEFAULT NULL,
  `actuatcreatetime` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for devicedata
-- ----------------------------
DROP TABLE IF EXISTS `devicedata`;
CREATE TABLE `devicedata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mac` varchar(255) DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  `temp` varchar(255) DEFAULT NULL,
  `humi` varchar(255) DEFAULT NULL,
  `fire` int(255) DEFAULT NULL,
  `somke` int(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=312 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for macs
-- ----------------------------
DROP TABLE IF EXISTS `macs`;
CREATE TABLE `macs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `mac` varchar(255) DEFAULT NULL,
  `createtime` varchar(255) DEFAULT NULL,
  `deviceid` int(255) DEFAULT NULL,
  `devicename` varchar(255) DEFAULT NULL,
  `describe` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for sensorinfos
-- ----------------------------
DROP TABLE IF EXISTS `sensorinfos`;
CREATE TABLE `sensorinfos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sensorname` varchar(255) DEFAULT NULL,
  `sensorident` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `deviceid` varchar(255) DEFAULT NULL,
  `devicename` varchar(255) DEFAULT NULL,
  `sensordatatype` varchar(255) DEFAULT NULL,
  `sensorcreatetime` varchar(255) DEFAULT NULL,
  `sensorid` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
