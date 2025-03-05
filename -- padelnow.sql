-- padelnow.tournaments source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `padelnow`.`tournaments` AS
select
    `ce`.`id_competition_event` AS `id`,
    `ce`.`name` AS `description`,
    `ce`.`start_date` AS `start_date`,
    `ce`.`end_date` AS `end_date`,
    `ce`.`id_club` AS `host_cloub_id`,
    `ce`.`available_courts` AS `roundrobin_courts`,
    `ce`.`match_duration` AS `game_duration`,
    c.name as `ClubName
from
    `padelnow`.`competition_event` `ce` inner join club c on ce.id_club = c.id_club;