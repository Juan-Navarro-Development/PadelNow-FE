/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'
import PerfectScrollbar from 'react-perfect-scrollbar';
import LoadImageFromURL from 'components/LoadImageFromURL'
import { IconPencil } from '@tabler/icons'
import SelectPlayLevel from 'components/SelectPlayLevel'
import DisplayPaymentStatus from 'components/DisplayPaymentStatus'


const UpdateTeam = (props) => {
    const alert = useAlert();
    const navigate = useNavigate();

    const [refreshScreen, setRefreshScreen] = useState(false);
    const [values, setValues] = useState({
        PlayLevel: '0'
    });

    let userRows = useRef([]);
    let currentCategory = useRef({});


    let currentTeam = useRef({
        Name: '',
        PlayLevel: '',
        CategoryID: 0,
        TournamentID: 0,
        Name1: '',
        MemberID1: 0,
        Ranking1: 0,
        Name2: '',
        MemberID2: 0,
        Ranking2: 0,
    });

    const draggingOver = (evt) => {
        evt.preventDefault();
    }

    const onDrop = (evt, target) => {
        const UserID = evt.dataTransfer.getData('userID');
        const myURL = `/v1/tournament/isplayertaken?TournamentID=${props.tournament}&CategoryID=${props.category}&UserID=${UserID}`
        axios.get(myURL)
            .then((response) => {
                if (response.data.data.ID === 0) {
                    console.log('Lo dejo caer en caja : ' + target + ' El valor : ' + UserID)
                    getUserInfo(UserID, target);
                } else {
                    alert.error('Jugador ya existe en la pareja : ' + response.data.data.Name);
                }
            })
            .catch((error) => {
                alert.error('Error durante la busqueda de jugador en otra pareja')
            })

    }

    const getUserInfo = (userID, playerID) => {
        let myURL = '/v1/catalogs/users?page=-1&ID=' + userID
        let myPromises = [
            axios.get(myURL),
        ]
        Promise.all(myPromises)
            .then((responses) => {
                currentTeam.current['Name' + playerID] = responses[0].data.data[0].Name;
                currentTeam.current['MemberID' + playerID] = responses[0].data.data[0].ID;
                currentTeam.current['Ranking' + playerID] = responses[0].data.data[0].Ranking;
                currentTeam.current['CategoryColor' + playerID] = responses[0].data.data[0].CategoryColor;

                console.log('Team ==> ', currentTeam.current)
                setRefreshScreen(prev => !prev);
            })
            .catch((err) => {
                alert.error('Error leyendo Usuarios')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }


    const renderTeam = () => {
        return (
            <>
                <Grid container spacing={3}>
                    <Grid item xs={12}>

                        <TextField
                            label='Nombre de la Pareja'
                            fullWidth size={'small'}
                            id='TeamName'
                            name='TeamName'
                            defaultValue={currentTeam.current.Name}
                        />

                    </Grid>
                    <Grid item xs={12}>
                        <SelectPlayLevel
                            id='PlayLevel'
                            name='PlayLevel'
                            value={values.PlayLevel}
                            onChange={handleUpdate}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box
                            droppable="true"
                            sx={{ borderStyle: 'dashed', borderColor: 'blue', borderRadius: '10px' }} minHeight={'150px'}
                            onDragOver={(evt => draggingOver(evt))}
                            onDrop={(evt => onDrop(evt, 1))}>
                            {currentTeam.current.MemberID1 > 0 && (

                                <>

                                    <Box paddingX={2} paddingTop={2} paddingBottom={1} display={'flex'} aflignItems={'center'} justifyContent={'space-between'} bgcolor={currentCategory.current.Color} sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                                        <LoadImageFromURL id={currentTeam.current.MemberID1} imageid={currentTeam.current.MemberID1} imagename={currentTeam.current.Name1} height='100px' thumbnail />

                                        <Box><Typography variant='h4'>{`${currentTeam.current.Ranking1} Pts`} </Typography></Box>
                                    </Box>
                                    <Divider variant={'fullWidth'} />

                                    <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingBottom={1}>

                                        <Typography variant={'h2'}>{currentTeam.current.Name1}</Typography>

                                    </Box>

                                    <Box display={'flex'} justifyContent={'end'}>
                                        <Button variant={'contained'} ><IconPencil size={'20'} /></Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box
                            droppable="true"
                            sx={{ borderStyle: 'dashed', borderColor: 'blue', borderRadius: '10px' }} minHeight={'150px'}
                            onDragOver={(evt => draggingOver(evt))}
                            onDrop={(evt => onDrop(evt, 2))}>
                            {currentTeam.current.MemberID2 > 0 && (

                                <>

                                    <Box paddingX={2} paddingTop={2} paddingBottom={1} display={'flex'} aflignItems={'center'} justifyContent={'space-between'} bgcolor={currentCategory.current.Color} sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                                        <LoadImageFromURL id={currentTeam.current.MemberID2} imageid={currentTeam.current.MemberID2} imagename={currentTeam.current.Name2} height='100px' thumbnail />

                                        <Box><Typography variant='h4'>{`${currentTeam.current.Ranking2} Pts`} </Typography></Box>
                                    </Box>
                                    <Divider variant={'fullWidth'} />

                                    <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingBottom={1}>

                                        <Typography variant={'h2'}>{currentTeam.current.Name2}</Typography>

                                    </Box>

                                    <Box display={'flex'} justifyContent={'end'}>
                                        <Button variant={'contained'} ><IconPencil size={'20'} /></Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Grid>

                </Grid>
            </>
        )
    }


    const loadData = (searchString) => {
        const CategoryID = props.category;
        const TournamentID = props.tournament;

        let myURL = `/v1/tournament/registeredplayerbytournament?TournamentID=${TournamentID}&CategoryID=${CategoryID}`

        let myPromises = [
            axios.get(myURL),

        ]

        if (CategoryID > 0) {
            let myURL2 = '/v1/catalogs/categories?limit=-1&ID=' + CategoryID;
            myPromises.push(axios.get(myURL2));
        }

        Promise.all(myPromises)
            .then((responses) => {
                if (responses[0] && responses[0].data && responses[0].data.data) {
                    userRows.current = responses[0].data.data;
                } else {
                    userRows.current = [];
                }
                if (CategoryID > 0) {
                    currentCategory.current = responses[1].data.data[0];
                }
                setRefreshScreen(!refreshScreen);
            })
            .catch((err) => {
                alert.error('Error leyendo Usuarios')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const handleClickOnSearch = () => {
        let searchString = document.getElementById('SearchString').value;
        console.log('Click on Search : ' + searchString);
        loadData(searchString, '');
    }
    const startDrag = (evt, row) => {
        evt.dataTransfer.setData('userID', row.ID)
    }

    const listUsers = () => {



        const RenderCard = (row) => {
            return (

                <Grid item xs={12} key={row.ID}>
                    <Paper elevation={2} draggable onDragStart={(evt) => startDrag(evt, row)} padding={2} >
                        <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} >
                            {DisplayPaymentStatus(row.PaymentStatus)}
                            <Typography variant={'body1'}>{row.Name}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            )
        }

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {userRows.current && userRows.current.length > 0 && (
                    <Grid item xs={12}>
                        <Box justifyContent={'center'} display={'flex'}>
                            <Typography variant='subtitle1'>{userRows.current.length} Resultados...</Typography>
                        </Box>
                    </Grid>

                )}
                <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}>


                    <Grid container spacing={2} >
                        {userRows.current && userRows.current.length > 0 && (
                            userRows.current.map((row) => RenderCard(row))
                        )}

                        {userRows.current && userRows.current.length === 0 && (
                            <Grid item xs={12}>
                                <Box justifyContent={'center'} display={'flex'}>
                                    <Typography variant='subtitle1'>Sin Resultados...</Typography>
                                </Box>
                            </Grid>

                        )}
                    </Grid>
                </PerfectScrollbar >
            </LocalizationProvider>
        )


    }



    useEffect(() => {

        currentTeam.current.ID = props.row.ID;
        currentTeam.current.Name = props.row.Name;
        currentTeam.current.PlayLevel = props.row.PlayLevel;
        currentTeam.current.Name1 = props.row.Name1
        currentTeam.current.MemberID1 = props.row.Member1ID;
        currentTeam.current.Ranking1 = props.row.Ranking1
        currentTeam.current.Name2 = props.row.Name2
        currentTeam.current.MemberID2 = props.row.Member2ID;
        currentTeam.current.Ranking2 = props.row.Ranking2;
        loadData();
        document.getElementById('TeamName').value = props.row.Name;
    }, [])


    const putTeam = () => {
        const teamName = document.getElementById("TeamName").value;
        if (teamName.length === 0) {
            alert.info('Nombre de la pareja es requerido');
            return
        }
        let myURL = `/v1/tournament/enrolledteams`
        let payload = {
            "ID": currentTeam.current.ID,
            "Name": teamName,
            "PlayLevel": parseInt(values.PlayLevel),
            "Member1ID": currentTeam.current.MemberID1,
            "Name1": currentTeam.current.Name1,
            "Ranking1": currentTeam.current.Ranking1,
            "Member2ID": currentTeam.current.MemberID2,
            "Name2": currentTeam.current.Name2,
            "Ranking2": currentTeam.current.Ranking2,
            "TournamentID": props.tournament,
            "CategoryID": props.category
        }
        axios.put(myURL, payload)
            .then((response) => {
                alert.success(`Pareja ${response.data.ID} actualizada con exito...`);
                props.reload();
                props.onclose();
            })
            .catch((err) => {
                alert.error('Error leyendo Usuarios')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })

    }


    return (
        <>
            <DialogTitle display={'flex'} justifyContent={'center'} bgcolor={'#afccfa'}>
                <Typography variant='h2'>
                    Actualizar pareja
                </Typography>
            </DialogTitle>
            <DialogContent>

                <Grid container spacing={2} paddingTop={2}>
                    <Grid item xs={4}>
                        <TextField fullWidth
                            size='small'
                            label='Buscar'
                            id='SearchString'
                            name='SearchString'
                        />

                    </Grid>
                    <Grid item xs={5}>
                        <Box bgcolor={currentCategory.current.Color} textAlign={'center'} justifyItems={'center'}>
                            <Typography>{currentCategory.current.Description}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3} display={'flex'} justifyContent={'end'} >
                        <Button variant='contained' onClick={handleClickOnSearch}>Buscar</Button>
                    </Grid>

                    <Grid item xs={3}>
                        {listUsers()}
                    </Grid>
                    <Grid item xs={9}>
                        {renderTeam()}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant={'contained'} onClick={props.onclose} color={'error'}>Cancelar</Button>
                <Button variant={'contained'} onClick={putTeam} >Modificar</Button>
            </DialogActions>
        </>
    )
}


export default UpdateTeam