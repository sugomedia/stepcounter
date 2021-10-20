-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Gép: localhost
-- Létrehozás ideje: 2021. Okt 20. 16:54
-- Kiszolgáló verziója: 10.4.6-MariaDB
-- PHP verzió: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `214SZFTE_stepcounter`
--
CREATE DATABASE IF NOT EXISTS `214SZFTE_stepcounter` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `214SZFTE_stepcounter`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `stepdatas`
--

CREATE TABLE `stepdatas` (
  `ID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `date` date NOT NULL,
  `stepcount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `username` varchar(100) COLLATE utf8_hungarian_ci NOT NULL,
  `email` varchar(100) COLLATE utf8_hungarian_ci NOT NULL,
  `password` varchar(40) COLLATE utf8_hungarian_ci NOT NULL,
  `reg` datetime NOT NULL,
  `last` datetime DEFAULT NULL,
  `rights` varchar(20) COLLATE utf8_hungarian_ci NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`ID`, `username`, `email`, `password`, `reg`, `last`, `rights`, `status`) VALUES
(1, 'Administrator', 'admin@admin.hu', '86f7e437faa5a7fce15d1ddcb9eaeaea377667b8', '2021-10-01 00:00:00', '2021-10-20 16:53:43', 'admin', 1),
(2, 'Test User 1', 'test1@valami.hu', '86f7e437faa5a7fce15d1ddcb9eaeaea377667b8', '2021-10-20 00:00:00', NULL, 'user', 1),
(3, 'Test User 2', 'test2@valami.hu', '86f7e437faa5a7fce15d1ddcb9eaeaea377667b8', '2021-10-20 16:22:35', NULL, 'user', 0);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `stepdatas`
--
ALTER TABLE `stepdatas`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `userID` (`userID`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `stepdatas`
--
ALTER TABLE `stepdatas`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `stepdatas`
--
ALTER TABLE `stepdatas`
  ADD CONSTRAINT `stepdatas_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
