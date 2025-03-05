/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Grid, InputAdornment, Paper, TextField, Typography, Divider, Select, MenuItem, FormControl, InputLabel, LinearProgress } from '@mui/material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAlert } from 'react-alert';
import { IconSearch } from '@tabler/icons';
import SelectTournaments from 'components/SelectTournament';
import axios from 'axios';
import SelectCategories from 'components/SelectCategories';
import { useNavigate } from 'react-router';
import BracketComponent from 'components/TournamentBrackets/BracketComponent';
import MainCard from 'ui-component/cards/MainCard';
import jsPDF from 'jspdf';
import CupLogo from '../../assets/images/sponsors/CupLogo.png';
import PadelNowLogo from '../../assets/images/sponsors/PadelNowLogo.png';
import Patrocinadores from '../../assets/images/sponsors/patrocinadores.png';
import Checkmark from '../../assets/images/sponsors/checkmark.jpg';
import ClubLogo from '../../assets/images/sponsors/ClubLogo.png';
import dayjs from 'dayjs';


const MIN_LENGTH_FOR_SEARCH_STRING = 3;

const DrawBrackets = () => {
    const alert = useAlert();
    const navigate = useNavigate();
    const [progressBarVisible, setProgressBarVisible] = useState(false);
    const [playoffStarted, setPlayoffStarted] = useState(false);

    const [values, setValues] = useState({
        TournamentID: '',
        CategoryID: '',
        SearchStr: '',
        PlayoffSize: 4,
        ButtonDisabled: false,
        PlayoffID: 0
    });
    var categoryDescriptionRef = useRef('');

    const [refreshScreen, setRefreshScreen] = useState(false);
    const [tournament, setTournament] = useState({});

    let groupsRef = useRef([]);
    let gamesRef = useRef([]);

    const childRef = useRef();

    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const startDrag = (evt, row) => {
        evt.dataTransfer.setData('TeamID', row.TeamID);
    }


    const drawSelectors = () => {
        return (
            <Grid container>
                <Grid item xs={3} display={'flex'} >
                    <SelectTournaments
                        name='TournamentID'
                        value={values.TournamentID}
                        label="Torneo"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item xs={3} display={'flex'} >
                    <SelectCategories
                        name='CategoryID'
                        value={values.CategoryID}
                        label={'Categoria'}
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item xs={6} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                    <Button variant={'contained'} onClick={() => childRef.current.applyResultsToTree()} disabled={progressBarVisible || playoffStarted} >Asignar por resultados</Button>
                    { playoffStarted && (<Typography variant={'h6'} color={'secondary'} fontSize={20}>Eliminatoria Iniciada {playoffStarted}</Typography>)}
                    <Button variant={'contained'} onClick={() => downloadPDF3()} disabled={progressBarVisible}>Genera PDF</Button>
                </Grid>
            </Grid>
        )
    }


    const gameWinner = (gameP) => {
        let game = gameP
        let Team1 = {
            SetsGanados: 0,
            PuntosPorSetsGanados: 0,
            Winner: false
        };
        let Team2 = {
            SetsGanados: 0,
            PuntosPorSetsGanados: 0,
            Winner: false
        }
        Team1.SetsGanados += game.Team1Set1 > game.Team2Set1 ? 1 : 0;
        Team2.SetsGanados += game.Team1Set1 < game.Team2Set1 ? 1 : 0;

        Team1.SetsGanados += game.Team1Set2 > game.Team2Set2 ? 1 : 0;
        Team2.SetsGanados += game.Team1Set2 < game.Team2Set2 ? 1 : 0;

        Team1.SetsGanados += game.Team1Set3 > game.Team2Set3 ? 1 : 0;
        Team2.SetsGanados += game.Team1Set3 < game.Team2Set3 ? 1 : 0;

        // Gana Team 1
        if (Team1.SetsGanados > Team2.SetsGanados) {
            Team1.Winner = true;
            if (Team2.SetsGanados === 1) {
                Team1.PuntosPorSetsGanados = 1;
                Team2.PuntosPorSetsGanados = -1;
            } else {
                Team1.PuntosPorSetsGanados = 2;
                Team2.PuntosPorSetsGanados = -2;
            }
        }
        // Gana Team 2
        if (Team1.SetsGanados < Team2.SetsGanados) {
            Team2.Winner = true;
            if (Team1.SetsGanados === 1) {
                Team2.PuntosPorSetsGanados = 1;
                Team1.PuntosPorSetsGanados = -1;
            } else {
                Team2.PuntosPorSetsGanados = 2;
                Team1.PuntosPorSetsGanados = -2;
            }
        }
        // TODO Puntos por set ganados con el esquema de CUP 
        game.Team1 = Team1;
        game.Team2 = Team2;

        if (game.Team1.Winner || game.Team2.Winner) {
            game.Winner = Team1.Winner ? 1 : 2;
        } else {
            game.Winner = 0
        }

        return game
    }


    const CalculateWinners = () => {
        let results = [];
        groupsRef.current.map(game => {
            if (!results.find((item) => item.TeamID === game.Team1ID)) {
                let myGame = {};
                myGame.TeamID = game.Team1ID;
                myGame.Member1 = game.Team1Member1;
                myGame.Member2 = game.Team1Member2;
                myGame.GroupID = game.GroupID;
                myGame.GroupName = game.GroupName;
                myGame.GroupNumber = game.GroupNumber;
                results.push(myGame)
            }
            if (!results.find((item) => item.TeamID === game.Team2ID)) {
                let myGame = {};
                myGame.TeamID = game.Team2ID
                myGame.Member1 = game.Team2Member1;
                myGame.Member2 = game.Team2Member2;
                myGame.GroupID = game.GroupID;
                myGame.GroupName = game.GroupName;
                myGame.GroupNumber = game.GroupNumber;
                results.push(myGame)
            }

        });

        for (let i = 0; i < results.length; i++) {
            let JuegosPlaneados = groupsRef.current.filter((game) => game.Team1ID === results[i].TeamID || game.Team2ID === results[i].TeamID)
            let JuegosGanados = JuegosPlaneados.filter((game) => (game.Team1ID === results[i].TeamID && game.Winner === 1) || (game.Team2ID === results[i].TeamID && game.Winner === 2))
            results[i].PuntosPorSetsGanados = 0;
            results[i].PuntosGanados = 0;
            JuegosPlaneados.map((game) => {
                if (results[i].TeamID === game.Team1ID) {
                    results[i].PuntosPorSetsGanados = results[i].PuntosPorSetsGanados + game.Team1.PuntosPorSetsGanados
                    results[i].PuntosGanados = results[i].PuntosGanados + (game.Team1Set1 - game.Team2Set1) + (game.Team1Set2 - game.Team2Set2) + (game.Team1Set3 - game.Team2Set3)
                }
                if (results[i].TeamID === game.Team2ID) {
                    results[i].PuntosPorSetsGanados = results[i].PuntosPorSetsGanados + game.Team2.PuntosPorSetsGanados
                    results[i].PuntosGanados = results[i].PuntosGanados + (game.Team2Set1 - game.Team1Set1) + (game.Team2Set2 - game.Team1Set2) + (game.Team2Set3 - game.Team1Set3)

                }

            })

            //console.log('Ganados :', JuegosPlaneados.filter((game) => results[i].TeamID === game.Team1ID || results[i].TeamID === game.Team2ID))            
            results[i].JuegosJugados = JuegosPlaneados.filter((game) => (game.Team1ID === results[i].TeamID || game.Team2ID === results[i].TeamID) && (game.Team1Set1 + game.Team1Set2 + game.Team1Set3 + game.Team2Set1 + game.Team2Set2 + game.Team2Set3) > 0).length;

            results[i].JuegosGanados = JuegosGanados.length;
        }

        //sort results by Juegos Ganados y Puntos Por Set Ganados
        const leadingZeros = (num) => ("0" + num).slice(-2);
        let results2 = results.sort((a, b) => {
            if (a.GroupID === b.GroupID) {
                if (a.JuegosGanados === b.JuegosGanados) {
                    if (a.PuntosPorSetsGanados === b.PuntosPorSetsGanados) {
                        return a.PuntosGanados > b.PuntosGanados ? -1 : 1
                    } else {
                        return a.PuntosPorSetsGanados > b.PuntosPorSetsGanados ? -1 : 1
                    }
                } else {
                    return a.JuegosGanados > b.JuegosGanados ? -1 : 1
                }
            } else {
                return a.GroupID < b.GroupID ? -1 : 1
            }
        })
        groupsRef.current = results2;
    }


    const LoadData = () => {


        if (!values.TournamentID || !values.CategoryID) {
            // alert.error('Torneo y categoria son requeridos');
            return
        }
        setProgressBarVisible(true);
        let myPromises = [
            axios.get(`/v1/tournament/getroundrobinwinner?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`),
            axios.get(`/v1/tournament/playoffs?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`),
            axios.get(`/v1/catalogs/tournaments/info?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`),
            axios.get(`/v1/catalogs/categories?CategoryID=${values.CategoryID}`),
            axios.get(`/v1/tournament/playoffs/isstarted?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`)
        ]
        Promise.all(myPromises)
            .then((responses) => {
                let games = [];
                if (responses[0].data.data) {
                    games = responses[0].data.data.map((item) =>
                        gameWinner(item)
                    )
                    groupsRef.current = games;
                    CalculateWinners();


                    if (responses[1].data.data) {
                        setValues({ ...values, PlayoffSize: responses[1].data.data[0].PlayoffSize, ButtonDisabled: true, PlayoffID: responses[1].data.data[0].ID });
                    } else {
                        setValues({ ...values, ButtonDisabled: false, PlayoffID: 0 });

                    }
                } else {
                    groupsRef.current = games;
                    setValues({ ...values, ButtonDisabled: false, PlayoffID: 0 });
                    alert.info('No existen resultados...')
                }

                let playoffTemplate = responses[2].data.playoffTemplate;

                if (responses[3].data.data) {
                    categoryDescriptionRef.current = responses[3].data.data[0].Description;
                }

                setPlayoffStarted(responses[4].data.PlayoffStarted)
                loadTournamentData();
                setProgressBarVisible(false);
                setRefreshScreen(refreshScreen + 1);


            })
            .catch((err) => {
                setProgressBarVisible(false);
                alert.error('Error Cargando Rounrobin winner: ' + err.message)
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
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

    const renderRoundRobinWinners = () => {
        return (
            <Box padding={2}>
                {groupsRef.current.length > 0 ? (
                    <Grid container spacing={2}>

                        {groupsRef.current.map((team, index) => (
                            <Grid item xs={12}>
                                <Paper >
                                    <Box paddingX={2} paddingY={1} draggable onDragStart={(evt) => startDrag(evt, team)}>
                                        <Box display={'flex'} justifyContent={'space-between'}>
                                            <Typography variant={'subtitle2'} >

                                                {`${team.GroupName}`}
                                            </Typography>
                                            {index + 1}
                                        </Box>
                                        <Box display={'flex'} justifyContent={'space-between'}>
                                            <Typography variant={'subtitle2'} textTransform={'capitalize'} >

                                                {`${team.Member1} `}
                                            </Typography>
                                        </Box>
                                        <Box display={'flex'} justifyContent={'space-between'}>
                                            <Typography variant={'subtitle2'} textTransform={'capitalize'}>

                                                {`${team.Member2}`}
                                            </Typography>
                                        </Box>

                                        <Divider />
                                        <Grid container>
                                            <Grid item xs={3}>
                                                <Typography variant={'subtitle2'}>
                                                    {`PJ : ${team.JuegosJugados}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant={'subtitle2'}>
                                                    {`PG : ${team.JuegosGanados}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant={'subtitle2'}>
                                                    {`PPS : ${team.PuntosPorSetsGanados}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant={'subtitle2'}>
                                                    {`PP : ${team.PuntosGanados}`}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Grid>
                        )
                        )}
                    </Grid>
                ) : "Sin Resultados"}
            </Box >
        )
    }

    useEffect(() => {
        LoadData();
    }, [values.CategoryID, values.TournamentID])

    const drawGameList = () => {
        return (
            <>
                <TextField
                    size='small'
                    fullWidth
                    sx={{ paddingBottom: '5px' }}
                    label='Buscar'
                    name='SearchStr'

                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconSearch />
                            </InputAdornment>
                        )
                    }}
                    onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            //e.preventDefault();

                        }
                    }}
                />
                <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 350px)', overflowX: 'hidden' }}>
                    <Grid container spacing={1}>
                        {renderRoundRobinWinners()}
                    </Grid>
                </PerfectScrollbar>
            </>
        )
    }

    const getRoundRobinTeam = (TeamID) => {
        const teamFound = groupsRef.current.find((team) => TeamID === team.TeamID)
        return teamFound ? teamFound : {};
    }

    const getTeamByResult = (WinGroup, WinPlace) => {
        if (!WinGroup || WinGroup === 0 || !WinPlace || WinPlace === 0) return null
        let GroupFound = groupsRef.current.filter((item) => item.GroupNumber === WinGroup);

        let GroupFoundOrdered = GroupFound.sort((a, b) => {
            if (a.JuegosGanados === b.JuegosGanados) {
                if (a.PuntosPorSetsGanados === b.PuntosPorSetsGanados) {
                    return a.PuntosGanados > b.PuntosGanados ? -1 : 1
                } else {
                    return a.PuntosPorSetsGanados > b.PuntosPorSetsGanados ? -1 : 1
                }
            } else {
                return a.JuegosGanados > b.JuegosGanados ? -1 : 1
            }
        })
        return GroupFoundOrdered[WinPlace - 1]
    }


    const downloadPDF3 = () => {

        const myArray = [0];
        const HeaderArea = document.getElementById('PageHeader');
        const ClubLogoArea = document.getElementById('ClubLogo');
        const ClubLogoAreaRatio = ClubLogoArea.offsetWidth / ClubLogoArea.offsetHeight;
        console.log('Loro Ratio', ClubLogoAreaRatio);
        console.log('Logo Width : ', ClubLogoArea.offsetWidth, '     Height : ', ClubLogoArea.offsetHeight)

        let RoundCount = 0;
        switch (values.PlayoffSize) {
            case 16:
                RoundCount = 5;
                break;
            case 8:
                RoundCount = 4;
                break;
            case 4:
                RoundCount = 3;
                break;
            case 2:
                RoundCount = 2;
                break;
            case 1:
                RoundCount = 1;
                break;

            default:
                RoundCount = 0;
                break;
        }

        let calculatedHeight = 0;
        switch (values.PlayoffSize) {
            case 16:
                calculatedHeight = 1800;
                break;
            case 8:
                calculatedHeight = 1150;
                break;
            case 4:
                calculatedHeight = 700;
                break;
            case 2:
                calculatedHeight = 550;
                break;
            case 1:
                calculatedHeight = 600;
                break;

            default:
                calculatedHeight = 0;
                break;
        }

        myArray.forEach(async (group, index) => {
            try {
                const captureArea = document.getElementById('PrintableArea2');

                const margin = 40;
                const headerSize = 250;
                const footerSize = 250;
                let pageWidth = captureArea.offsetWidth + (2 * margin);
                //let pageHeight = captureArea.offsetHeight + headerSize + footerSize;
                let pageHeight = calculatedHeight + headerSize + footerSize;
                const headerSingleArea = captureArea.offsetWidth / 3;

                const footerImageWidth = captureArea.offsetWidth * 0.2 > 250 ? 1000 : captureArea.offsetWidth;
                const footerImageHeight = footerImageWidth * 0.2;

                const selectedAreaWidth = captureArea.offsetWidth;
                const selectedAreaHeight = captureArea.offsetHeight;
                // Si el ancho es mayor que el alto, entonces es landscape y se ntercambian los valores de ancho y alto
                let doc;
                if (pageWidth > pageHeight) {
                    doc = new jsPDF('landscape', 'px', [pageWidth, pageHeight], true);
                    console.log('landscape W:', pageWidth, '   H:', pageHeight)
                } else {
                    // doc = new jsPDF('portrait', 'px', [pageHeight, pageWidth], true);
                    doc = new jsPDF('portrait', 'px', [pageWidth, pageHeight], true);
                    console.log('Portrait W:', pageHeight, '   H:', pageWidth)
                }
                pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
                console.log('W: ', selectedAreaWidth, 'H: ', selectedAreaHeight);

                const headerImgWidth = HeaderArea.offsetWidth;
                const headerImgHeight = HeaderArea.offsetHeight;

                  doc.addImage(ClubLogo, 'PNG', (headerSingleArea / 2), 50, 30 * ClubLogoAreaRatio, 80, undefined, 'FAST');
                //doc.addImage(ClubLogo, 'PNG', (headerSingleArea / 2), 50, 70, 80, undefined, 'FAST');

                doc.addImage(CupLogo, 'PNG', (pageWidth / 2) - 30, 40, 61, 71, undefined, 'FAST');

                doc.addImage(PadelNowLogo, 'PNG', pageWidth - (margin + (headerSingleArea / 2) + 50), 69, 89, 31, undefined, 'FAST');

                await doc.html(HeaderArea, {
                    callback: function (doc) {
                        return doc
                    }, x: (pageWidth / 2) - (HeaderArea.offsetWidth / 2), y: 130, width: pageWidth, windowWidth: pageWidth, margin: 0
                });

                doc.addImage(Patrocinadores, 'PNG', (pageWidth / 2) - (footerImageWidth / 2), pageHeight - 220, footerImageWidth, footerImageHeight, undefined, 'FAST');

                doc.html(captureArea, {
                    callback: function (doc) {
                        doc.save(`Eliminatorias-${categoryDescriptionRef.current}.pdf`);
                    }, x: margin, y: headerSize, width: pageWidth, windowWidth: (RoundCount * 315) + (2 * margin), margin: 0
                });

            } catch (error) {
                console.log('Error convirtiendo a PDF', error.message);
            }
        }
        )
    }


    const renderHeader = () => {
        return (
            <>
                <Box hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`751px`} paddingX={6}>
                    <Grid container >
                        <Grid id='ClubLogo' item xs={4} display={'flex'} justifyContent={'flex-start'} alignItems={'center'}>
                            <img src={ClubLogo} alt="AllSeasons" height={'45px'} />
                        </Grid>
                        <Grid item xs={4} display={'flex'} justifyContent={'center'}>
                            <img src={CupLogo} alt="CupLogo" height={'79px'} />

                        </Grid>
                        <Grid item xs={4} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                            <img src={PadelNowLogo} alt="PadelNowLogo" height={'31px'} />
                        </Grid>
                    </Grid>
                </Box>
                <Box id='PageHeader' hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`751px`} paddingX={6}>
                    <Grid container >
                        <Grid item xs={12} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                            <Typography variant={'h6'} fontSize={11} fontWeight={700}  >
                                CIRCUITO PREMIER CUP
                            </Typography>
                            <Typography variant={'h6'} component={'div'} fontSize={30} fontWeight={700}  >
                                CUP G1 1000
                            </Typography>
                            <Typography variant={'h6'} component={'div'} fontSize={14} fontWeight={400} color={'#676767'} >
                                {tournament.ClubName} &#183; Eliminatorias &#183; {categoryDescriptionRef.current}
                            </Typography>
                        </Grid>
                    </Grid>

                </Box>
            </>
        )
    }


    const renderFooter = () => {
        return (
            <Box id='PageFooter' hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`751px`} paddingX={6}>
                <Grid container >
                    <Grid item xs={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <img src={Patrocinadores} alt="Patrocinadores" height={'160px'} />
                    </Grid>

                </Grid>
            </Box>
        )
    }


    const drawBrackets = () => {
        if (values.PlayoffID !== 0) {

            return (
                <BracketComponent
                    getteam={getRoundRobinTeam}
                    playoffsize={values.PlayoffSize}
                    tournamentid={values.TournamentID}
                    categoryid={values.CategoryID}
                    playoffid={values.PlayoffID}
                    loaddata={LoadData}
                    getteambyresult={getTeamByResult}
                    ref={childRef}
                    linearprogressbar={setProgressBarVisible}
                />
            )
        } else {
            return (
                <Typography variant={'h3'} fontWeight={'bold'} >Eliminatoria no creada </Typography>
            )
        }

    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MainCard title={'Eliminatorias'}>
                <Grid container spacing={1} >
                    <Grid item xs={12}>
                        {drawSelectors()}
                        <Box hidden={!progressBarVisible} sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        {drawGameList()}
                    </Grid>
                    {/* La busqueda solo deberia de ocultar los juegos que no hagan match con la busqueda */}

                    <Grid item xs={9} bgcolor={'#E6E9ED'}>
                        {renderHeader()}
                        <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 280px)', overflow: 'visible', overflowBlock: 'visible' }}>
                            <Box padding={2}>
                                {drawBrackets()}
                            </Box>
                        </PerfectScrollbar>
                        {renderFooter()}
                    </Grid>
                </Grid>
            </MainCard>

        </LocalizationProvider>
    )
}

export default DrawBrackets;