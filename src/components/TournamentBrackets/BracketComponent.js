/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, array-callback-return */

import {
  Bracket,
  Seed,
  SeedItem,
  SeedTeam,

} from "react-brackets";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useAlert } from "react-alert";
import { Box, Typography, Grid, Dialog, Switch, Button, IconButton } from "@mui/material";
import axios from "axios";
import CaptureGameResults from "views/gamePlanning/CaptureGameResults";
import UpdateGameResults from "views/gamePlanning/UpdateGameResults";
import { CreateEmptyBrackets } from "./utils";
import { borderRadius } from "@mui/system";
import dayjs from "dayjs";

const BracketComponent = forwardRef((props, ref) => {
  const alert = useAlert();
  const [tabIndex, setTabIndex] = useState(0);

  const [refreshScreen, setRefreshScreen] = useState(0);
  const [captureResultOpen, setCaptureResultOpen] = useState(false);
  const [updateResultOpen, setUpdateResultOpen] = useState(false);
  const [buttonsActive, setButtonsActive] = useState(true);

  var currentRow = useRef({});
  var initialRoundRef = useRef(0);
  var roundsRef = useRef(CreateEmptyBrackets(props.playoffsize))

  const handleTabIndexChange = (index) => () => {
    setTabIndex(index);
  };

  const handleSwipeChange = (index) => {
    setTabIndex(index);
  };

  const draggingOver = (evt) => {
    evt.preventDefault();
  }

  useImperativeHandle(ref, () => {
    return {
      applyResultsToTree,
    }
  })

  const PostTeamPlacement = async (PlacementID, Team1ID, Team2ID, round, bracket, position) => {
    let payload = {
      TournamentID: props.tournamentid,
      CategoryID: props.categoryid,
      PlayoffID: props.playoffid,
      Team1ID: Team1ID,
      Team2ID: Team2ID,
      Round: GetGameRound(round),
      Bracket: bracket,
      Position: position,
      Active: true
    }
    if (PlacementID && PlacementID !== 0) payload.ID = PlacementID;

    let myURL = '/v1/tournament/playoffs/teamplacement'
    try {
      const response = await axios.post(myURL, payload);
      return response.data.data;
    }
    catch (error) {
      alert.error('Error grabando team placement ... ' + error.message)
    }
  }
  // se va a quitar este procedimiento

  const onDrop = async (evt, target, roundIndex, position) => {
    // TODO : no deberia de haber drag and drop, la signacion debe de suceder en el procedimiento de asignar en base a resultados
    const TeamID = parseInt(evt.dataTransfer.getData('TeamID'));
    console.log('Team', TeamID, " en ", target);
    if (roundIndex !== 0) {
      alert.error("Solo se puede asignar pareja en la primer ronda");
      return
    }

    let myRounds = roundsRef.current;
    // Buscar si esta pareja ya fue asignada
    let teamFound = myRounds[0].seeds.find((item) => item.teams[0].TeamID === TeamID || item.teams[1].TeamID === TeamID);
    if (teamFound) {
      alert.error('Equipo ya fue asignado...');
      return
    }
    teamFound = props.getteam(TeamID);
    if (teamFound) {
      myRounds[0].seeds[target].teams[position].TeamID = TeamID;
      myRounds[0].seeds[target].teams[position].name = teamFound.Member1 + ' / ' + teamFound.Member2;
      myRounds[0].seeds[target].teams[position].name1 = teamFound.Member1;
      myRounds[0].seeds[target].teams[position].name2 = teamFound.Member2;
    }

    // Grabar placement
    const PlacementID = myRounds[0].seeds[target].PlacementID ? myRounds[0].seeds[target].PlacementID : 0;
    const Team1ID = myRounds[0].seeds[target].teams[0].TeamID ? myRounds[0].seeds[target].teams[0].TeamID : 0;
    const Team2ID = myRounds[0].seeds[target].teams[1].TeamID ? myRounds[0].seeds[target].teams[1].TeamID : 0;

    const response = await PostTeamPlacement(PlacementID, Team1ID, Team2ID, 0, target, position);
    if (response.ID && response.ID !== 0) myRounds[0].seeds[target].PlacementID = response.ID;
    roundsRef.current = myRounds;
    setRefreshScreen((prev) => prev + 1);
  }


  const MoveToNextRound = async (seed, roundIndex, seedIndex) => {
    props.linearprogressbar(true);
    let newRoundIndex = roundIndex + 1;
    let newSeedIndex = 0;
    let newTeamIndex = seedIndex % 2;
    if (seedIndex === 0 || seedIndex === 1) newSeedIndex = 0;
    if (seedIndex === 2 || seedIndex === 3) newSeedIndex = 1;
    if (seedIndex === 4 || seedIndex === 5) newSeedIndex = 2;
    if (seedIndex === 6 || seedIndex === 7) newSeedIndex = 3;
    if (seedIndex === 8 || seedIndex === 9) newSeedIndex = 4;
    if (seedIndex === 10 || seedIndex === 11) newSeedIndex = 5;
    if (seedIndex === 12 || seedIndex === 13) newSeedIndex = 6;
    if (seedIndex === 14 || seedIndex === 15) newSeedIndex = 7;
    if (seedIndex === 16 || seedIndex === 17) newSeedIndex = 8;


    let myRounds = roundsRef.current;
    let teamFound = props.getteam(seed.teams[seed.Winner - 1].TeamID);
    if (teamFound) {
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].TeamID = teamFound.TeamID;
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].name = teamFound.Member1 + ' / ' + teamFound.Member2;
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].name1 = teamFound.Member1;
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].name2 = teamFound.Member2;

      let Team1ID = 0;
      let Team2ID = 0;

      Team1ID = myRounds[newRoundIndex].seeds[newSeedIndex].teams[0].TeamID
      Team2ID = myRounds[newRoundIndex].seeds[newSeedIndex].teams[1].TeamID

      await PostNewGame(Team1ID, Team2ID, newRoundIndex, newSeedIndex);

      roundsRef.current = myRounds;
      setRefreshScreen((prev) => prev + 1);
      loadGames();
      props.linearprogressbar(false);
    }
  }


  const MoveToNextRoundByDefault = (seed, roundIndex, seedIndex, teamIndex) => {

    let Team1ID = seed.teams[0].TeamID ? seed.teams[0].TeamID : 0;
    let Team2ID = seed.teams[1].TeamID ? seed.teams[1].TeamID : 0;
    PostNewGameBye(Team1ID, Team2ID, roundIndex, seedIndex, 0, 0)

    const newRoundIndex = roundIndex + 1;
    let newSeedIndex = 0;
    let newTeamIndex = seedIndex % 2;
    if (seedIndex === 0 || seedIndex === 1) newSeedIndex = 0;
    if (seedIndex === 2 || seedIndex === 3) newSeedIndex = 1;
    if (seedIndex === 4 || seedIndex === 5) newSeedIndex = 2;
    if (seedIndex === 6 || seedIndex === 7) newSeedIndex = 3;
    if (seedIndex === 8 || seedIndex === 9) newSeedIndex = 4;
    if (seedIndex === 10 || seedIndex === 11) newSeedIndex = 5;
    if (seedIndex === 12 || seedIndex === 13) newSeedIndex = 6;
    if (seedIndex === 14 || seedIndex === 15) newSeedIndex = 7;
    if (seedIndex === 16 || seedIndex === 17) newSeedIndex = 8;

    let myRounds = roundsRef.current;
    let teamFound = props.getteam(seed.teams[teamIndex].TeamID);
    if (teamFound) {
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].TeamID = seed.teams[teamIndex].TeamID;
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].name = teamFound.Member1 + ' / ' + teamFound.Member2;
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].name1 = teamFound.Member1;
      myRounds[newRoundIndex].seeds[newSeedIndex].teams[newTeamIndex].name2 = teamFound.Member2;
    }


  }

  const RemoveTeamFromBracket = async (TeamID, roundIndex, seedIndex) => {
    if (roundsRef.current[roundIndex].seeds[seedIndex].GameResultsID && roundsRef.current[roundIndex].seeds[seedIndex].GameResultsID !== 0) {
      alert.error('El partido ya ha sido jugado, no se puede eliminar la pareja')
      return
    }
    let myRounds = roundsRef.current;
    if (myRounds[roundIndex].seeds[seedIndex].teams[0].TeamID === TeamID) {
      delete myRounds[roundIndex].seeds[seedIndex].teams[0].TeamID
      delete myRounds[roundIndex].seeds[seedIndex].teams[0].name1
      delete myRounds[roundIndex].seeds[seedIndex].teams[0].name2
      myRounds[roundIndex].seeds[seedIndex].teams[0].name = '---'
    }
    if (myRounds[roundIndex].seeds[seedIndex].teams[1].TeamID === TeamID) {
      delete myRounds[roundIndex].seeds[seedIndex].teams[1].TeamID
      delete myRounds[roundIndex].seeds[seedIndex].teams[1].name1
      delete myRounds[roundIndex].seeds[seedIndex].teams[1].name2
      myRounds[roundIndex].seeds[seedIndex].teams[1].name = '---'
    }

    let Team1ID = myRounds[roundIndex].seeds[seedIndex].teams[0].TeamID ? myRounds[roundIndex].seeds[seedIndex].teams[0].TeamID : 0;
    let Team2ID = myRounds[roundIndex].seeds[seedIndex].teams[1].TeamID ? myRounds[roundIndex].seeds[seedIndex].teams[1].TeamID : 0;
    let PlacementID = myRounds[roundIndex].seeds[seedIndex].PlacementID;
    // quitar placement si existe

    if (Team1ID === 0 && Team2ID === 0) {
      delete myRounds[roundIndex].seeds[seedIndex].PlacementID;
    }

    const response = await PostTeamPlacement(PlacementID, Team1ID, Team2ID, roundIndex, seedIndex);
    if (response.ID && response.ID !== 0) alert.success("Posicionamiento actualizado ...");

    roundsRef.current = myRounds;
    setRefreshScreen((prev) => prev + 1);

  }

  const PostNewGame = async (TeamID1, TeamID2, roundIndex, seedIndex, team, GroupID) => {
    setButtonsActive(false);
    const payload = {
      "TournamentID": props.tournamentid,
      "CategoryID": props.categoryid,
      "Team1ID": TeamID1,
      "Team2ID": TeamID2,
      "PlayoffID": props.playoffid,
      "Round": GetGameRound(roundIndex),
      "Bracket": seedIndex,
      "GameType": "PlayOffs",
      "Team1WinGroup": roundsRef.current[roundIndex].seeds[seedIndex].teams[0].WinGroup,
      "Team1WinPlace": roundsRef.current[roundIndex].seeds[seedIndex].teams[0].WinPlace,
      "Team2WinGroup": roundsRef.current[roundIndex].seeds[seedIndex].teams[1].WinGroup,
      "Team2WinPlace": roundsRef.current[roundIndex].seeds[seedIndex].teams[1].WinPlace,
    }


    // crear nuevo playoff para el torneo y categoria
    let myUrl = '/v1/tournament/playoffs'
    const response = await axios.post(myUrl, payload);
    let myData = response.data

    try {
      const response = await axios.post('/v1/tournament/creategame', payload)
      /*   let myRounds = roundsRef.current;
        myRounds[roundIndex].seeds[seedIndex].GameID = response.data.data.ID
        myRounds[roundIndex].seeds[seedIndex].GameType = 'PlayOffs'
  
        alert.success("El partido ha sido creado...")
        roundsRef.current = myRounds; 
        setButtonsActive(true)*/
    } catch (error) {
      alert.error('Error creando partido: ' + error.message)
      setButtonsActive(true)

    }
  }

  const PostNewGameBye = (TeamID1, TeamID2, roundIndex, seedIndex, team, GroupID) => {
    const payload = {
      "TournamentID": props.tournamentid,
      "CategoryID": props.categoryid,
      "Team1ID": TeamID1,
      "Team2ID": TeamID2,
      "PlayoffID": props.playoffid,
      "Round": GetGameRound(roundIndex),
      "Bracket": seedIndex,
      "GameType": "PlayOffs"
    }

    axios.post('/v1/tournament/creategamebye', payload)
      .then((response) => {
        let myRounds = roundsRef.current;
        myRounds[roundIndex].seeds[seedIndex].GameID = response.data.data.ID
        alert.success("El partido ha sido creado...")
        loadGames();
        roundsRef.current = myRounds;
        setRefreshScreen((prev) => prev + 1);
      })
      .catch((error) => {
        alert.error('Error creando partido: ' + error.message)
      })
  }



  const getRound = (CurrentRound) => {
    switch (initialRoundRef.current) {
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

  const GetGameRound = (CurrentRound) => {
    switch (initialRoundRef.current) {
      case 16:
        switch (CurrentRound) {
          case 0:
            return 16
          case 1:
            return 8
          case 2:
            return 4
          case 3:
            return 2
          case 4:
            return 1
          default:
            break;
        }
        break;
      case 8:
        switch (CurrentRound) {
          case 0:
            return 8
          case 1:
            return 4
          case 2:
            return 2
          case 3:
            return 1
          default:
            break;
        }
        break;
      case 4:
        switch (CurrentRound) {
          case 0:
            return 4
          case 1:
            return 2
          case 2:
            return 1
          default:
            break;
        }
        break;
      case 2:
        switch (CurrentRound) {
          case 0:
            return 2
          case 1:
            return 1
          default:
            break;
        }
        break;
      case 1:
        switch (CurrentRound) {
          case 0:
            return 1
          default:
            break;
        }
        break;
      default:
        break;
    }
  }



  const loadGames = () => {
    let myURL = '/v1/tournament/listgames?TournamentID=' + props.tournamentid
      + '&CategoryID=' + props.categoryid
      + '&GameType=Holder,PlayOffs'
    //  + '&PlayoffID=' + props.playoffid
    let myPromises = [];
    myPromises.push(axios.get(myURL));

    initialRoundRef.current = 0;
    Promise.all(myPromises)
      .then((responses) => {

        initialRoundRef.current = props.playoffsize


        let myRounds = CreateEmptyBrackets(props.playoffsize);
        if (responses[0].data.data && responses[0].data.data.length > 0) {
          responses[0].data.data.map((item) => {
            const myRound = getRound(item.Round);
            myRounds[myRound].seeds[item.Bracket].GameID = item.GameID;
            myRounds[myRound].seeds[item.Bracket].GameResultsID = item.GameResultsID;
            myRounds[myRound].seeds[item.Bracket].Winner = item.Winner;
            myRounds[myRound].seeds[item.Bracket].GroupNumber = item.GroupNumber;
            myRounds[myRound].seeds[item.Bracket].GameType = item.GameType;
            myRounds[myRound].seeds[item.Bracket].StartTime = item.StartTime;


            myRounds[myRound].seeds[item.Bracket].Team1Set1 = item.Team1Set1
            myRounds[myRound].seeds[item.Bracket].Team1Set2 = item.Team1Set2
            myRounds[myRound].seeds[item.Bracket].Team1Set3 = item.Team1Set3
            myRounds[myRound].seeds[item.Bracket].Team2Set1 = item.Team2Set1
            myRounds[myRound].seeds[item.Bracket].Team2Set2 = item.Team2Set2
            myRounds[myRound].seeds[item.Bracket].Team2Set3 = item.Team2Set3

            myRounds[myRound].seeds[item.Bracket].teams[0].TeamID = item.Team1ID;
            myRounds[myRound].seeds[item.Bracket].teams[0].name1 = (item.Team1Name1.split(' ')[0] + ' ' + item.Team1FirstLastName1).toLowerCase();
            myRounds[myRound].seeds[item.Bracket].teams[0].name2 = (item.Team1Name2.split(' ')[0] + ' ' + item.Team1FirstLastName2).toLowerCase();
            myRounds[myRound].seeds[item.Bracket].teams[0].WinGroup = item.Team1WinGroup;
            myRounds[myRound].seeds[item.Bracket].teams[0].WinPlace = item.Team1WinPlace;

            myRounds[myRound].seeds[item.Bracket].teams[1].TeamID = item.Team2ID;
            myRounds[myRound].seeds[item.Bracket].teams[1].name1 = (item.Team2Name1.split(' ')[0] + ' ' + item.Team2FirstLastName1).toLowerCase();
            myRounds[myRound].seeds[item.Bracket].teams[1].name2 = (item.Team2Name2.split(' ')[0] + ' ' + item.Team2FirstLastName2).toLowerCase();
            myRounds[myRound].seeds[item.Bracket].teams[1].WinGroup = item.Team2WinGroup;
            myRounds[myRound].seeds[item.Bracket].teams[1].WinPlace = item.Team2WinPlace;
          })
          roundsRef.current = myRounds;
          setRefreshScreen((prev) => prev + 1);
        }



      })
      .catch((error) => {
        setRefreshScreen((prev) => prev + 1);
        alert.error('Error cargando partidos: ' + error.message)
      })
  }

  const handleClose = () => {
    setCaptureResultOpen(false);
    setUpdateResultOpen(false);
  }

  const getData = () => {
    loadGames();
  }


  const CaptureResultOpen = (seed) => {
    let row = {
      ID: seed.GameID,
      Team1: [
        { Name: seed.teams[0].name1 },
        { Name: seed.teams[0].name2 }
      ],
      Team2: [
        { Name: seed.teams[1].name1 },
        { Name: seed.teams[1].name2 }
      ],
    }
    currentRow.current = row;
    setCaptureResultOpen(true);
  }

  const UpdateResultOpen = (seed) => {
    let row = {
      GameID: seed.GameID,
      GameResultsID: seed.GameResultsID,

      Team1: [
        { Name: seed.teams[0].name1 },
        { Name: seed.teams[0].name2 }
      ],
      Team2: [
        { Name: seed.teams[1].name1 },
        { Name: seed.teams[1].name2 }
      ],
      Team1Set1: seed.Team1Set1,
      Team1Set2: seed.Team1Set2,
      Team1Set3: seed.Team1Set3,
      Team2Set1: seed.Team2Set1,
      Team2Set2: seed.Team2Set2,
      Team2Set3: seed.Team2Set3,
    }
    currentRow.current = row;
    setUpdateResultOpen(true);
  }


  const CustomSeed = (params) => {
    const { seed, title, breakpoint, roundIndex, seedIndex } = params

    // myRounds[getRound(item.Round)].seeds[item.Bracket].teams[1]
    const homeTeam = roundsRef.current[roundIndex].seeds[seedIndex].teams[0];
    const awayTeam = roundsRef.current[roundIndex].seeds[seedIndex].teams[1];

    const DisplayBracketState = (seed) => {
      if (seed.GameResultsID && seed.GameResultsID !== 0) { // 
        return (
          <Button onClick={() => UpdateResultOpen(seed)} >
            {`${seed.Team1Set1}/${seed.Team2Set1}  ${seed.Team1Set2}/${seed.Team2Set2}  ${seed.Team1Set3}/${seed.Team2Set3}`} E
          </Button>
        )
      }
      if (seed.GameID && seed.GameID !== 0) {
        return (
          <Button onClick={() => CaptureResultOpen(seed)} >Resultados</Button>
        )
      }
      if (seed.teams[0].TeamID && seed.teams[0].TeamID !== 0 && seed.teams[1].TeamID && seed.teams[1].TeamID !== 0) {
        return (
          <Button onClick={() => PostNewGame(homeTeam.TeamID, awayTeam.TeamID, roundIndex, seedIndex)} size="small" disabled={!buttonsActive}>Crear Partido</Button>
        )
      }
      return (
        <></>
/*         <Typography variant={'caption'} component={'div'} fontSize={12} color={'darkblue'} >
          Agregar Parejas
        </Typography>
 */
      )

    }


    const DisplayActionButton = (TeamNum) => {
      if (TeamNum === 1) {
        if (seed.teams[0].TeamID && seed.teams[0].TeamID !== 0 && seed.Winner && seed.Winner === 1) {
          return (
            <Button onClick={() => MoveToNextRound(seed, roundIndex, seedIndex)}>G</Button>
          )
        }
        if (homeTeam.TeamID && homeTeam.TeamID !== 0 && !awayTeam.TeamID) {
          return (
            <Typography color={'darkblue'} onClick={() => MoveToNextRoundByDefault(seed, roundIndex, seedIndex, 0)}>{'>>'}</Typography>
          )
        }

      } else if (TeamNum === 2) {
        if (awayTeam.TeamID && awayTeam.TeamID !== 0 && seed.Winner && seed.Winner === 2) {
          return (
            <IconButton color={'darkblue'} size={'small'} onClick={() => MoveToNextRound(seed, roundIndex, seedIndex)}>G</IconButton>
          )
        }
        if (awayTeam.TeamID && awayTeam.TeamID !== 0 && !homeTeam.TeamID) {
          return (
            <Typography color={'darkblue'} onClick={() => MoveToNextRoundByDefault(seed, roundIndex, seedIndex, 0)}>{'>>'}</Typography>
          )
        }
      }
    }

    const DisplayActionButton2 = (TeamNum) => {
      if (TeamNum === 1) {
        if (homeTeam.TeamID && homeTeam.TeamID !== 0 && !seed.GameID) {
          return (<Typography color={'red'} onClick={() => RemoveTeamFromBracket(homeTeam.TeamID, roundIndex, seedIndex)}>X</Typography>)
        }
      } else if (TeamNum === 2) {
        if (awayTeam.TeamID && awayTeam.TeamID !== 0 && !seed.GameID) {
          return (<Typography color={'red'} onClick={() => RemoveTeamFromBracket(awayTeam.TeamID, roundIndex, seedIndex)} >X</Typography>)

        }
      }
    }

    const renderSeedDescription = (element) => {
      if (!seed.teams[element].WinGroup) {
        if (roundIndex === 0) {
          return 'Sin definir'
        } else {
          return 'Esperando pareja, ronda anterior'
        }
      } else {
        if (seed.teams[element].TeamID !== 0) return 'encontraro1'

        return `${seed.teams[element].WinPlace === 1 ? 'Primero' : 'Segundo'} del grupo : ${seed.teams[element].WinGroup} `
      }
    }


    if (!seed.GameType || seed.GameType === 'Holder') {
      return (
        <Seed mobileBreakpoint={breakpoint} style={{ fontSize: 12, borderRadius: '10px' }}>

          {seed.StartTime && seed.StartTime !== '0001-01-01T00:00:00Z' && dayjs(seed.StartTime).isValid() ? dayjs(seed.StartTime).format('DD/MM HH:mm') : 'N/D'}
          <SeedItem style={{ minWidth: '280px' }}>
            <SeedTeam
              style={{
                backgroundColor: "#dbe9fc", color: 'black', minHeight: '50px', border: '1px solid black'
              }}
            >
              <Grid container >
                <Grid item xs={11}>
                  <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} textTransform={'capitalize'}>
                    {renderSeedDescription(0)}
                  </Typography>
                </Grid>
                <Grid item xs={1} >
                  {DisplayActionButton(1)}
                </Grid>

              </Grid>
            </SeedTeam>
            <SeedTeam
              style={{
                backgroundColor: "#fcf9db", color: 'black', minHeight: '50px', border: '1px solid black'
              }}
            >
              <Grid container >
                <Grid item xs={11}>
                  <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} textTransform={'capitalize'}>
                    {renderSeedDescription(1)}
                  </Typography>
                </Grid>
                <Grid item xs={1} >
                  {DisplayActionButton(2)}
                </Grid>

              </Grid>
            </SeedTeam>
          </SeedItem>
          <div>
            {DisplayBracketState(seed)}
          </div>
        </Seed>
      );

    } if ((seed.GameType === 'PlayOffs')) {
      return (
        <Seed mobileBreakpoint={breakpoint} style={{ fontSize: 12, borderRadius: '10px' }}>
          {seed.StartTime && seed.StartTime !== '0001-01-01T00:00:00Z' && dayjs(seed.StartTime).isValid() ? dayjs(seed.StartTime).format('DD/MM HH:mm') : 'N/D'}

          <SeedItem style={{ minWidth: '280px' }}>
            <div droppable="true"
              onDragOver={(evt => draggingOver(evt))}
              onDrop={(evt => onDrop(evt, seedIndex, roundIndex, 0))}
            >
              <SeedTeam
                style={{
                  backgroundColor: "#ceb8f9", minHeight: '50px', border: '1px solid black',
                }}
              >

                <Box display={'flex'} flexDirection={'row'} flex={1}>
                  <Box flexGrow={9} flexDirection={'column'}>
                    <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} textTransform={'capitalize'}>{homeTeam.name1}</Typography>
                    <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} textTransform={'capitalize'}>{homeTeam.name2}</Typography>
                  </Box>
                  <Box display={'flex'} flexGrow={1} alignItems={'center'}>
                    {DisplayActionButton(1)}
                    {DisplayActionButton2(1)}
                  </Box>
                </Box>

              </SeedTeam>
            </div>
            <div droppable="true"
              onDragOver={(evt => draggingOver(evt))}
              onDrop={(evt => onDrop(evt, seedIndex, roundIndex, 1))}
            >
              <SeedTeam
                style={{
                  backgroundColor: "#91f78f", color: 'black', minHeight: '50px', border: '1px solid black'
                }}
              >
                <Box display={'flex'} flexDirection={'row'} flex={1}>
                  <Box flexGrow={9} flexDirection={'column'}>
                    <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} textTransform={'capitalize'}>{awayTeam.name1}</Typography>
                    <Typography variant={'caption'} component={'div'} fontSize={11} color={'black'} textTransform={'capitalize'}>{awayTeam.name2}</Typography>
                  </Box>
                  <Box display={'flex'} flexGrow={1} alignItems={'center'}>
                    {DisplayActionButton(2)}
                    {DisplayActionButton2(2)}
                  </Box>
                </Box>
              </SeedTeam>
            </div>
          </SeedItem>
          <div>
            {DisplayBracketState(seed)}
          </div>
        </Seed>
      );
    }


  };

  useEffect(() => {
    if (props.tournamentid && props.tournamentid !== 0 && props.categoryid && props.categoryid !== 0) {
      loadGames();
    }

  }, [props.tournamentid, props.categoryid, props.playoffsize])

  /*  useEffect(() => {
     roundsRef.current = CreateEmptyBrackets(props.playoffsize);
   }, [props.playoffsize])
  */
  const renderNavigationButtons = () => {

    switch (initialRoundRef.current) {
      case 16:
        return (
          <div >
            <button onClick={handleTabIndexChange(0)}>16avos</button>
            <button onClick={handleTabIndexChange(1)}>Octavos</button>
            <button onClick={handleTabIndexChange(2)}>Cuartos</button>
            <button onClick={handleTabIndexChange(3)}>Semifinales</button>
            <button onClick={handleTabIndexChange(4)}>Final</button>
          </div>

        )
      case 8:
        return (
          <div >
            <button onClick={handleTabIndexChange(0)}>Octavos</button>
            <button onClick={handleTabIndexChange(1)}>Cuartos</button>
            <button onClick={handleTabIndexChange(2)}>Semifinales</button>
            <button onClick={handleTabIndexChange(3)}>Final</button>
          </div>

        )
      case 4:
        return (
          <div >
            <button onClick={handleTabIndexChange(0)}>Cuartos</button>
            <button onClick={handleTabIndexChange(1)}>Semifinales</button>
            <button onClick={handleTabIndexChange(2)}>Final</button>
          </div>

        )
      case 2:
        return (
          <div >
            <button onClick={handleTabIndexChange(0)}>Semifinales</button>
            <button onClick={handleTabIndexChange(1)}>Final</button>
          </div>

        )
      case 1:
        return (
          <div >
            <button onClick={handleTabIndexChange(0)}>Final</button>
          </div>

        )
      default:
        break;
    }
  }


