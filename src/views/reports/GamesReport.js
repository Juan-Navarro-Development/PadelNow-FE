/* eslint-disable  react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from "react";
import "jspdf-autotable";
import axios from "axios";
import DataTable from "react-data-table-component";
import dayjs from "dayjs";
import { Dialog, Grid, IconButton, Tooltip } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import SelectTournaments from "components/SelectTournament";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SelectConsecutiveDays from "components/SelectConsecutiveDays";
import { LocalizationProvider } from "@mui/x-date-pickers";
import LoadGameList from "components/LoadGameList";
import AssignCourt from "./AssignCourt";
import StartGame from "./StartGame";


const GamesReport = (props) => {

  const [refreshScreen, setRefreshScreen] = useState(0);
  const [values, setValues] = useState({
    TournamentID: '',
    FilterDate: '',
  })
  const [isAssignCourtOpen, setIsAssingCourtOpen] = useState(false)
  const [isGameStartOpen, setIsGameStartOpen] = useState(false)

  let gamesRef = useRef([]);
  let kitsRef = useRef([]);
  let tournamentRef = useRef({});
  let currentRowRef = useRef({});
  let FilterDateRef = useRef('');

  const columns = [
    {
      name: 'Pareja 1',
      selector: row => <>
        <div>{row.Team1Name1} </div>
        <div>{row.Team1Name2}</div>
      </>,
      maxWidth: '200px'

    },
    {
      name: 'Asist.',
      selector: row => attendanceRender(row, 1),
      maxWidth: '25px'
    },
    {
      name: 'Kit',
      selector: row => renderKitDelivery(row, 1),
      maxWidth: '25px'
    },
    {
      name: 'Pareja 2',
      selector: row => <>
        <div>{row.Team2Name1} </div>
        <div>{row.Team2Name2}</div>
      </>,
      maxWidth: '200px'

    },
    {
      name: 'Asist.',
      selector: row => attendanceRender(row, 2),
      maxWidth: '25px'
    },
    {
      name: 'Kit',
      selector: row => renderKitDelivery(row, 2),
      maxWidth: '25px'
    },
    {
      name: 'Categoria',
      selector: row => row.CategoryDescription,
      maxWidth: '25px'
    },
    {
      name: 'Fecha',
      selector: row => dayjs(row.StartTime).format('DD-MM HH:mm') === '31-12 17:23' ? 'N/D' : dayjs(row.StartTime).format('DD-MM HH:mm'),
      maxWidth: '110px'
    }, {
      name: 'Estatus',
      selector: row => gameState(row),
      /* conditionalCellStyles: [
        {
          when: row => gameState(row) === 'Creado',
          style: {
            backgroundColor: 'rgba(36, 249, 32, 0.9)',
            color: 'black',
          },
        },
      ], */
      maxWidth: '60px',
    },
    {
      name: 'C',
      selector: row => row.CourtAssigned,
      maxWidth: '12px'
    },
    {
      name: 'Acciones',
      selector: row => <>
        <Tooltip title="Asignar Cancha">
          <IconButton variant={'text'} onClick={() => assignCourtOpen(row)} color="success">C</IconButton>
        </Tooltip>
        <Tooltip title="Iniciar Juego">
          <IconButton variant={'text'} onClick={() => startGameOpen(row)} color="primary">I</IconButton>
        </Tooltip>
      </>,
      maxWidth: '45px'
    },
  ]



  const assignCourtOpen = (row) => {
    currentRowRef.current = row;

    setIsAssingCourtOpen(true)
  }
  const startGameOpen = (row) => {
    currentRowRef.current = row;
    setIsGameStartOpen(true)
  }

  const attendanceRender = (row, teamNumber) => {
    let assistance1 = dayjs(row[`AttendanceDateT${teamNumber}u1`]).format('DD-MM HH:mm') === '31-12 17:23' ? 'No' : 'Si'
    let assistance2 = dayjs(row[`AttendanceDateT${teamNumber}u2`]).format('DD-MM HH:mm') === '31-12 17:23' ? 'No' : 'Si'
    return `${assistance1} / ${assistance2}`
  }


  const gameState = (row) => {

    if (row.GameResultsID && row.GameResultsID !== 0) { // juego terminado
      return 'Terminado'
    }
    if (row.GameStarted && row.GameStarted !== "1900-01-01T07:36:36Z") { // juego iniciado// // 
      return 'En curso'
    }
    if (row.CourtAssigned && row.CourtAssigned !== '') { // Se le asigno cancha
      return 'Cancha asignada'
    }
    if (row.AttendanceDateT1u1 !== '0001-01-01T00:00:00Z'
      && row.AttendanceDateT1u2 !== '0001-01-01T00:00:00Z'
      && row.AttendanceDateT2u1 !== '0001-01-01T00:00:00Z'
      && row.AttendanceDateT2u2 !== '0001-01-01T00:00:00Z'
    ) { // ya llegaron todos
      return 'Completo'
    }

    if (row.TournamentTimeSlotsID !== 0) { // Partido calendarizado
      return 'Calendarizado'
    }
    return 'Creado'
  }


  const handleUpdate = (e) => {
    // setHasChanges(true);
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    if (name === 'TournamentID') {
      getData(value, values.FilterDate);
    }
    if (name === 'FilterDate' && values.TournamentID !== '') {
      FilterDateRef.current = value;
      getData(values.TournamentID);
    }
  }

  const renderKitDelivery = (row, teamNumber) => {
    const deliveredUser1 = kitsRef.current.findIndex((item) => row[`Team${teamNumber}Member1ID`] === item.UserID)
    const deliveredUser2 = kitsRef.current.findIndex((item) => row[`Team${teamNumber}Member2ID`] === item.UserID)
    const du1 = deliveredUser1 !== -1 ? 'Si' : 'No';
    const du2 = deliveredUser2 !== -1 ? 'Si' : 'No';
    return du1 + ' / ' + du2
  }


  const getData = async (TournamentID) => {
    if (!TournamentID) {
      return
    }

    let myPromises = [
      axios.get(`/v1/tournament/kit?TournamentID=${TournamentID}`),
      axios.get(`/v1/catalogs/tournament?TournamentID=${TournamentID}`)
    ]
    let myGames = await LoadGameList({ TournamentID: TournamentID, GameType: 'Roundrobin,holder,PlayOffs' });

    Promise.all(myPromises)
      .then((responses) => {

        if (myGames && myGames.length > 0) {
          let myFilteredGames = [];
          if (FilterDateRef.current && FilterDateRef.current.length > 0) {
            myFilteredGames = myGames.filter((item) => {
              let startTime = dayjs(item.StartTime).format('YYYY-MM-DD')
              return startTime === FilterDateRef.current || startTime === "0001-01-01T00:00:00Z"
            })
            myGames = myFilteredGames;
          }
          myGames = myGames.sort((a, b) => {
            return a.StartTime < b.StartTime ? -1 : 1;
          })

          gamesRef.current = myGames
        } else {
          gamesRef.current = [];
        }

        if (responses[0].data && responses[1].data.data && responses[0].data.data.length > 0) {
          kitsRef.current = responses[0].data.data
        } else {
          kitsRef.current = [];
        }

        if (responses[1].data && responses[1].data.data) {
          tournamentRef.current = responses[1].data.data
        }
        setRefreshScreen(refreshScreen + 1)
      })
      .catch((error) => {
        console.log('Error : ', error)
      })
  }

  useEffect(() => {
    getData();
  }, [])



  const renderSelectors = () => {
    return (

      <Grid container spacing={2}>
        <Grid item xs={3}>
          <SelectTournaments
            name='TournamentID'
            value={values.TournamentID}
            label="Torneos"
            handleupdate={handleUpdate} />


        </Grid>
        <Grid item xs={3}>
          <SelectConsecutiveDays
            handleupdate={handleUpdate}
            name={'FilterDate'}
            value={values.FilterDate}
            startdate={tournamentRef.current.StartDate}
            enddate={tournamentRef.current.EndDate} />
        </Grid>
      </Grid>
    )
  }

  const handleClose = () => {
    setIsAssingCourtOpen(false);
    setIsGameStartOpen(false);
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

      <MainCard title='Listado de partidos'>
        {renderSelectors()}
        <DataTable
          columns={columns}
          data={gamesRef.current}
          highlightOnHover
          fixedHeader
        />
      </MainCard>


      <Dialog open={isAssignCourtOpen} onClose={handleClose} size={'lg'}>
        <AssignCourt
          game={currentRowRef.current}
          handleclose={handleClose}
          tournamentid={values.TournamentID}
          tournament={tournamentRef.current}
          loaddata={getData}
        />
      </Dialog>
      <Dialog open={isGameStartOpen} onClose={handleClose} size={'lg'}>
        <StartGame
          game={currentRowRef.current}
          handleclose={handleClose}
          tournamentid={values.TournamentID}
          tournament={tournamentRef.current}
          loaddata={getData}
        />
      </Dialog>
    </LocalizationProvider>

  )
};

export default GamesReport;
