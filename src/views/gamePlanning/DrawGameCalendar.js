/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars,  react-hooks/exhaustive-deps*/

import React, { useEffect, useRef, useState } from 'react';
import { Grid, Box, Typography, Button, Dialog } from '@mui/material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useAlert } from 'react-alert';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import MainCard from 'ui-component/cards/MainCard';
import SelectTournaments from 'components/SelectTournament';
import SelectConsecutiveDays from 'components/SelectConsecutiveDays';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getCategoryColor } from 'assets/categoryColors';
import './index.css';
import CupLogo from '../../assets/images/sponsors/CupLogo.png';
import PadelNowLogo from '../../assets/images/sponsors/PadelNowLogo.png';
import Patrocinadores from '../../assets/images/sponsors/patrocinadores.png';
import Checkmark from '../../assets/images/sponsors/checkmark.jpg';
import ClubLogo from '../../assets/images/sponsors/ClubLogo.png';
import html2canvas from 'html2canvas';



const DrawGameCalendar = () => {
    const navigate = useNavigate();
    const alert = useAlert();

    const [values, setValues] = useState({
        TournamentID: '',
        FilterDate: '',
    });
    const [buttonClicked, setButtonClicked] = useState(false);

    const [headerIsOpen, setHeaderIsOpen] = useState(false);

    const [tournament, setTournament] = useState({});

    const [isColorDialogOpen, setIsColorDialogOpen] = React.useState(false);

    const [imageDimensions, setImageDimensions] = useState([]);

    const cellWidth = 170;
    const cellHeight = 160;

    let rowsRef = useRef(3);
    let columnsRef = useRef(3);

    let timeSlotsRef = useRef([]);
    let gamesRef = useRef([]);
    let gridItemSizeRef = useRef(3);
    var categoryDescriptionRef = useRef('');

    const [refreshScreen, setRefreshScreen] = React.useState(0);




    const images = [
        { name: 'Patrocinadores', src: Patrocinadores },
        { name: 'CupLogo', src: CupLogo },
        { name: 'ClubLogo', src: ClubLogo },
        { name: 'PadelNowLogo', src: PadelNowLogo },
    ];


    const AssignGameToTimeSlot = (GameID, TimeSlotID, FromDB) => {
        //  const gameAlreadyExists = timeSlotsRef.current.find(item => item.game && item.game.ID === GameID);
        const TimeSlot = timeSlotsRef.current.find(item => item.ID === TimeSlotID);

        if (!TimeSlot) {
            return
        }

        if (TimeSlot.game && TimeSlot.game.ID.length > 0) {
            alert.info('Horario ocupado...')
            return
        }
        const sourceGame = gamesRef.current.find((item) => item.ID === GameID);

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

    const loadTournamentData = () => {
        axios.get('/v1/catalogs/tournament?TournamentID=' + values.TournamentID)
            .then((response) => {
                setTournament(response.data.data)
            })
            .catch((error) => {
                alert.error('Error cargando torneos...' + error.message)
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    const removeEmptyTimeSlots = () => {
        const timeList = timeSlotsRef.current.filter((item) => item.CourtNumber === 1)
        let areRowsEmpty = timeList.map((item) => {
            let myItem = {
                StartTime: item.StartTime,
                IsRowEmpty: false
            }
            return myItem;
        })
        areRowsEmpty.forEach((item) => {
            let IsRowEmpty = timeSlotsRef.current.filter((time) => time.StartTime === item.StartTime).filter((item) => item.game && item.game.ID !== 0).length === 0;

            if (IsRowEmpty) {
                timeSlotsRef.current = timeSlotsRef.current.filter((time) => time.StartTime !== item.StartTime);
                rowsRef.current--;
            }
            setRefreshScreen(prev => prev + 1);
        })
    }

    const loadData = () => {
        if (values.TournamentID === '' || values.FilterDate === '') {
            return
        }
        let myPromises = [
            axios.get(`/v1/tournament/gettimeslots?TournamentID=${values.TournamentID}&FilterDate=${values.FilterDate}`),
            axios.get(`/v1/tournament/listgames?TournamentID=${values.TournamentID}`),
        ]
        Promise.all(myPromises)
            .then((responses) => {
                if (!responses[0].data.data) {
                    alert.info('No hay datos para mostrar')
                    return
                }
                timeSlotsRef.current = responses[0].data.data;
                rowsRef.current = timeSlotsRef.current.filter((item) => item.CourtNumber === 1).length;
                columnsRef.current = timeSlotsRef.current.filter((item) => item.StartTime === timeSlotsRef.current[0].StartTime).length;
                gridItemSizeRef.current = 12 / columnsRef.current;

                if (responses[1].data.data) {
                    let _games = responses[1].data.data
                    let games = _games.map((item) => {
                        let thisGame = {
                            ID: `${item.GameID}`,
                            CategoryID: `${item.CategoryID}`,
                            CategoryDescription: `${item.CategoryDescription}`,
                            CategoryColor: item.CategoryColor,
                            Comment: `${item.Comment}`,
                            GameType: `${item.GameType}`,
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
                                    FirstLastName: item.Team1FirstLastName1,
                                },
                                {
                                    ID: item.Team1Member2ID,
                                    Name: item.Team1Name2,
                                    Ranking: item.Team1Ranking2,
                                    FirstLastName: item.Team1FirstLastName2,
                                },
                            ],
                            Team2: [
                                {
                                    ID: item.Team2Member1ID,
                                    Name: item.Team2Name1,
                                    Ranking: item.Team2Ranking1,
                                    FirstLastName: item.Team2FirstLastName1,
                                },
                                {
                                    ID: item.Team2Member2ID,
                                    Name: item.Team2Name2,
                                    Ranking: item.Team2Ranking2,
                                    FirstLastName: item.Team2FirstLastName2,
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

                        return thisGame;
                    })
                    gamesRef.current = games;

                    let AssignedGames = gamesRef.current.filter((item) => item.TournamentTimeSlotsID !== 0)
                    if (AssignedGames && AssignedGames.length > 0) {
                        AssignedGames.map((game) => {
                            AssignGameToTimeSlot(game.ID, game.TournamentTimeSlotsID, true)

                        })
                    }
                    setRefreshScreen(prev => prev + 1);
                }
            })
            .catch((error) => {
                alert.error("Error cargando timeslots..." + error.message)
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }


    const downloadPDF4 = async () => {
        setButtonClicked(true);
        const AreaToExport = document.getElementById('PrintableArea');
        
        const margin = 40;
        const headerSize = 290;
        const footerSize = 290;

        let pageWidth =   (columnsRef.current * cellWidth ) + (4 * margin); 
        let pageHeight = (rowsRef.current * (cellHeight +5)) +headerSize + footerSize; 
        let doc;
        if (pageWidth > pageHeight) {
            doc = new jsPDF('landscape', 'px', [pageWidth, pageHeight], true);
        } else {
            doc = new jsPDF('portrait', 'px', [ pageHeight, pageWidth], true);
        }


        doc.html(AreaToExport, {
            callback: function (doc) {
                doc.save(`JuegosDiarios.pdf`);
                setButtonClicked(false);

            }, x: margin, y:  margin, width: pageWidth , windowWidth: pageWidth , margin: margin
        });

    }

    useEffect(() => {
        loadData();
    }, [])


    useEffect(() => {
        loadData();
        if (values.TournamentID !== '') {
            loadTournamentData();
        }
    }, [values.TournamentID, values.FilterDate])


    const renderGame = (item) => {

        const getFirstName = (fullName) => {
            let names = fullName.split(' ');
            return names[0];
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
            <Box
                sx={{
                    backgroundColor: '#ffffff',
                    height: `${cellHeight}px`,
                    border: `1px solid ${getCategoryColor(item.game.CategoryID).bgColor}`,
                    borderRadius: '5px 5px 5px 5px',


                }}
            >
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} bgcolor={getCategoryColor(item.game.CategoryID).bgColor} minHeight={'13px'} paddingX={1}>
                    <Typography variant='h6' color={getCategoryColor(item.game.CategoryID).textColor} fontWeight={500} fontSize={9}>
                        {item.game.CategoryDescription}
                    </Typography>
                    <Typography variant='subtitle2' color={getCategoryColor(item.game.CategoryID).textColor} fontWeight={500} fontSize={9}>
                        {`G -${item.game.GroupNumber}`}
                    </Typography>

                </Box>



                <Box sx={{

                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                }}>

                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'} flexDirection={'column'} >

                        <Typography variant='h6' fontSize={'8px'} fontWeight={600}>
                            Cancha {item.CourtNumber}
                        </Typography>
                        <Typography variant='h6' fontSize={'11px'} fontWeight={700}>
                            {dayjs(item.StartTime).format('hh:mm A')}
                        </Typography>
                    </Box>

                    {item.game.GameType === 'Holder' ? (
                        <>
                            <Box display={'flex'} height={'100%'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'} paddingTop={2}>
                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{renderTeamDescription(item.game, 1)}</Typography>
                                vs
                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{renderTeamDescription(item.game, 2)}</Typography>

                                <Typography variant={'subtitle2'} style={{ color: 'black' }} paddingTop={2}>{`Ronda: ${item.game.Round}, llave : ${item.game.Bracket} `}</Typography>
                            </Box>

                        </>
                    ) : (
                        <>

                            <Box display={'flex'} alignContent={'center'} justifyContent={'center'} >
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={2} alignItems={'center'} minWidth={'10px'}> </Box>
                                <Box display={'flex'} flexDirection={'row'} >
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 1 ? 700 : 400} color={item.game.Winner === 1 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {`${getFirstName(item.game.Team1[0].Name).toLowerCase()}`}
                                    </Typography>
                                </Box>
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={1}>
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 1 ? 700 : 400} color={item.game.Winner === 1 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {`${getFirstName(item.game.Team1[0].FirstLastName).toLowerCase()}`}
                                    </Typography>
                                </Box>
                                {item.game.Winner === 1 ? <Box display={'flex'} flexDirection={'row'} paddingLeft={1} alignItems={'center'} minWidth={'10px'}>
                                    <img src={Checkmark} alt='Checkmark' height={10} />
                                </Box>
                                    : <Box display={'flex'} flexDirection={'row'} paddingLeft={2} minWidth={'10px'} > </Box>
                                }
                            </Box>
                            <Box display={'flex'} alignContent={'center'} justifyContent={'center'} marginTop={'-5px'} >
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={2} alignItems={'center'} minWidth={'10px'}> </Box>
                                <Box display={'flex'} flexDirection={'row'} >
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 1 ? 700 : 400} color={item.game.Winner === 1 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {`${getFirstName(item.game.Team1[1].Name).toLowerCase()}`}
                                    </Typography>
                                </Box>
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={1} >
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 1 ? 700 : 400} color={item.game.Winner === 1 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {`${getFirstName(item.game.Team1[1].FirstLastName).toLowerCase()}`}
                                    </Typography>
                                </Box>
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={2} alignItems={'center'} minWidth={'10px'}> </Box>
                            </Box>

                            <Typography variant={'h6'} fontSize={10} fontWeight={700} style={{ textTransform: 'capitalize' }} >
                                VS
                            </Typography>
                            <Box display={'flex'} alignContent={'center'} justifyContent={'center'} >
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={2} alignItems={'center'} minWidth={'10px'}> </Box>
                                <Box display={'flex'} flexDirection={'row'} >
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 2 ? 700 : 400} color={item.game.Winner === 2 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {`${getFirstName(item.game.Team2[0].Name).toLowerCase()}`}
                                    </Typography>
                                </Box>
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={1}>
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 2 ? 700 : 400} color={item.game.Winner === 2 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {getFirstName(item.game.Team2[0].FirstLastName.toLowerCase())}
                                    </Typography>
                                </Box>
                                {item.game.Winner === 2 ? <Box display={'flex'} flexDirection={'row'} paddingLeft={1} alignItems={'center'} minWidth={'10px'}>
                                    <img src={Checkmark} alt='Checkmark' height={10} />
                                </Box>
                                    : <Box display={'flex'} flexDirection={'row'} paddingLeft={2} alignItems={'center'} minWidth={'10px'}> </Box>
                                }
                            </Box>
                            <Box display={'flex'} alignContent={'center'} justifyContent={'center'} marginTop={'-5px'}>
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={2} alignItems={'center'} minWidth={'10px'}> </Box>
                                <Box display={'flex'} flexDirection={'row'} >
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 2 ? 700 : 400} color={item.game.Winner === 2 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {`${getFirstName(item.game.Team2[1].Name).toLowerCase()}`}
                                    </Typography>
                                </Box>
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={1}>
                                    <Typography component={'pre'} variant={'h6'} fontSize={12} fontWeight={item.game.Winner === 2 ? 700 : 400} color={item.game.Winner === 2 ? 'textPrimary' : 'textSecondary'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} display={'flex'} >
                                        {getFirstName(item.game.Team2[1].FirstLastName.toLowerCase())}
                                    </Typography>
                                </Box>
                                <Box display={'flex'} flexDirection={'row'} paddingLeft={2} alignItems={'center'} minWidth={'10px'}> </Box>

                            </Box>

                            {item.game.GameResultsID && item.game.GameResultsID > 0 ? (
                                <Typography variant='subtitle2' fontWeight={600} paddingTop={'5px'}>
                                    {`${item.game.Team1Set1}/${item.game.Team2Set1},  ${item.game.Team1Set2}/${item.game.Team2Set2},  ${item.game.Team1Set3}/${item.game.Team2Set3}`}
                                </Typography>
                            )
                                : (
                                    <Typography variant='subtitle2' fontWeight={600} paddingTop={'5px'}>
                                        Esperando Resultados
                                    </Typography>
                                )}
                        </>
                    )}
                </Box>
            </Box>
        )
    }

    const emptyTimeSlot = (item) => (
        <Box
            sx={{
                backgroundColor: '#ffffff',
                height: `${cellHeight}px`,
                border: '1px solid #F2F2F2',
                borderRadius: '5px 5px 5px 5px',


            }}
        >
            <Box display={'flex'} justifyContent={'space-between'} style={{ backgroundColor: '#f2f2f2' }} minHeight={'13px'} >

            </Box>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'} flexDirection={'column'} >

                <Typography variant='h6' fontSize={'8px'} fontWeight={600}>
                    Cancha {item.CourtNumber}
                </Typography>
                <Typography variant='h6' fontSize={'11px'} fontWeight={700}>
                    {dayjs(item.StartTime).format('hh:mm A')}
                </Typography>
                <Typography variant='h6' fontSize={'9px'} fontWeight={400}>
                    Disponible
                </Typography>
            </Box>
        </Box>
    )
    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        if (name && value) {
            setValues({ ...values, [name]: value });
        }

    };

    const renderSelectors = () => (
        <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <SelectTournaments
                    name={'TournamentID'}
                    value={values.TournmentID}
                    handleupdate={handleUpdate}
                    label={'Seleccione Torneo'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <SelectConsecutiveDays
                    handleupdate={handleUpdate}
                    name={'FilterDate'}
                    value={values.FilterDate}
                    startdate={tournament.StartDate}
                    enddate={tournament.EndDate} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={6} display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                <Button onClick={removeEmptyTimeSlots} variant='contained' color='primary'>Quitar renglones vacios</Button>
                <Button onClick={downloadPDF4} variant='contained' color='primary'>Descargar PDF</Button>
            </Grid>
        </Grid>
    )



    const renderHeader = () => {
        return (
            <div  id='PageHeader' >
                <Box hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'}  width={`${columnsRef.current * cellWidth}px`} paddingX={6}>
                    <Grid container >
                        <Grid id='ClubLogo' item xs={4} display={'flex'} justifyContent={'flex-start'} alignItems={'center'}>
                            <img src={ClubLogo} alt="AllSeasons" height={'40px'} />
                        </Grid>
                        <Grid item xs={4} display={'flex'} justifyContent={'center'}>
                            <img src={CupLogo} alt="CupLogo" height={'79px'} />

                        </Grid>
                        <Grid item xs={4} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                            <img src={PadelNowLogo} alt="PadelNowLogo" height={'31px'} />
                        </Grid>
                    </Grid>
                </Box>
                <Box hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`${columnsRef.current * cellWidth}px`}paddingX={6}>
                    <Grid container >
                        <Grid item xs={12} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                            <Typography variant={'h6'} fontSize={11} fontWeight={700}  >
                                CIRCUITO PREMIER CUP
                            </Typography>
                            <Typography variant={'h6'} component={'div'} fontSize={30} fontWeight={700}  >
                                CUP G1 1000
                            </Typography>
                            <Typography variant={'h6'} component={'div'} fontSize={14} fontWeight={400} color={'#676767'} >
                                {tournament.ClubName} &#183; Programa diario &#183; {dayjs(values.FilterDate).format('DD/MM')} {categoryDescriptionRef.current}
                            </Typography>
                        </Grid>
                    </Grid>

                </Box>
            </div>
        )
    }
    const renderFooter = () => {
        return (
            <Box id='PageFooter' hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`${columnsRef.current * cellWidth}px`} paddingX={6}>
                <Grid container >
                    <Grid item xs={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <img src={Patrocinadores} alt="Patrocinadores" height={'160px'} />
                    </Grid>

                </Grid>
            </Box>
        )
    }


    console.log('Dimensiones', imageDimensions);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>

            <MainCard title={'Impresión de calendario de juegos por dia'} >
                {renderSelectors()}
                <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 310px)', overflow: 'visible' }} >
                    <div id='PrintableArea'>

                    {renderHeader()}
                    <Grid container spacing={1} width={columnsRef.current * cellWidth} paddingY={3} >

                        {timeSlotsRef.current.map((item, index) => (
                            <Grid item key={index} xs={gridItemSizeRef.current} >
                                {(item.game && item.game.ID !== 0) ? (renderGame(item)) : (emptyTimeSlot(item))}
                            </Grid>

))}
                    </Grid>
                    {renderFooter()}
                </div>
                </PerfectScrollbar>

            </MainCard >

        </LocalizationProvider>
    );
};

export default DrawGameCalendar;