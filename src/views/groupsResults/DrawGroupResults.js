/* eslint-disable array-callback-return, no-loop-func, react-hooks/exhaustive-deps */
import { Button, Dialog, Grid, LinearProgress, Typography } from '@mui/material';
import { Box } from '@mui/system'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useAlert } from 'react-alert';
import './styles.css';
import SelectTournaments from 'components/SelectTournament';
import SelectCategories from 'components/SelectCategories';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router';
import MainCard from 'ui-component/cards/MainCard';
import dayjs from 'dayjs';
import SelectPrintableColors from './SelectPrintableColors';

const DrawGroupResults = () => {
    const alert = useAlert();
    const navigate = useNavigate();


    const [refreshScreen, setRefreshScreen] = useState(false);
    const [values, setValues] = useState({
        TournamentID: '',
        CategoryID: ''
    });
    const [progressBarVisible, setProgressBarVisible] = useState(false);
    const [tournament, setTournament] = useState({});
    const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
    var groupsRef = useRef([]);

    const pageWidth = 1150;

    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        if (name === 'TournamentID') {
            loadTournament(value);
        }
    };

    const handleClose = () => {
        setIsColorDialogOpen(false);
    }


    const loadTournament = (TournamentID) => {
        axios.get(`/v1/catalogs/tournament?TournamentID=${TournamentID}`)
            .then((response) => {
                setTournament(response.data.data)
            })
            .catch((err) => {
                alert.error('Error cargando torneos: ' + err.message)
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
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

        // TODO : Puntos por set ganados con el esquema de CUP 
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


    const LoadData = () => {

        if ((!values.TournamentID && values.TournamentID === '') || (!values.CategoryID && values.CategoryID === '')) {
            alert.error('Torneo y categoria son requeridos');
            return
        }
        setProgressBarVisible(true);
        axios.get(`/v1/tournament/getroundrobinwinner?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`)
            .then((response) => {
                let groups = [];
                let group = [];
                let lastGroupNumber = ''

                response.data.data.map(game => {
                    if (game.GroupID === lastGroupNumber || lastGroupNumber === '') {
                        group.push(gameWinner(game))
                    } else {
                        groups.push(group);
                        group = [];
                        group.push(gameWinner(game));
                    }
                    lastGroupNumber = game.GroupID
                });

                if (group.length > 0) {
                    groups.push(group)
                }
                groupsRef.current = groups;
                //  groupResultsRef = calculateGroupResults()
                setRefreshScreen(!refreshScreen);
                setProgressBarVisible(false);
            })
            .catch((err) => {
                alert.error('Error Cargando Rounrobin winner: ' + err.message)
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    useEffect(() => {
        LoadData();
    }, [values.TournamentID, values.CategoryID])


    const displayGames = (gameParemeter, gameCounter) => {
        let game = gameParemeter;

        return (
            <Box sx={{ border: '1px solid black', borderRadius: '7px' }} >
                <Grid container padding={2} spacing={1} textAlign={'center'} minHeight={'150px'}>
                    <Grid item xs={8} >
                        Partido : {gameCounter}
                    </Grid>
                    <Grid item xs={4} display={'flex'} alignItems={'center'}>
                        <Grid container >
                            <Grid item xs={4}>
                                1
                            </Grid>
                            <Grid item xs={4}>
                                2
                            </Grid>
                            <Grid item xs={4}>
                                3
                            </Grid>

                        </Grid>
                    </Grid>

                    <Grid item xs={8} className={`TopLine ${game.Winner === 1 ? 'WinnerBackGround' : ''}`}>
                        <Box>
                            <Typography variant='h6'>
                                {`${game.Team1Member1}`}
                            </Typography>
                            <Typography variant='h6'>
                                {`${game.Team1Member2}`}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4} className={`TopLine ${game.Winner === 1 ? 'WinnerBackGround' : ''}`} display={'flex'} alignItems={'center'}>
                        <Grid container>
                            <Grid item xs={4} className='RightLine'>
                                {game.Team1Set1}
                            </Grid>
                            <Grid item xs={4} className='RightLine'>
                                {game.Team1Set2}
                            </Grid>
                            <Grid item xs={4}>
                                {game.Team1Set3}
                            </Grid>

                        </Grid>
                    </Grid>

                    <Grid item xs={8} className={`${game.Winner === 2 ? 'WinnerBackGround' : ''}`}>
                        <Box>
                            <Typography variant='h6'>

                                {`${game.Team2Member1}`}
                            </Typography>
                            <Typography variant='h6'>
                                {`${game.Team2Member2}`}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4} className={`${game.Winner === 2 ? 'WinnerBackGround' : ''}`}>
                        <Grid container>
                            <Grid item xs={4} className='RightLine'>
                                {game.Team2Set1}
                            </Grid>
                            <Grid item xs={4} className='RightLine'>
                                {game.Team2Set2}
                            </Grid>
                            <Grid item xs={4}>
                                {game.Team2Set3}
                            </Grid>

                        </Grid>
                    </Grid>

                </Grid>
            </Box>
        )
    }



    const displayGroupResults = (group) => {
        let results = [];
        group.map(game => {
            if (!results.find((item) => item.TeamID === game.Team1ID)) {
                let myGame = {};
                myGame.TeamID = game.Team1ID;
                myGame.Member1 = game.Team1Member1.toLowerCase();
                myGame.Member2 = game.Team1Member2.toLowerCase();
                results.push(myGame)
            }
            if (!results.find((item) => item.TeamID === game.Team2ID)) {
                let myGame = {};
                myGame.TeamID = game.Team2ID
                myGame.Member1 = game.Team2Member1.toLowerCase();
                myGame.Member2 = game.Team2Member2.toLowerCase();
                results.push(myGame)
            }

        });

        for (let i = 0; i < results.length; i++) {
            let JuegosPlaneados = group.filter((game) => game.Team1ID === results[i].TeamID || game.Team2ID === results[i].TeamID)
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
            results[i].JuegosJugados = JuegosPlaneados.filter((game) => game.Team1Set1 + game.Team1Set2 + game.Team1Set3 + game.Team2Set1 + game.Team2Set2 + game.Team2Set3).length;

            results[i].JuegosGanados = JuegosGanados.length;
        }

        //sort results by Juegos Ganados y PuntosGanados
        // TODO: revisar metodo de desempate
        results = results.sort((a, b) => {
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
        return (
            <Box id={group[0].GroupName} >
                <Grid container spacing={2} padding={1}>
                    <Grid item xs={12}  >
                        <Box bgcolor={'#226cac'} display={'flex'} alignContent={'center'} justifyContent={'center'} >
                            <Typography variant={'h4'} color={'white'}>
                                {`${group[0].GroupName}`}
                            </Typography>
                        </Box>
                    </Grid>

                    {group.map((game, index) => (
                        <Grid item xs={12} md={6} lg={4}>
                            {displayGames(game, index + 1)}
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Box sx={{ border: '1px solid black', borderRadius: '7px' }} >
                            <Grid container spacing={1} padding={2} >
                                <Grid item xs={4} className='BottomLine'>
                                    <Typography >Equipo </Typography>
                                </Grid>
                                <Grid xs={2} textAlign={'center'} className='BottomLine'>
                                    JJ
                                </Grid>
                                <Grid xs={2} textAlign={'center'} className='BottomLine'>
                                    JG
                                </Grid>
                                <Grid xs={2} textAlign={'center'} className='BottomLine' >
                                    PPS
                                </Grid>
                                <Grid xs={2} textAlign={'center'} className='BottomLine' >
                                    PG
                                </Grid>
                                {results.map((team) =>
                                    <>

                                        <Grid item xs={4}>
                                            <Typography >{team.Member1.toLowerCase()} / {team.Member2.toLowerCase()}</Typography>
                                        </Grid>
                                        <Grid xs={2} textAlign={'center'}>
                                            {team.JuegosJugados}
                                        </Grid>
                                        <Grid xs={2} textAlign={'center'}>
                                            {team.JuegosGanados}
                                        </Grid>
                                        <Grid xs={2} textAlign={'center'}>
                                            {team.PuntosPorSetsGanados}
                                        </Grid>
                                        <Grid xs={2} textAlign={'center'}>
                                            {team.PuntosGanados}
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        )
    }



    /* function downloadPDF() {
        groupsRef.current.forEach(async (group, index) => {
            try {
                // Ciclar todos los grupos e ir agregando paginas una por cada grupo
                const doc = new jsPDF('l', 'px', 'letter', true);

                const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                const captureArea = document.getElementById(group[0].GroupName);

                var imgBG = new Image();
                const myBGImage = require('../../assets/images/sponsors/pdf-background.jpeg')
                imgBG.src = myBGImage;
                doc.addImage(imgBG, 0, 0, pageWidth, pageHeight);

                doc.setFontSize(24);
                doc.setFont('times', 'bold');
                doc.text("GRAN TORNEO RAFAGA", pageWidth / 2, 40, { align: 'center' });

                doc.setFontSize(20);
                doc.setFont('times', 'bold');
                doc.text("Torneo de 3ra Fuerza", pageWidth / 2, 60, { align: 'center' });

                doc.setFontSize(20);
                doc.setFont('times', 'bold');
                doc.text("Resultados fase de grupos", pageWidth / 2, 80, { align: 'center' });

                var imgIpadel = new Image();
                const myImg1 = require('../../assets/images/sponsors/Gemini_Generated_Image_mwjpe4mwjpe4mwjp.jpeg');
                imgIpadel.src = myImg1;
                doc.addImage(imgIpadel, 470, 350, 90, 80);

                var imgClub = new Image();
                const myImg2 = require('../../assets/images/sponsors/fav-ico-rafaga-beige.png');
                imgClub.src = myImg2;
                doc.addImage(imgClub, 40, 350, 90, 80);

                doc.html(captureArea, {
                    callback: function (doc) {
                        doc.save(`Resultados-${group[0].GroupName}.pdf`);
                    }, x: 5, y: 120, width: 570, windowWidth: 1200, margin: 10, html2canvas: { backgroundColor: null }
                });

            } catch (error) {
                console.log('Error convirtiendo a PDF')
            }
        })
    } */


    const downloadPDFAll = ({ bgColor, textColor }) => {
        try {
            const captureArea = document.getElementById('AreaToExport');
            const customPageWidth = (pageWidth) + 30;
            const customPageHeight = (captureArea.offsetHeight) + 500;
            const customPageType = customPageWidth > customPageHeight ? 'l' : 'p';
            const customPageSize = customPageWidth === 'l' ? [customPageHeight, customPageWidth] : [customPageWidth, customPageHeight];

            const doc = new jsPDF(customPageType, 'px', customPageSize, true);
            // color de background
            doc.setFillColor(bgColor);
            doc.rect(0, 0, customPageWidth, customPageHeight, 'F');

            // Nombre del torneo centrado
            doc.setFontSize(40);
            doc.setTextColor(textColor);
            doc.setFont('times', 'bold');
            doc.text(tournament.Description, pageWidth / 2, 80, { align: 'center' });

            // Nombre del Club
            doc.setFontSize(30);
            doc.setTextColor(textColor);
            doc.setFont('times', 'bold');
            doc.text(`Sede : ${tournament.ClubName}`, pageWidth / 2, 120, { align: 'center' });
            // Fecha de Inicio y Final
            doc.setFontSize(30);
            doc.setTextColor(textColor);
            doc.setFont('times', 'bold');
            doc.text(`del : ${dayjs(tournament.StartDate).format('DD/MM/YYYY')}              al : ${dayjs(tournament.EndDate).format('DD/MM/YYYY')}`, pageWidth / 2, 170, { align: 'center' });
            doc.html(captureArea, {
                callback: function (doc) {
                    doc.save(`CuartosDraw-Todos.pdf`);
                }, x: 0, y: 250, width: pageWidth, windowWidth: (pageWidth), margin: 20, html2canvas: { backgroundColor: '#ffffff' }
            });
        } catch (error) {
            console.log('Error convirtiendo a PDF')
        }
    }


    const openColorDialog = () => {
        setIsColorDialogOpen(true);
    }

    return (
        <MainCard title='Resultados por Grupo'>
            <Box >
                <Grid container spacing={1} padding={1}>
                    <Grid item xs={5}>
                        <SelectTournaments
                            name='TournamentID'
                            label='Torneo'
                            handleupdate={handleUpdate}
                            value={values.TournamentID}
                        />

                    </Grid>
                    <Grid item xs={5}>
                        <SelectCategories
                            name='CategoryID'
                            value={values.CategoryID}
                            label="Category"
                            handleupdate={handleUpdate} />

                    </Grid>
                    <Grid item xs={2} textAlign={'end'}>
                        <Box display={'flex'} justifyContent={'space-around'} >
                            <Button onClick={openColorDialog} variant={'contained'}> PDF Todos </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Box hidden={!progressBarVisible} sx={{ width: '100%' }}>
                <LinearProgress />
            </Box>
            <Box className='AreaToExport' id='AreaToExport' width={`${pageWidth}px`} >
                {groupsRef.current.map((group) => displayGroupResults(group))}
            </Box>
            <Dialog open={isColorDialogOpen} onClose={handleClose}>
                <SelectPrintableColors handleclose={handleClose} print={downloadPDFAll} />
            </Dialog>
        </MainCard>
    )
}

export default DrawGroupResults