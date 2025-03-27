/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars,  react-hooks/exhaustive-deps*/
import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Icon, IconButton, InputAdornment, Link, Menu, MenuItem, Paper, TextField, Typography } from '@mui/material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAlert } from 'react-alert';
import { IconBackspace, IconClockCancel, IconPencil, IconPencilPlus, IconMenu2, IconUserCheck, IconUserX, IconCheck, IconStar } from '@tabler/icons';
import SelectTournaments from 'components/SelectTournament';
import axios from 'axios';
import CaptureGameResults from './CaptureGameResults';
import UpdateGameResults from './UpdateGameResults';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import MainCard from 'ui-component/cards/MainCard';
import SelectConsecutiveDays from 'components/SelectConsecutiveDays';
import { getCategoryColor } from 'assets/categoryColors';
import SearchComponent from 'components/SearchComponent';
import CaptureGameAttendance from './CaptureGameAttendance';
import CaptureKitDelivery from './CaptureKitDelivery';

const MIN_LENGTH_FOR_SEARCH_STRING = 3;

const MyGrid = () => {
    const alert = useAlert();
    const [values, setValues] = useState({
        TournamentID: '',
        SearchStr: '',
        FilterDate: ''
    });
    const [captureResultOpen, setCaptureResultOpen] = useState(false);
    const [updateResultOpen, setUpdateResultOpen] = useState(false);
    const [attendanceOpen, setAttendanceOpen] = useState(false);
    const [kitDeliveryOpen, setKitDeliveryOpen] = useState(false);
    const [refreshScreen, setRefreshScreen] = useState(0);
    const [isTimeRestrictionsOpen, setIsTimeRestrictionsOpen] = useState(false);
    const [filteredGameList, setFilteredGameList] = useState([]);

    const cellWidth = 270;
    const cellHeight = 200;

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        currentRow.current = row;
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    //dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(utc);
    // make sure to set default timezone
    dayjs.tz.setDefault('UTC')
    var isBetween = require("dayjs/plugin/isBetween");



    let gamesRef = useRef([]);
    let timeSlotsRef = useRef([]);
    let courtsRef = useRef([]);
    let numberOfCourts = useRef(1);
    let currentRow = useRef({});
    let tournamentRef = useRef({});


    const GetTimeSlots = () => {
        if (values.TournamentID === 0 || values.FilterDate === '') {
            return
        }

        // let FilterDate = values.FilterDate.toJSON().substring(0, 10)
        // let FilterDate = filterDateRef.current.format('YYYY-MM-DD');

        let myURL = `/v1/tournament/gettimeslots?TournamentID=${values.TournamentID}&FilterDate=${values.FilterDate}`;
        axios.get(myURL)
            .then((response) => {
                if (response.data.data) {
                    let slots = response.data.data.map((item) => {
                        return item
                    });

                    let courtTemp = slots.map((item) => {
                        return item.CourtNumber
                    })
                    let myCourts = [...new Set(courtTemp)];
                    courtsRef.current = myCourts;
                    numberOfCourts.current = myCourts.length;
                    timeSlotsRef.current = response.data.data
                    GetGames();
                    setRefreshScreen(prev => prev + 1)
                } else {
                    alert.show("No existen TimeSlots para este dia")
                    courtsRef.current = [];
                    timeSlotsRef.current = [];
                    setRefreshScreen(prev => prev + 1);
                }

            })
            .catch((err) => {
                alert.error('Error buscando Timeslots...' + err.message)
                courtsRef.current = [];
                timeSlotsRef.current = [];
            })
    }

    const GetTournamentData = (TournamentID) => {
        const myURL = `/v1/catalogs/tournament?TournamentID=${TournamentID}`;
        axios.get(myURL)
            .then((response) => {
                tournamentRef.current = response.data.data;
                setRefreshScreen(prev => prev + 1);
            })
            .catch((err) => {
                return (
                    alert.error("Tournament Days missing")
                )
            })
    }



    const GetGames = () => {
        if (values.TournamentID.length === 0) {
            return
        }
        let myPromises = [
            axios.get(`/v1/tournament/listgames?TournamentID=${values.TournamentID}&GameType=RoundRobin,Holder,PlayOffs`),
            axios.get(`/v1/tournament/timerestriction?TournamentID=${values.TournamentID}&Filter=${values.FilterDate}`),
            axios.get(`/v1/tournament/kit?TournamentID=${values.TournamentID}`),
        ]
        Promise.all(myPromises)
            .then((responses) => {
                try {


                    let kitsDelievered = [];
                    if (responses[2].data.data) {
                        kitsDelievered = responses[2].data.data;
                    }
                    if (responses[0].data.data) {
                        let _games = responses[0].data.data
                        let games = _games.map((item) => {
                            let thisGame = {
                                TournamentID: values.TournamentID,
                                ID: `${item.GameID}`,
                                CategoryID: `${item.CategoryID}`,
                                Comment: `${item.Comment}`,
                                GameType: `${item.GameType}`,
                                CategoryDescription: `${item.CategoryDescription}`,
                                CategoryColor: item.CategoryColor,
                                TournamentTimeSlotsID: item.TournamentTimeSlotsID,
                                GroupNumber: item.GroupNumber,
                                MatchSearch: false,
                                Team1ID: item.Team1ID,
                                Team1WinGroup: item.Team1WinGroup,
                                Team1WinPlace: item.Team1WinPlace,
                                Team2ID: item.Team2ID,
                                Team2WinGroup: item.Team2WinGroup,
                                Team2WinPlace: item.Team2WinPlace,
                                Round: item.Round,
                                Bracket: item.Bracket,
                                Team1: [
                                    {
                                        ID: item.Team1Member1ID,
                                        Name: item.Team1Name1,
                                        Ranking: item.Team1Ranking1,
                                        Attendance: item.AttendanceDateT1u1 !== '0001-01-01T00:00:00Z',
                                    },
                                    {
                                        ID: item.Team1Member2ID,
                                        Name: item.Team1Name2,
                                        Ranking: item.Team1Ranking2,
                                        Attendance: item.AttendanceDateT1u2 !== '0001-01-01T00:00:00Z',
                                    },
                                ],
                                Team2: [
                                    {
                                        ID: item.Team2Member1ID,
                                        Name: item.Team2Name1,
                                        Ranking: item.Team2Ranking1,
                                        Attendance: item.AttendanceDateT2u1 !== '0001-01-01T00:00:00Z'
                                    },
                                    {
                                        ID: item.Team2Member2ID,
                                        Name: item.Team2Name2,
                                        Ranking: item.Team2Ranking2,
                                        Attendance: item.AttendanceDateT2u2 !== '0001-01-01T00:00:00Z'
                                    },
                                ],
                                GameResultsID: item.GameResultsID,
                                Team1Set1: item.Team1Set1,
                                Team1Set2: item.Team1Set2,
                                Team1Set3: item.Team1Set3,
                                Team2Set1: item.Team2Set1,
                                Team2Set2: item.Team2Set2,
                                Team2Set3: item.Team2Set3,
                                Winner: item.Winner,
                            }
                            // find time restrictions
                            thisGame.TimeRestrictions = [];
                            if (responses[1].data.data) {
                                let TR11 = responses[1].data.data.filter((TimeRestriction) => TimeRestriction.UserID === item.Team1Member1ID)
                                let TR12 = responses[1].data.data.filter((TimeRestriction) => TimeRestriction.UserID === item.Team1Member2ID)
                                let TR21 = responses[1].data.data.filter((TimeRestriction) => TimeRestriction.UserID === item.Team2Member1ID)
                                let TR22 = responses[1].data.data.filter((TimeRestriction) => TimeRestriction.UserID === item.Team2Member2ID)
                                if (TR11.length > 0) thisGame.TimeRestrictions.push(...TR11);
                                if (TR12.length > 0) thisGame.TimeRestrictions.push(...TR12);
                                if (TR21.length > 0) thisGame.TimeRestrictions.push(...TR21);
                                if (TR22.length > 0) thisGame.TimeRestrictions.push(...TR22);
                            }

                            return thisGame;
                        })
                        if (games && games.length > 0) {
                            games = games.map((game) => {
                                let kitDeliveredT1P1 = kitsDelievered.findIndex((kit) => kit.UserID === game.Team1[0].ID)
                                let kitDeliveredT1P2 = kitsDelievered.findIndex((kit) => kit.UserID === game.Team1[1].ID)
                                let kitDeliveredT2P1 = kitsDelievered.findIndex((kit) => kit.UserID === game.Team2[0].ID)
                                let kitDeliveredT2P2 = kitsDelievered.findIndex((kit) => kit.UserID === game.Team2[1].ID)
                                game.Team1[0].KitDelivered = kitDeliveredT1P1 > -1
                                game.Team1[1].KitDelivered = kitDeliveredT1P2 > -1
                                game.Team2[0].KitDelivered = kitDeliveredT2P1 > -1
                                game.Team2[1].KitDelivered = kitDeliveredT2P2 > -1
                                return game;
                            })
                        }
                        gamesRef.current = games;

                        filterGameList();
                        let AssignedGames = gamesRef.current.filter((item) => item.TournamentTimeSlotsID !== 0)
                        if (AssignedGames && AssignedGames.length > 0) {
                            AssignedGames.map((game) => {
                                AssignGameToTimeSlot(game.ID, game.TournamentTimeSlotsID, true)

                            })
                        }

                        // revisar cuales juegos ya tienen asignacion en el dia
                        // ciclar los juegos y ponerles marca a los que ya estan asignados via los jugadores
                        let gamesAlreadyAssigned = gamesRef.current.map((item) => {
                            let found = timeSlotsRef.current.findIndex((ts) => {
                                if (!ts.game) {
                                    return false
                                }
                                let PlayerTeam1ID1Found = item.Team1[0].ID === ts.game.Team1[0].ID
                                    || item.Team1[0].ID === ts.game.Team1[1].ID
                                    || item.Team1[0].ID === ts.game.Team2[0].ID
                                    || item.Team1[0].ID === ts.game.Team2[1].ID;

                                let PlayerTeam1ID2Found = item.Team1[1].ID === ts.game.Team1[0].ID
                                    || item.Team1[1].ID === ts.game.Team1[1].ID
                                    || item.Team1[1].ID === ts.game.Team2[0].ID
                                    || item.Team1[1].ID === ts.game.Team2[1].ID;

                                let PlayerTeam2ID1Found = item.Team2[0].ID === ts.game.Team1[0].ID
                                    || item.Team2[0].ID === ts.game.Team1[1].ID
                                    || item.Team2[0].ID === ts.game.Team2[0].ID
                                    || item.Team2[0].ID === ts.game.Team2[1].ID;

                                let PlayerTeam2ID2Found = item.Team2[1].ID === ts.game.Team1[0].ID
                                    || item.Team2[1].ID === ts.game.Team1[1].ID
                                    || item.Team2[1].ID === ts.game.Team2[0].ID
                                    || item.Team2[1].ID === ts.game.Team2[1].ID;

                                return PlayerTeam1ID1Found || PlayerTeam1ID2Found || PlayerTeam2ID1Found || PlayerTeam2ID2Found

                            })
                            if (found > -1) {
                                item.AlreadyAssigned = true;
                            }
                            return item
                        })
                        gamesRef.current = gamesAlreadyAssigned;

                        setRefreshScreen(prev => prev + 1);

                    } else {
                        gamesRef.current = [];
                        setRefreshScreen(prev => prev + 1);
                    }
                } catch (err) {
                    console.log('Error', err)
                }

            })
            .catch((err) => {
                alert.error('Error buscando Juegos...' + err.message)
                gamesRef.current = [];
            })
    }

    const getData = () => {
        if (values.TournamentID && values.TournamentID > 0 && values.FilterDate) {
            gamesRef.current = [];
            timeSlotsRef.current = [];
            courtsRef.current = [];
            GetTimeSlots();
        }
    }

    const startDrag = (evt, item) => {
        evt.dataTransfer.setData('itemID', item.ID)
    }

    const draggingOver = (evt) => {
        evt.preventDefault();
    }

    const PostAssignGameToTimeSlot = (TournamentID, GameID, TimeSlotID) => {
        let myURL = `/v1/tournament/assigngamestotimeslots?TournamentID=${TournamentID}&GameID=${GameID}&TimeSlotID=${TimeSlotID}`
        axios.put(myURL)
            .then((response) => {
                alert.success("Assignación exitosa...");
                getData();
            })
            .catch((err) => {
                alert.error("Error durante la asignación: " + err.message);
                // hacer reversa a la asignacion
                let item = {};
                item.game = {};
                item.game.ID = GameID;
                removeFromSchedule(item)
            })
    }

    const AssignGameToTimeSlot = (GameID, TimeSlotID, FromDB) => {
        const gameAlreadyExists = timeSlotsRef.current.find(item => item.game && item.game.ID === GameID);
        const TimeSlot = timeSlotsRef.current.find(item => item.ID === TimeSlotID);
        if (!TimeSlot) {
            return
        }

        if (gameAlreadyExists) {
            alert.info('Operación invalida...')
            return
        }

        if (TimeSlot.game && TimeSlot.game.ID.length > 0) {
            alert.info('Horario ocupado...')
            return
        }
        const sourceGame = gamesRef.current.find((item) => item.ID === GameID);

        if (!FromDB) {
            PostAssignGameToTimeSlot(values.TournamentID, GameID, TimeSlot.ID)

        }

        const newTimeSlots = timeSlotsRef.current.map((ts) => {
            if (ts.ID === TimeSlot.ID) {
                ts.game = sourceGame;
                return ts;
            }
            return ts;
        })

        timeSlotsRef.current = newTimeSlots;
        const newGames = gamesRef.current.map((game) => {
            if (game.ID === GameID) {
                game.scheduled = true
                game.TournamentTimeSlotsID = TimeSlot.ID;
                return game
            }
            return game
        })

        gamesRef.current = newGames;
        setRefreshScreen(prev => prev + 1);

    }


    const onDrop = (evt, target) => {

        const GameID = evt.dataTransfer.getData('itemID');
        const GameDropped = gamesRef.current.find((game) => game.ID === GameID);
        if (!GameDropped) {
            alert.error('Error al seleccionar juego');
            return
        }

        const TimeSlot = timeSlotsRef.current.find(item => item.ID === target);

        // Si las restricciones horarias coinciden con ete timeslot rechazar la asignacion
        if (GameDropped.TimeRestrictions.length > 0) {
            let restrictionFound = GameDropped.TimeRestrictions.findIndex((restriction) => {
                let myTimeSlot = dayjs(TimeSlot.StartTime)
                let LI = dayjs(restriction.RestrictedTime)
                let LS = dayjs(restriction.RestrictedTime).add(1, 'hour')

                return myTimeSlot.isBetween(LI, LS, null, '[]')
            })
            if (restrictionFound !== -1) {
                alert.error('Las restricciones horarias previenen esta signacion...')
                return
            }
        }

        let Team1Player1Found = false;
        let Team1Player2Found = false;
        let Team2Player1Found = false;
        let Team2Player2Found = false;
        let isPlayerPlayingAtTheSameTime = false;
        if (GameDropped.GameType !== 'Holder') {

            const PlayerPlayingAtTheSameTime = timeSlotsRef.current.find((timeSlot) => {
                if (timeSlot.StartTime === TimeSlot.StartTime && timeSlot.game) {
                    Team1Player1Found =
                        timeSlot.game.Team1[0].ID === GameDropped.Team1[0].ID ||
                        timeSlot.game.Team1[1].ID === GameDropped.Team1[0].ID ||
                        timeSlot.game.Team2[0].ID === GameDropped.Team1[0].ID ||
                        timeSlot.game.Team2[1].ID === GameDropped.Team1[0].ID

                    Team1Player2Found =
                        timeSlot.game.Team1[0].ID === GameDropped.Team1[1].ID ||
                        timeSlot.game.Team1[1].ID === GameDropped.Team1[1].ID ||
                        timeSlot.game.Team2[0].ID === GameDropped.Team1[1].ID ||
                        timeSlot.game.Team2[1].ID === GameDropped.Team1[1].ID

                    Team2Player1Found =
                        timeSlot.game.Team1[0].ID === GameDropped.Team2[0].ID ||
                        timeSlot.game.Team1[1].ID === GameDropped.Team2[0].ID ||
                        timeSlot.game.Team2[0].ID === GameDropped.Team2[0].ID ||
                        timeSlot.game.Team2[1].ID === GameDropped.Team2[0].ID

                    Team2Player2Found =
                        timeSlot.game.Team1[0].ID === GameDropped.Team2[1].ID ||
                        timeSlot.game.Team1[1].ID === GameDropped.Team2[1].ID ||
                        timeSlot.game.Team2[0].ID === GameDropped.Team2[1].ID ||
                        timeSlot.game.Team2[1].ID === GameDropped.Team2[1].ID

                    return (
                        timeSlot.StartTime === TimeSlot.StartTime
                        && timeSlot.game
                        && (Team1Player1Found || Team1Player2Found || Team2Player1Found || Team2Player2Found)
                    )

                }
            })
            isPlayerPlayingAtTheSameTime = (Team1Player1Found || Team1Player2Found || Team2Player1Found || Team2Player2Found);
        }

        if (isPlayerPlayingAtTheSameTime) {
            if (Team1Player1Found) {
                alert.error(`El jugador ${GameDropped.Team1[0].Name} tiene calendarizado un partido a esta hora...`)
            }
            if (Team1Player2Found) {
                alert.error(`El jugador ${GameDropped.Team1[1].Name} tiene calendarizado un partido a esta hora...`)
            }
            if (Team2Player1Found) {
                alert.error(`El jugador ${GameDropped.Team2[0].Name} tiene calendarizado un partido a esta hora...`)
            }
            if (Team2Player2Found) {
                alert.error(`El jugador ${GameDropped.Team2[1].Name} tiene calendarizado un partido a esta hora...`)
            }

            return
        }

        AssignGameToTimeSlot(GameID, TimeSlot.ID, false);
        //    filterGameList(values.SearchStr)

    }


    const DeleteAssignGameToTimeSlot = (TournamentID, GameID, TimeSlotID) => {

        let myURL = `/v1/tournament/deleteassigngamestotimeslots?TournamentID=${TournamentID}&GameID=${GameID}&TimeSlotID=${TimeSlotID}`

        axios.delete(myURL)
            .then((response) => {
                alert.success("Asignación eliminada exitosamente...");
                getData();
                setRefreshScreen(prev => prev + 1);

            })
            .catch((err) => {
                alert.error("Error durante la remoción de la asignación" + err.message);
            })
    }


    const removeFromSchedule = (item) => {
        if (!item.game) {
            return
        }

        const gameToRemove = gamesRef.current.find(i => i.ID === item.game.ID);
        if (gameToRemove.GameResultsID !== 0) {
            // Partido tiene resultados no deberia de poderse borrar
            alert.error('Partido ya ha sido jugado no puede quitarse del calendario...');
            return
        }

        const newGames = gamesRef.current.map((game) => {
            if (game.ID === gameToRemove.ID) {
                game.TournamentTimeSlotsID = 0
                game.scheduled = false;
                return game;
            }
            return game
        })
        gamesRef.current = newGames;

        const newTimeSlots = timeSlotsRef.current.map((item) => {
            if (item.game && item.game.ID === gameToRemove.ID) {
                delete item.game
                return item;
            }
            return item;
        })

        timeSlotsRef.current = newTimeSlots;
        DeleteAssignGameToTimeSlot(values.TournamentID, gameToRemove.ID, item.ID)
        filterGameList(values.SearchStr);
    }

    const renderGames = (row, visibleInGameList) => {
        if (visibleInGameList && values.SearchStr.length >= MIN_LENGTH_FOR_SEARCH_STRING) {
            if (!row.MatchSearch) {
                return
            }
        }

        const renderTeamDescription = (row, element) => {
            const winGroup = row[`Team${element}WinGroup`]
            const winPlace = row[`Team${element}WinPlace`]

            if (!winGroup) {
                return 'Por definir'
            } else {
                return `${winPlace === 1 ? 'Primero' : 'Segundo'} del grupo : ${winGroup} `
            }
        }

        return (
            <Grid item textAlign={'center'} xs={12} key={`t-${row.ID}`} >
                <Box height={`${cellHeight - 70}px`} border={visibleInGameList ? '1px solid black' : ''} >
                    <Box bgcolor={getCategoryColor(row.CategoryID).bgColor}>
                        <Typography
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'center'}
                            variant={'caption'}
                            paddingX={0.5}
                            color={getCategoryColor(row.CategoryID).textColor} fontWeight={500}
                        >
                            {`${row.CategoryDescription}-G${row.GroupNumber} `}
                        </Typography>
                        {row.TimeRestrictions.length > 0 & visibleInGameList ? <Link
                            level="title-sm"
                            underline="always"
                            variant="solid"
                            onClick={() => openTimeRestrictions(row)}
                        >
                            <Typography bgcolor={'yellow'} variant='subtitle1' ><IconClockCancel size={14} /></Typography>
                        </Link> : ""}
                    </Box>
                    {row.GameType === 'Holder' ? (
                        <>
                            <Box display={'flex'} height={'100%'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{renderTeamDescription(row, 1)}</Typography>
                                vs
                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{renderTeamDescription(row, 2)}</Typography>

                                <Typography variant={'subtitle2'} style={{ color: 'black' }} paddingTop={2}>{`Ronda: ${row.Round}, llave : ${row.Bracket} `}</Typography>

                            </Box>

                        </>
                    ) : (
                        <>

                            <Box style={{ backgroundColor: row.Winner === 1 ? '#fcf350' : '#ffffff' }} marginTop={2}>
                                <Typography variant={'subtitle2'} style={{ color: 'black' }} >{row.Team1[0].KitDelivered ? <IconCheck size='12' /> : 'x'} {row.Team1[0].Name} {row.Team1[0].Attendance ? <IconCheck size='12' /> : 'x'}</Typography>
                                <Typography variant={'subtitle2'} style={{ color: 'black' }} >{row.Team1[1].KitDelivered ? <IconCheck size='12' /> : 'x'} {row.Team1[1].Name} {row.Team1[1].Attendance ? <IconCheck size='12' /> : 'x'}</Typography>
                            </Box>

                            <Typography variant={'caption'} >vs</Typography>
                            <Box style={{ backgroundColor: row.Winner === 2 ? '#fcf350' : '#ffffff' }}>
                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{row.Team2[0].KitDelivered ? <IconCheck size='12' /> : 'x'} {row.Team2[0].Name} {row.Team2[0].Attendance ? <IconCheck size='12' /> : 'x'}</Typography>
                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{row.Team2[1].KitDelivered ? <IconCheck size='12' /> : 'x'} {row.Team2[1].Name} {row.Team2[1].Attendance ? <IconCheck size='12' /> : 'x'}</Typography>
                            </Box>
                            <Box display={'flex'} justifyContent={'space-around'} padding={1} alignItems={'center'}>
                                <Box>
                                    {row.TournamentTimeSlotsID > 0
                                        && row.GameResultsID === 0
                                        && (
                                            <>
                                                <Typography paddingTop={1} variant={'caption'} onClick={() => CaptureResultOpen(row)}>Resultados <IconPencilPlus size={16} color='#f5b914' /></Typography>
                                            </>
                                        )}
                                    {row.TournamentTimeSlotsID > 0
                                        && row.GameResultsID > 0
                                        && (
                                            <>
                                                <Typography paddingTop={1} variant={'caption'} onClick={() => UpdateResultOpen(row)}>{`${row.Team1Set1}/${row.Team2Set1} , ${row.Team1Set2}/${row.Team2Set2} , ${row.Team1Set3}/${row.Team2Set3} `}<IconPencil size={16} color='#f5b914' /></Typography>
                                            </>
                                        )}
                                </Box>
                                <IconButton onClick={(e) => handleMenuClick(e, row)} >
                                    <IconMenu2 size={20} />
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>
                <Menu
                    id='game-contextual-menu'
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}>
                    <MenuItem onClick={() => handleOpenAttendance()}>Asistencia</MenuItem>
                    <MenuItem onClick={() => handleOpenKitDelivery()}>Entrega de Kit</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Capturar Resultados</MenuItem>
                </Menu >
            </Grid>
        )
    }

    const renderTimeSlots = () => {
        return (
            <>
                {timeSlotsRef.current.map((item) => (
                    <Grid item xs={12 / numberOfCourts.current} key={item.TimeSlotID} >
                        <Paper
                            elevation={1}
                            sx={{ borderRadius: '2px', minHeight: `${cellHeight}px` }}
                            droppable="true" onDragOver={(evt => draggingOver(evt))} onDrop={(evt => onDrop(evt, item.ID))}
                        >
                            <Box display={'flex'} justifyContent={'space-between'} style={{ backgroundColor: '#9fa7cf' }} >
                                <Typography component={'p'} variant={'button'} paddingLeft={1}>{`${item.CourtNumber}`}</Typography>
                                <Typography component={'p'} variant={'button'} paddingLeft={1}>{`${dayjs(item.StartTime).format('HH:mm')}`}</Typography>
                                <IconBackspace size={'25'} onClick={() => removeFromSchedule(item)} />
                            </Box>
                            <Box>
                                <Box textAlign={'center'} key={item.ID}  >
                                    {item && item.game && (
                                        renderGames(item.game, false)
                                    )}
                                </Box>

                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </>
        );
    }



    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        if (name && value) {
            setValues({ ...values, [name]: value });
            if (name === 'TournamentID' && value !== '') {
                GetTournamentData(value);
            }
        }
    };

    useEffect(() => {
        getData();
    }, [values.TournamentID, values.FilterDate])

    const CaptureResultOpen = (row) => {
        currentRow.current = row;
        setCaptureResultOpen(true);
    }
    const UpdateResultOpen = (row) => {
        currentRow.current = row;
        setUpdateResultOpen(true);
    }

    const handleClose = () => {
        setCaptureResultOpen(false);
        setUpdateResultOpen(false);
        setIsTimeRestrictionsOpen(false);
    }


    const openTimeRestrictions = (row) => {
        currentRow.current = row;
        setIsTimeRestrictionsOpen(true);
    }

    const RenderGameTimeRestrictions = () => {
        console.log('fi');
        return (
            <>
                <DialogTitle >Restricciones horarias</DialogTitle>
                <DialogContent>
                    <Grid container>
                        <Grid item xs={6} border={'1px solid grey'} padding={1} bgcolor={'lightgrey'}>
                            {currentRow.current.Team1[0].Name}
                        </Grid>
                        <Grid item xs={6} border={'1px solid grey'} padding={1} bgcolor={'lightgrey'}>
                            {currentRow.current.Team1[1].Name}
                        </Grid>

                        <Grid item xs={6} border={'1px solid grey'} padding={1} >
                            {currentRow.current.TimeRestrictions.filter((item) =>
                                currentRow.current.Team1[0].ID === item.UserID
                            ).map((restriction) => (
                                <Typography variant={'body1'} component={'div'}>
                                    {dayjs(restriction.RestrictedTime).format('HH:mm')}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={6} border={'1px solid grey'} padding={1} >
                            {currentRow.current.TimeRestrictions.filter((item) =>
                                currentRow.current.Team1[1].ID === item.UserID
                            ).map((restriction) => (
                                <Typography variant={'body1'} component={'div'}>
                                    {dayjs(restriction.RestrictedTime).format('HH:mm')}
                                </Typography>
                            ))}

                        </Grid>

                        <Grid item xs={6} border={'1px solid grey'} padding={1} bgcolor={'lightgrey'}>
                            {currentRow.current.Team2[0].Name}
                        </Grid>
                        <Grid item xs={6} border={'1px solid grey'} padding={1} bgcolor={'lightgrey'}>
                            {currentRow.current.Team2[1].Name}
                        </Grid>
                        <Grid item xs={6} border={'1px solid grey'} padding={1} >
                            {currentRow.current.TimeRestrictions.filter((item) =>
                                currentRow.current.Team2[0].ID === item.UserID
                            ).map((restriction) => (
                                <Typography variant={'body1'} component={'div'}>
                                    {dayjs(restriction.RestrictedTime).format('HH:mm')}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={6} border={'1px solid grey'} padding={1} >
                            {currentRow.current.TimeRestrictions.filter((item) =>
                                currentRow.current.Team2[1].ID === item.UserID
                            ).map((restriction) => (
                                <Typography variant={'body1'} component={'div'}>
                                    {dayjs(restriction.RestrictedTime).format('HH:mm')}
                                </Typography>
                            ))}

                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant={'contained'} color={'info'} onClick={handleClose}>Cerrar</Button>
                </DialogActions>
            </>
        )
    }

    const drawSelectors = () => {
        return (
            <>
                <Grid item xs={3} display={'flex'} >
                    <SelectTournaments
                        name='TournamentID'
                        value={values.TournamentID}
                        label="Torneo"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item xs={3} display={'flex'} alignItems={'center'}>
                    <SelectConsecutiveDays
                        handleupdate={handleUpdate}
                        name={'FilterDate'}
                        value={values.FilterDate}
                        startdate={tournamentRef.current.StartDate}
                        enddate={tournamentRef.current.EndDate} />
                </Grid>
                <Grid item xs={6} display={'flex'} justifyContent={'end'}>

                    <Button variant='contained' color={'primary'} onClick={getData}>Buscar</Button>
                </Grid>
                <Grid item xs={2.5}>
                    <Paper  > <Typography variant={'subtitle1'} textAlign={'center'} color={'GrayText'} >Juegos no calendarizados</Typography></Paper>
                </Grid>
                <Grid item xs={9.5}>
                    <Box style={{ backgroundColor: '#9fa7cf', marginLeft: '15px' }} >
                        <Typography variant='subtitle1' textAlign={'center'} >{values.FilterDate ? dayjs(values.FilterDate).format('DD/MM/YYYY') : 'Sin Resultados...'}</Typography>
                    </Box>

                </Grid>
            </>
        )
    }


    const filterGameList = (SearchStr) => {
        let myList = [];
        let mySearchStr = SearchStr ? SearchStr : '';
        if (mySearchStr.length >= 0) {
            myList = gamesRef.current.filter((game) => (game.Team1[0].Name.toUpperCase().includes(mySearchStr.toUpperCase())) ||
                (game.Team1[1].Name.toUpperCase().includes(mySearchStr.toUpperCase())) ||
                (game.Team2[0].Name.toUpperCase().includes(mySearchStr.toUpperCase())) ||
                (game.Team2[1].Name.toUpperCase().includes(mySearchStr.toUpperCase()))
            )
        } else {
            myList = gamesRef.current;
        }
        setFilteredGameList(myList.filter(games => games.TournamentTimeSlotsID === 0));
    }

    const renderGameList = (list) => {
        if (!list || list.length === 0) {
            return
        }

        const renderTeamDescription = (row, element) => {
            const winGroup = row[`Team${element}WinGroup`]
            const winPlace = row[`Team${element}WinPlace`]

            if (!winGroup) {
                return 'Por definir'
            } else {
                return `${winPlace === 1 ? 'Primero' : 'Segundo'} del grupo : ${winGroup} `
            }
        }
        return (
            <ul style={{ marginLeft: '-40px' }}>
                {list.map((row) => (
                    <li key={row.GameID}>
                        <Box
                            draggable
                            onDragStart={(evt) => startDrag(evt, row)}
                            width={`${cellWidth - 10}px`}
                            height={`${cellHeight - 40}px`}
                            border={'1px solid black'}
                            paddingBottom={1}
                        >
                            {row.GameType === 'Holder' ?
                                (
                                    <>
                                        <Box bgcolor={getCategoryColor(row.CategoryID).bgColor} display={'flex'} flexDirection={'row'} justifyContent={'space-around'} alignItems={'center'}>
                                            <Typography
                                                display={'flex'}
                                                alignItems={'center'}
                                                justifyContent={'center'}
                                                variant={'caption'}
                                                color={getCategoryColor(row.CategoryID).textColor} fontWeight={500}
                                            >
                                                {`${row.CategoryDescription}-`}{row.GroupNumber !== 0? 'G' +row.GroupNumber : 'Eliminatoria'}
                                            </Typography>
                                        </Box>
                                        <Box display={'flex'} height={'100%'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
                                            <Typography variant={'subtitle2'} style={{ color: 'black' }}>{renderTeamDescription(row, 1)}</Typography>
                                            vs
                                            <Typography variant={'subtitle2'} style={{ color: 'black' }}>{renderTeamDescription(row, 2)}</Typography>

                                            <Typography variant={'subtitle2'} style={{ color: 'black' }} paddingTop={2}>{`Ronda: ${row.Round}, llave : ${row.Bracket} `}</Typography>
                                        </Box>

                                    </>
                                ) :
                                (
                                    <>
                                        <Box bgcolor={getCategoryColor(row.CategoryID).bgColor} display={'flex'} flexDirection={'row'} justifyContent={'space-around'} alignItems={'center'}>
                                            {row.AlreadyAssigned && (
                                                <IconStar size={15} color={'red'} fill='red' />
                                            )}
                                            <Typography
                                                display={'flex'}
                                                alignItems={'center'}
                                                justifyContent={'center'}
                                                variant={'caption'}
                                                color={getCategoryColor(row.CategoryID).textColor} fontWeight={500}
                                            >
                                                {`${row.CategoryDescription}-`}{row.GroupNumber !== 0? 'G' +row.GroupNumber : 'Eliminatoria'}

                                            </Typography>
                                            {row.AlreadyAssigned && (
                                                <IconStar size={15} color={'red'} fill='red' />
                                            )}
                                        </Box>

                                        <Box >
                                            {row.TimeRestrictions.length > 0 ?
                                                <Link
                                                    level="title-sm"
                                                    underline="always"
                                                    variant="solid"
                                                    onClick={() => openTimeRestrictions(row)}
                                                >
                                                    <Typography display={'flex'} justifyContent={'center'} bgcolor={'yellow'} variant='subtitle1' ><IconClockCancel size={14} /></Typography>
                                                </Link> :
                                                <Typography variant='subtitle1' >&nbsp;</Typography>}
                                        </Box>
                                        <Box display={'flex'}
                                            flexDirection={'column'}
                                            justifyContent={'center'}
                                            alignItems={'center'} >

                                            <Box style={{ backgroundColor: row.Winner === 1 ? '#fcf350' : '#ffffff' }} >
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }} >{row.Team1[0].Name}</Typography>
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }} >{row.Team1[1].Name}</Typography>
                                            </Box>

                                            <Typography variant={'caption'} >vs</Typography>

                                            <Box style={{ backgroundColor: row.Winner === 2 ? '#fcf350' : '#ffffff' }}>
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{row.Team2[0].Name}</Typography>
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{row.Team2[1].Name}</Typography>
                                            </Box>
                                        </Box>
                                    </>

                                )}
                        </Box>
                    </li>
                ))}
            </ul >
        )
    }

    const drawGameList = () => {
        return (
            <>
                <Grid item xs={2.5} >
                    <SearchComponent callfunction={(searchStr) => {
                        setValues({ ...values, SearchStr: searchStr });
                        filterGameList(searchStr);
                    }}
                    />
                    {filteredGameList.length > 0 && (

                        <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 380px)', overflowX: 'hidden' }}>
                            {renderGameList(filteredGameList)}

                        </PerfectScrollbar>
                    )}
                </Grid>
            </>
        )
    }

    const handleOpenAttendance = () => {
        handleMenuClose();
        setAttendanceOpen(true);
    }

    const handleOpenKitDelivery = () => {
        handleMenuClose();
        setKitDeliveryOpen(true);
    }

    const handleModalClose = () => {
        setAttendanceOpen(false);
        setKitDeliveryOpen(false);
        GetTimeSlots()
    }

    const modalAttendanceScreen = () => (
        <Dialog open={attendanceOpen} onClose={handleModalClose} >
            <CaptureGameAttendance game={currentRow.current} />
        </Dialog>
    )

    const modalKitDeliveryScreen = () => (
        <Dialog open={kitDeliveryOpen} onClose={handleModalClose} >
            <CaptureKitDelivery game={currentRow.current} />
        </Dialog>
    )

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MainCard title={(<Typography variant='h2'>Calendario de partidos</Typography>)}>
                <Grid container spacing={2} >
                    {drawSelectors()}
                    {drawGameList()}

                    <Grid item xs={9.5}>
                        <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 325px)', overflow: 'visible' }} >

                            {timeSlotsRef.current && timeSlotsRef.current.length > 0 && (
                                <Grid container spacing={1} minWidth={`${numberOfCourts.current * 240}px`} marginLeft={'5px'} paddingRight={'15px'}>
                                    {renderTimeSlots()}
                                </Grid>
                            )}
                        </PerfectScrollbar>
                    </Grid>
                </Grid>

                <Dialog open={captureResultOpen} onClose={handleClose} size={'lg'}>
                    <CaptureGameResults game={currentRow.current} handleclose={handleClose} getdata={getData} tournamentid={values.TournamentID} />
                </Dialog>
                <Dialog open={updateResultOpen} onClose={handleClose} size={'lg'}>
                    <UpdateGameResults game={currentRow.current} handleclose={handleClose} getdata={getData} tournamentid={values.TournamentID} />
                </Dialog>
                <Dialog open={isTimeRestrictionsOpen} size={'lg'} onClose={handleClose}>
                    <RenderGameTimeRestrictions handleClose={handleClose} />
                </Dialog>
            </MainCard>
            {modalAttendanceScreen()}
            {modalKitDeliveryScreen()}
        </LocalizationProvider>
    )
}

export default MyGrid