//TODO : revisando esto para que funcione con los resultados del torneo
  const applyResultsToTree = async () => {
    if (initialRoundRef.current === 0) return

    let myRounds = roundsRef.current;
    let currentRound = initialRoundRef.current
    props.linearprogressbar(true);
    while (true) {

      let myRound = getRound(currentRound)
      for (let i = 0; i < currentRound; i++) {
        const WinGroupTeam1 = myRounds[myRound].seeds[i].teams[0].WinGroup;
        const WinPlaceTeam1 = myRounds[myRound].seeds[i].teams[0].WinPlace;
        const WinGroupTeam2 = myRounds[myRound].seeds[i].teams[1].WinGroup;
        const WinPlaceTeam2 = myRounds[myRound].seeds[i].teams[1].WinPlace;

        const team1 = props.getteambyresult(WinGroupTeam1, WinPlaceTeam1);
        const team2 = props.getteambyresult(WinGroupTeam2, WinPlaceTeam2);

        const Team1ID = team1 && team1.TeamID ? team1.TeamID : 0;
        const Team2ID = team2 && team2.TeamID ? team2.TeamID : 0;


        
        if ((Team1ID !== 0) || Team2ID !== 0) {
          await PostNewGame(Team1ID, Team2ID, getRound(currentRound), i)
          console.log('Team1 : ', Team1ID, '    Team2 : ', Team2ID)
        }

      };
      currentRound = currentRound / 2;
      if (currentRound < 1) {
        loadGames();
        props.linearprogressbar(false);

        alert.info('Partidos actualizados con resultados')
        break;
      }
    }

  }

  return (
    <Box id='PrintableArea2' >
 {/*      {renderNavigationButtons()}
 */}      {roundsRef.current && roundsRef.current.length > 0 && (

        <Bracket
          rounds={roundsRef.current}
          renderSeedComponent={CustomSeed}
          swipeableProps={{
            enableMouseEvents: true,
            animateHeight: true,
            index: tabIndex,
            onChangeIndex: handleSwipeChange
          }}
        />
      )}
      <Dialog open={captureResultOpen} onClose={handleClose} size={'lg'}>
        <CaptureGameResults game={currentRow.current} handleclose={handleClose} getdata={getData} />
      </Dialog>
      <Dialog open={updateResultOpen} onClose={handleClose} size={'lg'}>
        <UpdateGameResults game={currentRow.current} handleclose={handleClose} getdata={getData} />
      </Dialog>
    </Box>
  );
})

export default BracketComponent;