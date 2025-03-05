/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Box, Divider, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PerfectScrollbar from 'react-perfect-scrollbar';

import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import './index.css'
import SelectUsers from 'components/SelectUsers';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useAlert } from 'react-alert';
import LoadImageFromURL from 'components/LoadImageFromURL';

const CreateReservations = () => {
    const navigate = useNavigate();
    const alert = useAlert();
    const [values, setValues] = useState({
        userID: '',
        ReservationDate: dayjs(),
    })

    const NUMBER_OF_COURTS = 8;
    const START_TIME = values.ReservationDate.hour(7).minute(0);
    const END_TIME = values.ReservationDate.hour(23).minute(0);
    const TimeSlotSize = 30;
    let TimeSlotsCount = Math.trunc(END_TIME.diff(START_TIME, 'minutes') / TimeSlotSize);
    const ColSize = 12 / NUMBER_OF_COURTS;

    const renderTimeSlots = () => {



        const reservaciones = [
            {
                UserID: 60019,
                DateReserved: dayjs().hour(8).minute(0),
                Court: 1,
                TypeOfReservation: 'userReserved',
            },
            {
                UserID: 60019,
                DateReserved: dayjs().hour(8).minute(30),
                Court: 1,
                TypeOfReservation: 'userReserved',
            },
            {
                UserID: 60019,
                DateReserved: dayjs().hour(9).minute(0),
                Court: 1,
                TypeOfReservation: 'userReserved',
            },
            {
                UserID: 60019,
                DateReserved: dayjs().hour(9).minute(30),
                Court: 1,
                TypeOfReservation: 'userReserved',
            },
            {
                UserID: 70001,
                DateReserved: dayjs().hour(10).minute(0),
                Court: 2,
                TypeOfReservation: 'trainerReserved',
            },
            {
                UserID: 70001,
                DateReserved: dayjs().hour(10).minute(30),
                Court: 2,
                TypeOfReservation: 'trainerReserved',
            },
            {
                UserID: 70001,
                DateReserved: dayjs().hour(11).minute(0),
                Court: 2,
                TypeOfReservation: 'trainerReserved',
            },
            {
                UserID: 80001,
                DateReserved: dayjs().hour(11).minute(0),
                Court: 4,
                TypeOfReservation: 'blockedReserved',
            },
            {
                UserID: 80001,
                DateReserved: dayjs().hour(11).minute(30),
                Court: 4,
                TypeOfReservation: 'blockedReserved',
            },
            {
                UserID: 80001,
                DateReserved: dayjs().hour(12).minute(0),
                Court: 4,
                TypeOfReservation: 'blockedReserved',
            },
        ]

        const courtStatus = (myDate, court) => {
            let reservationFound = reservaciones.find((item) => item.DateReserved.format('DD/MM/yyyy HH:mm') === myDate.format('DD/MM/yyyy HH:mm') && item.Court === court)
            return reservationFound ? reservationFound.TypeOfReservation : '';
        }

        return (
            <Box>
                <Grid container sx={{ border: '1px solid ' }} >
                    {[...Array(NUMBER_OF_COURTS)].map((c, ci) => (
                        <Grid item xs={ColSize} key={`Title-${ci}`} className='timeSlotHeader'>
                            <Typography fontSize={14} variant={'body1'} fontWeight={'bold'}>
                                Cancha {ci + 1}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
                <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 155px)', overflowX: 'hidden' }}>
                    <Grid container sx={{ border: '1px solid ' }} >
                        {[...Array(TimeSlotsCount)].map((t, ti) => (
                            <>
                                {[...Array(NUMBER_OF_COURTS)].map((c, ci) => (
                                    <>
                                        <Grid item xs={ColSize} key={`T-${ci}-${ti}`} className={`timeSlot ${courtStatus(START_TIME.add(TimeSlotSize * ti, 'minute'), ci + 1)}`}>
                                            {START_TIME.add(TimeSlotSize * ti, 'minute').format('HH:mm')}
                                        </Grid>

                                    </>
                                )
                                )}
                            </>
                        ))}

                    </Grid>
                </PerfectScrollbar>
            </Box>
        )

    }
    const renderReservationSelector = () => {
        return (
            <FormControl>
                <FormLabel id="TypeSelector">Tipo</FormLabel>
                <RadioGroup
                    row
                    defaultValue="player"
                    name="TypeSelector"
                >
                    <FormControlLabel value="player" control={<Radio />} label="Jugador" />
                    <FormControlLabel value="blocked" control={<Radio />} label="No disponible" />
                    <FormControlLabel value="trainer" control={<Radio />} label="Entrenador" />
                </RadioGroup>
            </FormControl>
        )
    }

    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        if (name && value) {
            setValues({ ...values, [name]: value });
        }
    };

    const handleDateUpdate = (newValue, name) => {
        // setHasChanges(true);
        if (name && newValue) {
            setValues({ ...values, [name]: newValue });
        }
    };

    useEffect(() => {
        getUser()
    }, [values.UserID])


    const getUser = () => {
        if (values.UserID === '') {
            setValues({ ...values, User: {} })

            return
        }
        let myURL = "/v1/catalogs/users?ID=" + values.UserID;

        axios.get(myURL)
            .then((response) => {
                setValues({ ...values, User: response.data.data[0] })
            })
            .catch((error) => {
                alert.error('Error leyendo usuarios')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
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
                                <Typography variant='h4' marginLeft={1.5} component={'h2'}>  </Typography>
                                <Typography variant='subtitle2' component='p' paddingLeft={0.5}></Typography>
                            </Box>
                            <Box><Typography variant='h4'>{` Pts`} </Typography></Box>
                        </Box>
                        <Divider variant={'fullWidth'} />
                        <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingTop={2} >
                            <Box paddingX={2} display={'flex'} alignItems='center'  >
                                <Typography variant='subtitle1' component='p'>Miembro desde :</Typography>
                                <Typography variant='subtitle2' component='p' paddingLeft={0.5}></Typography>

                            </Box>
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
                            <Box paddingX={2} display={'flex'} alignItems='center'  >
                                <Typography variant='subtitle1' component='p'>IDEIKA :</Typography>
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
                            <LoadImageFromURL id={row.ID} imageid={row.ID} imagename={row.Name} height='100px' thumbnail />
                            <Box>
                                <Typography variant='h4' marginLeft={1.5} component={'h2'}> {row.Name} </Typography>
                                <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{row.CategoryDescription}</Typography>
                            </Box>
                            <Box><Typography variant='h4'>{`${row.Ranking} Pts`} </Typography></Box>
                        </Box>
                        <Divider variant={'fullWidth'} />
                        <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingTop={2} >
                            <Box paddingX={2} display={'flex'} alignItems='center'  >
                                <Typography variant='subtitle1' component='p'>Miembro desde :</Typography>
                                <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{dayjs(row.MemberSince).format('DD/MM/YYYY')}</Typography>
                            </Box>
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
                            <Box paddingX={2} display={'flex'} alignItems='center'  >
                                <Typography variant='subtitle1' component='p'>IDEIKA :</Typography>
                                <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{row.IdeikaClientID}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            )
        }

    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box >
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <SelectUsers
                                    name='UserID'
                                    value={values.UserID}
                                    label='Jugadores'
                                    handleUpdate={handleUpdate}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl size={'small'} fullWidth>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        label="Fecha de Reservación"
                                        name="ReservationDate"
                                        value={values.ReservationDate}
                                        onChange={(newValue) => handleDateUpdate(newValue, "ReservationDate")}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                {renderReservationSelector()}
                            </Grid>
                        </Grid>

                    </Grid>
                    <Grid item xs={6}>
                        {RenderPlayerCard()}
                    </Grid>
                </Grid>
                {renderTimeSlots()}
            </Box>
        </LocalizationProvider>
    )
}

export default CreateReservations