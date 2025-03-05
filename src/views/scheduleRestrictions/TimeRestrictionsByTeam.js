/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import {  Grid, Paper, Box, Typography, Divider, Button } from '@mui/material'
import {  LocalizationProvider } from '@mui/x-date-pickers'
import React, { useState, useEffect, useRef } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import SelectTournaments from 'components/SelectTournament';
import SelectUsers from 'components/SelectUsers';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useAlert } from 'react-alert';
import SelectConsecutiveDays from 'components/SelectConsecutiveDays';



const TimeRestrictionsByTeam = () => {
  const navigate = useNavigate();
  const alert = useAlert();

  const [values, setValues] = useState(
    {
      TournamentID: '',
      User: {label: '', id: ''},
      FilterDate: '',
    })
  const [refreshScreen, setRefreshScreen] = useState(false);
  const [tournaments, setTournaments] = useState({});
  let timesForTheDayRef = useRef([]);
  let tournamentDaysRef = useRef([]);


  const handleUpdate = (e) => {
    // setHasChanges(true);
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    if (name === 'User') {
      getUser(value);
    }
  }



  const FormatTime = (myDate) => {
    return myDate.format('HH:mm:ss');
  }

  const getUser = (User) => {
    if (!User || !User.id) {
      setValues({ ...values, User: {} })
      return
    }

    if (values.TournamentID === '' ) {
      return
    }
    
    let myURL = `/v1/catalogs/users?ID=${User.id}&TournamentID=${values.TournamentID}&CategoryID=${User.CategoryID}`;

    axios.get(myURL)
      .then((response) => {
        if (response.data.data.length === 0) {
          setValues({ ...values, User: {} })
          return
        }
        setValues({ ...values, User: response.data.data[0] })
      })
      .catch((error) => {
        alert.error('Error leyendo usuarios')
        if (error.response.status === 401) {
          navigate('/pages/login/login3')
        }
      })
  }

  const createTimes = (myDate) => {
    if ((!myDate || myDate === '') ||( values.User && values.User.ID === 0) || (values.TournamentID && values.TournamentID === '')) { 
      return
    }
    let myTimes = [];
    let ID = 1;
    let StartDate = dayjs(myDate);

    let myTime = StartDate.set('hour', 9).startOf('hour');
    for (let i = 9; i <= 23; i++) {
      myTimes.push({
        ID: ID,
        Time: myTime,
        Blocked: false
      })
      myTime = myTime.add(1, 'hour')
      ID++;
    }

    let myURL = `/v1/tournament/timerestriction?TournamentID=${values.TournamentID}&UserID=${values.User.ID}&Filter=${myDate}`
    axios.get(myURL)
      .then((response) => {
        if (response.data.data && response.data.data.length > 0) {

          response.data.data.map((item) => {
            let searchingDate = dayjs(item.RestrictedTime, "YYYY-MM-DD HH:mm:ssZ", 'mx')
            let foundTime = myTimes.findIndex((item2) => {
              return searchingDate.format('YYYY-MM-DD HH:mm') === dayjs(item2.Time).format('YYYY-MM-DD HH:mm')
            });
            if (foundTime !== -1) {
              console.log('Encontrado !!!')
              myTimes[foundTime].Blocked = true

            }
          })

        }
        timesForTheDayRef.current = myTimes;
        setRefreshScreen(prev => !prev)
      })
      .catch((error) => {
        alert.error("Error : " + error.Message)
      })
  }

  const updateAvailability = (id) => {
    let myTimes = timesForTheDayRef.current;
    let index = myTimes.findIndex((item) => item.ID === id);
    if (index !== -1) {
      myTimes[index].Blocked = !myTimes[index].Blocked;
      timesForTheDayRef.current = myTimes;
      setRefreshScreen(prev => !prev);
    }
  }

  const revertBlocked = () => {
    let myTimes = timesForTheDayRef.current;
    myTimes.map((item) => {
      item.Blocked = !item.Blocked
    })
    timesForTheDayRef.current = myTimes;
    setRefreshScreen(prev => !prev);
  }
  
  const renderTimesForTheDay = () => {

    return (
      <>
        <Grid container spacing={2}>
          {timesForTheDayRef.current.map((item) => (
            <Grid item xs={6} md={4} lg={2}>
              <Paper elevation={2} onClick={() => updateAvailability(item.ID)} >
                <Box display={'flex'} justifyContent={'center'} padding={2} >
                  <Typography variant='H4' style={{ color: '#080457' }}>
                    {item.Time.format('DD/MM HH:mm')}
                  </Typography>
                </Box>
                <Divider />
                <Box display={'flex'} justifyContent={'center'} padding={2} bgcolor={item.Blocked ? '#fa8787' : '#bbfcbb'}>
                  <Typography variant='H3' component={'h3'} gutterBottom > {item.Blocked ? 'Restringido' : 'Disponible'} </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </>
    )
  }



  useEffect(() => {
    loadTournamentData()
  }, [values.TournamentID])

  useEffect(() => {
    createTimes(values.FilterDate)
  }, [values.FilterDate])

  const PostSchedulleRestrictions = () => {
    if (values.TournamentID === '' || values.FilterDate === null || !values.User.ID) {
      alert.error('Torneo, Fecha y Jugador son requeridos');
    } else {
      let payload = {
        TournamentID: values.TournamentID,
        UserID: values.User.ID,
        RestrictionDate: values.FilterDate,
      }
      let times = ''
      for (let i = 0; i < timesForTheDayRef.current.length; i++) {
        times += timesForTheDayRef.current[i].Blocked ? `'${timesForTheDayRef.current[i].Time.format('YYYY/MM/DD HH:mm')}',` : '';

      }
      payload.Times = times;
      axios.post('/v1/tournament/timerestriction', payload)
        .then((response) => {
          alert.success('Datos completos...')
        })
        .catch((error) => {
          alert.error('error al POST ')
        })
    }
  }


  const loadTournamentData = () => {
    if (values.TournamentID === '') {
      return
    }
    axios.get('/v1/catalogs/tournament?TournamentID=' + values.TournamentID)
      .then((response) => {
        setTournaments(response.data.data)
      })
      .catch((error) => {
        alert.error('Error cargando torneos...' + error.message)
        if (error.response.status === 401) {
          navigate('/pages/login/login3')
        }
      })
  }

  const GetDateChips = () => {
    const myURL = `/v1/catalogs/tournament?TournamentID=${values.TournamentID}`;
    axios.get(myURL)
      .then((response) => {
        const myDates = [];
        let currentDate = dayjs(response.data.data.StartDate)
        let lastDate = dayjs(response.data.data.EndDate)
        let mycd = currentDate;
        while (mycd < lastDate) {
          myDates.push(mycd)
          mycd = mycd.add(1, 'day');
        }
        tournamentDaysRef.current = myDates
        setRefreshScreen(!refreshScreen);
      })
      .catch((err) => {
        return (
          alert.error("Tournament Days missing")
        )
      })
  }

  const RenderPlayerCard = () => {
    let row = values.User;
    if (!values.User || !values.User.ID) {
      // Registro Vacio
      return (
        <Box >
          <Paper elevation={2}  >
            <Box paddingX={2} paddingTop={2} paddingBottom={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'} sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
              <Box>
                <Typography variant='h4' marginLeft={1.5} component={'h2'}> {row.Name} </Typography>
                <Typography variant='subtitle2' component='p' paddingLeft={0.5}></Typography>
              </Box>
              <Box><Typography variant='h4'>{` Pts`} </Typography></Box>
            </Box>
            <Divider variant={'fullWidth'} />
            <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingTop={2} >
           
              <Box paddingX={2} display={'flex'} alignItems='center'  >
                <Typography variant='subtitle1' component='p'>Nacio el :</Typography>
                <Typography variant='subtitle2' component='p' paddingLeft={0.5}></Typography>
              </Box>
            </Box>
            <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingBottom={1}>
              <Box paddingX={2} display={'flex'} alignItems='center'  >
                <Typography variant='subtitle1' component='p'>Telefono :</Typography>
                <Typography variant='subtitle2' component='p' paddingLeft={0.5}></Typography>
              </Box>

            </Box>
          </Paper>
        </Box>
      )
    } else {
      return (
        <Box >
          <Paper elevation={2}  >
            <Box paddingX={2} paddingTop={2} paddingBottom={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'} bgcolor={row.CategoryColor} sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
              <Box>
                <Typography variant='h4' marginLeft={1.5} component={'h2'}> {row.Name} </Typography>
                <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{row.CategoryDescription}</Typography>
              </Box>
              <Box><Typography variant='h4'>{`${row.Ranking} Pts`} </Typography></Box>
            </Box>
            <Divider variant={'fullWidth'} />
            <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingTop={2} >
              <Box paddingX={2} display={'flex'} alignItems='center'  >
                <Typography variant='subtitle1' component='p'>Nacio el :</Typography>
                <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{dayjs(row.Birthday).format('DD/MM/YYYY')}</Typography>
              </Box>
            </Box>
            <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingBottom={1}>
              <Box paddingX={2} display={'flex'} alignItems='center'  >
                <Typography variant='subtitle1' component='p'>Telefono :</Typography>
                <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{row.Phone}</Typography>
              </Box>
         
            </Box>
          </Paper>
        </Box>
      )
    }

  }


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MainCard title='Captura de restricciones de horario'>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Paper>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1} paddingBottom={2}>
                  <Grid item xs={12}>
                    <SelectTournaments
                      name='TournamentID'
                      value={values.TournamentID}
                      label="Torneos"
                      handleupdate={handleUpdate} />

                  </Grid>
                  <Grid item xs={12}>
                    <SelectUsers
                      name='User'
                      label='Jugadores'
                      handleupdate={handleUpdate}
                      tournamentid={values.TournamentID}
                    />

                  </Grid>
                  <Grid item xs={12}>
                    <SelectConsecutiveDays
                      handleupdate={handleUpdate}
                      name={'FilterDate'}
                      value={values.FilterDate}
                      startdate={tournaments.StartDate}
                      enddate={tournaments.EndDate} />
                  </Grid>
                </Grid>

              </Grid>
              <Grid item xs={12} md={6}>
                {RenderPlayerCard()}
              </Grid>
              <Grid item xs={12} justifyContent={'space-between'} display={'flex'}>
                <Button variant={'contained'} color='secondary' onClick={revertBlocked}> Inverso</Button>
                <Button variant={'contained'} onClick={PostSchedulleRestrictions}> Aceptar Cambios</Button>
              </Grid>
            </Grid>

            <Divider padding={2} />
            Horas
            {renderTimesForTheDay()}
          </Paper>

        </LocalizationProvider>
      </MainCard >
    </LocalizationProvider>
  )

}

export default TimeRestrictionsByTeam