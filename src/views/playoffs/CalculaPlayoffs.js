/* eslint-disable  react-hooks/exhaustive-deps, no-unused-vars,  no-loop-func */
import { Box, Button, Divider, Grid, Paper, TextField, Typography, LinearProgress } from '@mui/material'
import axios from 'axios'
import SelectCategories from 'components/SelectCategories'
import SelectTournaments from 'components/SelectTournament'
import React, { useEffect, useRef, useState } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets'
import { CreateEmptyBrackets } from 'components/TournamentBrackets/utils'
import { useAlert } from 'react-alert'


const CalculaPlayoffs = () => {

    const alert = useAlert();
    const [values, setValues] = React.useState({
        TournamentID: '',
        CategoryID: '',
        GroupCount: '',
        ButtonDisabled: false
    })
    const [progressBarVisible, setProgressBarVisible] = useState(false);
    const rounds = useRef([]);
    const [tabIndex, setTabIndex] = useState(0);
    const [tournamentInfo, setTournamentInfo] = useState({});
    const [groupsResults, setGroupResults] = useState([]);
    const playoffTemplateRef = useRef([]);
    const initialRoundRef = useRef(0);

    const handleSwipeChange = (index) => {
        setTabIndex(index);
    };
    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const getRound = (RoundCounter, CurrentRound) => {
        switch (RoundCounter) {
            case 16:
                switch (CurrentRound) {
                    case 16:
                        return 0
                    case 8:
                        return 1
                    case 4:
                        return 2
                    case 2:
                        return 3
                    case 1:
                        return 4
                    default:
                        break;
                }
                break;
            case 8:
                switch (CurrentRound) {
                    case 8:
                        return 0
                    case 4:
                        return 1
                    case 2:
                        return 2
                    case 1:
                        return 3
                    default:
                        break;
                }
                break;
            case 4:
                switch (CurrentRound) {
                    case 4:
                        return 0
                    case 2:
                        return 1
                    case 1:
                        return 2
                    default:
                        break;
                }
                break;
            case 2:
                switch (CurrentRound) {
                    case 2:
                        return 0
                    case 1:
                        return 1
                    default:
                        break;
                }
                break;
            case 1:
                return 0

            default:
                break;
        }
    }

    const createRounds = (RoundCounter, gameTemplate) => {
        let myRounds = CreateEmptyBrackets(initialRoundRef.current);

        try {

            console.log('GameTemplate : ', gameTemplate)
            console.log('MyRounds : ', myRounds)

            // asignar el template de partidos a cada ronda
            if (gameTemplate && gameTemplate.length > 0) {
                gameTemplate.forEach((item) => {
                    console.log('RoundCounter :', RoundCounter, '  ItemRound: ', item.Round, '  Resultado : ', getRound(RoundCounter, item.Round))
                    myRounds[getRound(RoundCounter, item.Round)].seeds[item.Bracket].teams[item.Position].name1 = `${item.WinPlace === 1 ? 'Primero' : 'Segundo'} del grupo: ${item.WinGroup}`;
                });
            }

        } catch (error) {
            console.log('Error : ', error)
        }
        rounds.current = myRounds;

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
        game.Team1 = Team1;
        game.Team2 = Team2;

        if (game.Team1.Winner || game.Team2.Winner) {
            game.Winner = Team1.Winner ? 1 : 2;
        } else {
            game.Winner = 0
        }

        return game
    }

    const CalculateWinners = (groupResults) => {
        let results = [];
        groupResults.forEach(game => {
            if (!results.find((item) => item.TeamID === game.Team1ID)) {
                let myGame = {};
                myGame.TeamID = game.Team1ID;
                myGame.Member1 = (game.Team1Member1.split(' ')[0] + ' ' + game.Team1Member1Lastname).toLowerCase();
                myGame.Member2 = (game.Team1Member2.split(' ')[0] + ' ' + game.Team1Member2Lastname).toLowerCase();
                myGame.GroupID = game.GroupID;
                myGame.GroupName = game.GroupName;
                myGame.GroupNumber = game.GroupNumber;
                results.push(myGame)
            }
            if (!results.find((item) => item.TeamID === game.Team2ID)) {
                let myGame = {};
                myGame.TeamID = game.Team2ID
                myGame.Member1 = (game.Team2Member1.split(' ')[0] + ' ' + game.Team2Member1Lastname).toLowerCase();
                myGame.Member2 = (game.Team2Member2.split(' ')[0] + ' ' + game.Team2Member2Lastname).toLowerCase();
                myGame.GroupID = game.GroupID;
                myGame.GroupName = game.GroupName;
                myGame.GroupNumber = game.GroupNumber;
                results.push(myGame)
            }

        });

        for (let i = 0; i < results.length; i++) {
            let JuegosPlaneados = groupResults.filter((game) => game.Team1ID === results[i].TeamID || game.Team2ID === results[i].TeamID)
            let JuegosGanados = JuegosPlaneados.filter((game) => (game.Team1ID === results[i].TeamID && game.Winner === 1) || (game.Team2ID === results[i].TeamID && game.Winner === 2))
            results[i].PuntosPorSetsGanados = 0;
            results[i].PuntosGanados = 0;
            JuegosPlaneados.forEach((game) => {
                if (results[i].TeamID === game.Team1ID) {
                    results[i].PuntosPorSetsGanados = results[i].PuntosPorSetsGanados + game.Team1.PuntosPorSetsGanados
                    results[i].PuntosGanados = results[i].PuntosGanados + (game.Team1Set1 - game.Team2Set1) + (game.Team1Set2 - game.Team2Set2) + (game.Team1Set3 - game.Team2Set3)
                }
                if (results[i].TeamID === game.Team2ID) {
                    results[i].PuntosPorSetsGanados = results[i].PuntosPorSetsGanados + game.Team2.PuntosPorSetsGanados
                    results[i].PuntosGanados = results[i].PuntosGanados + (game.Team2Set1 - game.Team1Set1) + (game.Team2Set2 - game.Team1Set2) + (game.Team2Set3 - game.Team1Set3)

                }

            })

            results[i].JuegosJugados = JuegosPlaneados.filter((game) => (game.Team1ID === results[i].TeamID || game.Team2ID === results[i].TeamID) && (game.Team1Set1 + game.Team1Set2 + game.Team1Set3 + game.Team2Set1 + game.Team2Set2 + game.Team2Set3) > 0).length;
            results[i].JuegosGanados = JuegosGanados.length;
        }

        //sort results by Juegos Ganados y Puntos Por Set Ganados
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
        setGroupResults(results2);
    }


    const loadData = () => {
        let promises = [];

        promises.push(axios.get(`/v1/catalogs/tournaments/info?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}&GroupCount=${values.GroupCount}`));
        promises.push(axios.get(`/v1/tournament/getroundrobinwinner?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`));
        Promise.all(promises)
            .then((responses) => {
                console.log(responses[0].data);
                let myTournamentInfo = responses[0].data;
                let GamesTeamsByGroup = [];
                if (myTournamentInfo.gamesByGroup && myTournamentInfo.gamesByGroup.length > 0) {
                    GamesTeamsByGroup = myTournamentInfo.gamesByGroup.map((item) => {
                        let teamFound = myTournamentInfo.teamsByGroup.filter((team) => team.GroupNumber === item.GroupNumber);
                        if (teamFound.length > 0) {
                            return { GroupNumber: item.GroupNumber, TeamCount: teamFound[0].TeamCount, GameCount: item.GameCount }
                        } else {
                            return item
                        }
                    })
                }
                let totalGameCount = 0;
                let totalTeamCount = 0;
                if (GamesTeamsByGroup && GamesTeamsByGroup.length > 0) {
                    GamesTeamsByGroup.forEach((item) => {
                        totalGameCount += item.GameCount;
                        totalTeamCount += item.TeamCount
                    });
                }

                myTournamentInfo.GamesTeamsByGroup = GamesTeamsByGroup;
                myTournamentInfo.TotalTeamCount = totalTeamCount;
                myTournamentInfo.TotalGameCount = totalGameCount;

                let GamesByRound = [];
                initialRoundRef.current = 0;
                if (myTournamentInfo.playoffTemplate && myTournamentInfo.gamesByGroup.length > 0) {

                    myTournamentInfo.playoffTemplate.forEach((item) => {
                        initialRoundRef.current = item.Round > initialRoundRef.current ? item.Round : initialRoundRef.current;
                        let gameFound = GamesByRound.findIndex((round) => round.RoundNumber === item.Round && round.Bracket === item.Bracket);
                        if (gameFound > -1) {
                            GamesByRound[gameFound].TeamCount++;
                        } else {
                            GamesByRound.push({ RoundNumber: item.Round, Bracket: item.Bracket, TeamCount: 1 })
                        }
                    });
                }

                let GamesByRoundArray = [];
                let roundCount = initialRoundRef.current;
                let gamesPlayoffCounter = 0;
                while (roundCount > 1) {
                    let gamesByRound = GamesByRound.filter((item) => item.RoundNumber === roundCount).length;
                    gamesByRound = roundCount === initialRoundRef.current ? gamesByRound : roundCount;
                    gamesPlayoffCounter += gamesByRound;
                    console.log('Round : ', roundCount, 'Games : ', gamesByRound);
                    GamesByRoundArray.push({ RoundNumber: roundCount, Games: gamesByRound, RoundID: roundCount === initialRoundRef.current ? 0 : 1 });
                    roundCount = roundCount / 2;
                }
                gamesPlayoffCounter++;
                GamesByRoundArray.push({ RoundNumber: 1, Games: 1, RoundID: roundCount === initialRoundRef.current ? 0 : 1 });
                console.log('Round : ', 1, 'Games : ', 1);
                console.log('Total games for Playoffs : ', gamesPlayoffCounter)
                console.log('Teams ', myTournamentInfo.playoffTemplate && myTournamentInfo.playoffTemplate[0] ? myTournamentInfo.playoffTemplate[0].TeamCount : 0);
                myTournamentInfo.GamesByRound = GamesByRoundArray;
                let TotalPlayoffGames = 0;
                if (GamesByRoundArray && GamesByRoundArray.length > 0) {
                    GamesByRoundArray.forEach((item) => {
                        TotalPlayoffGames += item.Games;
                    });
                }
                myTournamentInfo.TotalPlayoffGames = TotalPlayoffGames;
                setTournamentInfo(myTournamentInfo);

                createRounds(initialRoundRef.current, myTournamentInfo.playoffTemplate);
                playoffTemplateRef.current = myTournamentInfo.playoffTemplate;
                // get listado de partidos+

                if (responses[1].data.data) {
                    let games = responses[1].data.data.map((item) =>
                        gameWinner(item)
                    )

                    CalculateWinners(games);


                    if (responses[1].data.data) {
                        setValues({ ...values, PlayoffSize: responses[1].data.data[0].PlayoffSize, ButtonDisabled: false, PlayoffID: responses[1].data.data[0].ID });
                    } else {
                        setValues({ ...values, ButtonDisabled: true, PlayoffID: 0 });

                    }
                }
            })
            .catch((error) => {
                console.log(error);
                setValues({ ...values, ButtonDisabled: false })
                setProgressBarVisible(false);

            })
    }


    useEffect(() => {
        if (values.TournamentID !== '' && values.CategoryID !== '') {
            loadData();
        }
    }, [values.TournamentID, values.CategoryID])

    const CreateHolders = async () => {
        setValues({ ...values, ButtonDisabled: true })
        setProgressBarVisible(true);
        let payload = {
            TournamentID: values.TournamentID,
            CategoryID: values.CategoryID,
            PlayoffSize: initialRoundRef.current,
        }
        // Borrar playoff
        let myUrlDelete = `/v1/tournament/playoffs?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`;
        const responseDelete = await axios.delete(myUrlDelete);
        let deleteData = responseDelete.data

        // crear nuevo playoff para el torneo y categoria
        let myUrl = '/v1/tournament/playoffs'
        const response = await axios.post(myUrl, payload);
        let myData = response.data


        let gamesToAdd = [];
        let roundCounter = initialRoundRef.current;
        try {

            while (true) {
                let currentRound = playoffTemplateRef.current.filter((item) => item.Round === roundCounter)
                currentRound.forEach((item) => {
                    let gameFound = gamesToAdd.findIndex((newItem) => newItem.Round === item.Round && newItem.Bracket === item.Bracket);
                    if (gameFound === -1) {
                        let gameToAdd = {
                            Round: item.Round,
                            Bracket: item.Bracket,
                        }
                        if (item.Position === 0) {
                            gameToAdd.Team1WinGroup = item.WinGroup;
                            gameToAdd.Team1WinPlace = item.WinPlace;
                        } else if (item.Position === 1) {
                            gameToAdd.Team2WinGroup = item.WinGroup;
                            gameToAdd.Team2WinPlace = item.WinPlace;
                        }
                        gamesToAdd.push(gameToAdd)
                    } else {
                        if (item.Position === 0) {
                            gamesToAdd[gameFound].Team1WinGroup = item.WinGroup;
                            gamesToAdd[gameFound].Team1WinPlace = item.WinPlace;
                        } else if (item.Position === 1) {
                            gamesToAdd[gameFound].Team2WinGroup = item.WinGroup;
                            gamesToAdd[gameFound].Team2WinPlace = item.WinPlace;
                        }
                    }
                })

                if (roundCounter === 1) break;
                roundCounter = roundCounter / 2;
            }
        } catch (error) {
            alert('Error al crear holders');
        }
        // al momento de crear los partidos debemos identificar los que son resultado de una ronda anterior

        let currentRound = initialRoundRef.current;
        while (true) {
            if (currentRound === 1) break;
            currentRound = currentRound / 2;
            let currentRoundGames = playoffTemplateRef.current.filter((item) => item.Round === currentRound)
            for (let i = 0; i < currentRound; i++) {
                const gameFound = gamesToAdd.findIndex((item) => item.Bracket === i && item.Round === currentRound)
                if (gameFound === -1) {

                    gamesToAdd.push({
                        Round: currentRound,
                        Bracket: i,
                        WinGroup: -1,
                        WinPlace: 0
                    })

                }
                console.log('Round : ', currentRound, '    Bracket : ', i);
            }
            if (currentRound === 1) break;
        }

        // borrar holders existentes
        try {
            const response = await axios.delete(`/v1/tournament/deletegamesbygametype?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}&GameType=Holder`)
            const deleteResult = response.data
            console.log('deleteResult', deleteResult)
        } catch (error) {
            alert.error('Error borrando holders...')
            setValues({ ...values, ButtonDisabled: false })
            setProgressBarVisible(false);

        }

        console.log('Juegos a crear', gamesToAdd)
        let myUrlCreate = '/v1/tournament/creategame';
        let gamesAdded = 0
        gamesToAdd.forEach(async element => {
            const payload = {
                "TournamentID": values.TournamentID,
                "CategoryID": values.CategoryID,
                "Team1ID": 0,
                "Team1WinGroup": element.Team1WinGroup,
                "Team1WinPlace": element.Team1WinPlace,
                "Team2ID": 0,
                "Team2WinGroup": element.Team2WinGroup,
                "Team2WinPlace": element.Team2WinPlace,
                "Round": element.Round,
                "Bracket": element.Bracket,
                "Comment": ``,
                "GameType": "Holder"
            }
            try {
                const response = await axios.post(myUrlCreate, payload)
                const myCreateResult = response.data;
                if (myCreateResult.status === "success") gamesAdded++
            } catch (error) {
                alert.error('Error creando partidos tipo holder: ' + error)
            }
        })
        alert.success(`Fueron creados ${gamesToAdd.length} holders`)
        setValues({ ...values, ButtonDisabled: false })
        setProgressBarVisible(false);
    }


    const renderRoundRobinWinners = () => {
        return (
            <Box padding={2}>
                {groupsResults.length > 0 ? (
                    <Grid container spacing={2}>

                        {groupsResults.map((team, index) => (
                            <Grid item xs={12} key={'Cal' + index}>
                                <Paper >
                                    <Box paddingX={2} paddingY={1} >
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
                                            <Grid item xs={3} key={'conta1'}>
                                                <Typography variant={'subtitle2'}>
                                                    {`PJ : ${team.JuegosJugados}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3} key={'conta2'}>
                                                <Typography variant={'subtitle2'}>
                                                    {`PG : ${team.JuegosGanados}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3} key={'conta4'}>
                                                <Typography variant={'subtitle2'}>
                                                    {`PPS : ${team.PuntosPorSetsGanados}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3} key={'conta3'}>
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

    const drawSelectors = () => {
        return (
            <Grid container>
                <Grid item xs={4} display={'flex'} key={'Sele1'}>
                    <SelectTournaments
                        name='TournamentID'
                        value={values.TournamentID}
                        label="Torneo"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item xs={4} display={'flex'} key={'Sele2'}>
                    <SelectCategories
                        name='CategoryID'
                        value={values.CategoryID}
                        label={'Categoria'}
                        handleupdate={handleUpdate} />
                </Grid>

                <Grid item xs={4} display={'flex'} justifyContent={'space-between'} key={'Sele3'}>
                    <TextField
                        name='GroupCount'
                        value={values.GroupCount}
                        onChange={handleUpdate} />
                    <Button onClick={CreateHolders} disabled={values.ButtonDisabled}>Holders</Button>
                    <Button onClick={loadData} disabled={values.ButtonDisabled}>Recargar</Button>
                </Grid>
            </Grid>
        )
    }

    const RenderSeed = (params) => {
        const { seed, title, breakpoint, roundIndex, seedIndex } = params
        const homeTeam = seed.teams[0];
        const awayTeam = seed.teams[1];
        //console.log(seed.type);



        return (
            <Seed mobileBreakpoint={breakpoint} style={{ fontSize: 12, borderRadius: '10px' }}>

                <SeedItem style={{ minWidth: '280px' }}>

                    <SeedTeam
                        style={{
                            backgroundColor: "#ceb8f9", color: 'black', minHeight: '40px', border: '1px solid black'
                        }}
                    >
                        <Grid container >
                            <Grid item xs={11} key={'home' + homeTeam.GameID}>
                                <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} >{homeTeam.name1}</Typography>
                            </Grid>
                            <Grid item xs={1} key={'home1' + homeTeam.GameID}>
                            </Grid>
                            <Grid item xs={11} key={'home2' + homeTeam.GameID}>
                                <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }} >{homeTeam.name2}</Typography>
                            </Grid>
                            <Grid item xs={1} key={'home3' + homeTeam.GameID}>

                            </Grid>
                        </Grid>
                    </SeedTeam>

                    <SeedTeam
                        style={{
                            backgroundColor: "#91f78f", color: 'black', minHeight: '40px', border: '1px solid black'
                        }}
                    >
                        <Grid container >
                            <Grid item xs={11} key={'away' + homeTeam.GameID}>
                                <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }}>{awayTeam.name1}</Typography>
                            </Grid>
                            <Grid item xs={1} key={'away1' + homeTeam.GameID}>
                            </Grid>
                            <Grid item xs={11} key={'away2' + homeTeam.GameID}>
                                <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} style={{ textTransform: 'capitalize', whiteSpace: 'pre' }}>{awayTeam.name2}</Typography>
                            </Grid>
                            <Grid item xs={1} key={'away3' + homeTeam.GameID}>

                            </Grid>
                        </Grid>
                    </SeedTeam>
                </SeedItem>

            </Seed>
        );
    };

    return (
        <MainCard title="Calcula Playoffs"  >

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {drawSelectors()}
                    <Box hidden={!progressBarVisible} sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                </Grid>
                {tournamentInfo.info && (
                    <>
                        <Grid item xs={2} >
                            <Typography variant='h6'>Torneo :</Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <Typography variant='h6'>{tournamentInfo.info.Description}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant='h6'>Categoria :</Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <Typography variant='h6'>{tournamentInfo.info.CategoryDescription}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant='h6'>Parejas inscritas : </Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <Typography variant='h6'>{tournamentInfo.info.TeamCount}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant='h6'>Grupos : </Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <Typography variant='h6'>{tournamentInfo.GamesTeamsByGroup.length}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant='h6'>Eliminatorias : </Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <Typography variant='h6'>{tournamentInfo.TotalPlayoffGames}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Box border={'1px solid black'} textAlign={'center'} paddingLeft={1}>
                                <Grid container paddingY={1} spacing={1}>
                                    <Grid item xs={12} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6' fontSize={14}>Fase de Grupos</Typography>
                                    </Grid>
                                    <Grid item xs={4} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6'>Grupo</Typography>
                                    </Grid>
                                    <Grid item xs={4} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6'>Parejas</Typography>
                                    </Grid><Grid item xs={4} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6'>Partidos</Typography>
                                    </Grid>
                                    {tournamentInfo.GamesTeamsByGroup.map((item, index) => (
                                        <>
                                            <Grid item xs={4} bgcolor={'ger'} key={'GTBG' + index}>
                                                <Typography variant='h6'>{item.GroupNumber}</Typography>
                                            </Grid>
                                            <Grid item xs={4} key={'GTBG2-' + index}>
                                                <Typography variant='h6'>{item.TeamCount}</Typography>
                                            </Grid>
                                            <Grid item xs={4} key={'GTBG3-' + index}>
                                                <Typography variant='h6'>{item.GameCount}</Typography>
                                            </Grid>
                                        </>
                                    ))}
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant='h6'></Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant='h6'>{tournamentInfo.TotalTeamCount}</Typography>
                                    </Grid><Grid item xs={4}>
                                        <Typography variant='h6'>{tournamentInfo.TotalGameCount}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box border={'1px solid black'} textAlign={'center'} paddingLeft={1}>
                                <Grid container paddingY={1} spacing={1}>
                                    <Grid item xs={12} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6' fontSize={14}>Eliminatorias</Typography>
                                    </Grid>
                                    <Grid item xs={6} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6'>Ronda</Typography>
                                    </Grid>
                                    <Grid item xs={6} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6'>Partidos</Typography>
                                    </Grid>
                                    {tournamentInfo.GamesByRound.map((item, index) => (
                                        <>
                                            <Grid item xs={6} bgcolor={'ger'} key={'GBR1-' + index}>
                                                <Typography variant='h6'>{item.RoundNumber}</Typography>
                                            </Grid>
                                            <Grid item xs={6} key={'GBR2-' + index}>
                                                <Typography variant='h6'>{item.Games}</Typography>
                                            </Grid>
                                        </>
                                    ))}
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='h6'></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='h6'>{tournamentInfo.TotalPlayoffGames}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                        </Grid>

                        <Grid item xs={12}>
                            <Box border={'1px solid black'} textAlign={'center'} paddingLeft={1}>
                                <Grid container paddingY={1} spacing={1}>
                                    <Grid item xs={12} bgcolor={'#e6e9ed'}>
                                        <Typography variant='h6' fontSize={14}>Partidos de Eliminatorias</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 180px)', overflow: 'visible', overflowBlock: 'visible' }}>
                                            {renderRoundRobinWinners()}
                                        </PerfectScrollbar>
                                    </Grid>
                                    <Grid item xs={9} bgcolor={'#e6e9ed'}>
                                        <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 180px)', overflow: 'visible', overflowBlock: 'visible' }}>
                                            <Box padding={2}>
                                                {rounds.current.length >= 1 && (

                                                    <Bracket
                                                        rounds={rounds.current}
                                                        renderSeedComponent={RenderSeed}
                                                        swipeableProps={{
                                                            enableMouseEvents: true,
                                                            animateHeight: true,
                                                            index: tabIndex,
                                                            onChangeIndex: handleSwipeChange
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </PerfectScrollbar>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </>
                )}

            </Grid>
        </MainCard>
    )
}

export default CalculaPlayoffs

