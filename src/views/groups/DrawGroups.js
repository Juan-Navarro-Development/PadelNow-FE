/* eslint-disable no-unused-vars, array-callback-return, react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, TextField, Tooltip, Typography } from '@mui/material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import SelectTournaments from 'components/SelectTournament';
import SelectCategories from 'components/SelectCategories';
import { useAlert } from 'react-alert';
import { useNavigate } from 'react-router';
import { IconTrash } from '@tabler/icons'
import DisplayPaymentStatus from 'components/DisplayPaymentStatus';
import GamesRol from './GamesRol';


const DrawGroups = () => {
    const alert = useAlert();
    const navigate = useNavigate();

    const [values, setValues] = React.useState({
        CategoryID: '',
        TournamentID: '',
        GroupsSize: '3'
    })
    const [gamesRolOpen, setGamesRolOpen] = useState(false);
    const [refreshScreen, setRefreshScreen] = useState(0);

    let groupsRef = useRef([]);
    let teamsRef = useRef([]);


    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const loadGroupData = (newPage) => {

        if (values.TournamentID === '' || values.CategoryID === '') {
            return
        }

        let URL = `/v1/tournament/getteamsbygroup?page=${newPage}&CategoryID=${values.CategoryID}&TournamentID=${values.TournamentID}`
        axios.get(URL)
            .then((response) => {
                if (response.data.data) {

                    let groups = [];
                    let group = {};
                    let lastGroupNumber = ''

                    response.data.data.map(item => {
                        if (lastGroupNumber !== item.GroupID) {
                            if (lastGroupNumber !== '') {
                                groups.push(group)
                                group = {}
                            }
                            group.GroupID = item.GroupID;
                            group.GroupNumber = item.GroupNumber;
                            group.Teams = [];
                        }
                        let team = {}
                        team.GroupID = item.GroupID;
                        team.GroupNumber = item.GroupNumber;
                        team.Name = item.Name;
                        team.TeamID = item.TeamID;
                        team.Player1 = {};
                        team.Player1.ID = item.Member1ID;
                        team.Player1.Name = item.Name1;
                        team.Player1.Ranking = item.Ranking1
                        team.Player1.PaymentStatus = item.PaymentStatus1

                        team.Player2 = {};
                        team.Player2.ID = item.Member2ID;
                        team.Player2.Name = item.Name2;
                        team.Player2.Ranking = item.Ranking2
                        team.Player2.PaymentStatus = item.PaymentStatus2


                        group.Teams.push(team)
                        lastGroupNumber = item.GroupID
                    });
                    groups.push(group);

                    groupsRef.current = groups;
                    loadTeams();

                    setRefreshScreen(prev => prev + 1);
                    console.log('Grupos', groups)
                }
            })
            .catch((error) => {
                alert.error('Error leyendo Grupos')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })

    }


    const loadTeams = () => {

        if (values.TournamentID === '' || values.CategoryID === '') {
            return
        }
        let URL = `/v1/tournament/enrolledteams?CategoryID=${values.CategoryID}&TournamentID=${values.TournamentID}`
        axios.get(URL)
            .then((response) => {
                if (response.data.data) {
                    // marcar las parejas  que ya estan en grupos
                    let teamsNotAssignedToGroup = response.data.data.map((team) => {
                        let teamInGroup = groupsRef.current.findIndex((group) => {
                            let searchInGroup = group.Teams.findIndex((inGroup) => inGroup.TeamID === team.ID)
                            return searchInGroup !== -1
                        });
                        if (teamInGroup !== -1) team.ExistsInGroup = true
                        return team
                    })
                    teamsRef.current = teamsNotAssignedToGroup;
                }

                setRefreshScreen(prev => prev + 1);
            })
            .catch((error) => {
                alert.error('Error leyendo parejas')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }


    const startDrag = (evt, row) => {
        evt.dataTransfer.setData('teamID', row.ID)
    }

    const draggingOver = (evt) => {
        evt.preventDefault();
    }

    const onDrop = (evt, target) => {
        const teamID = parseInt(evt.dataTransfer.getData('teamID'));
        console.log('TeamID ', teamID, " en ", target);
        // validar que la pareja no este en otro grupo
        let teamFoundInGroup = groupsRef.current.find((group) => group.Teams.find((team) => team.TeamID === teamID))
        if (teamFoundInGroup) {
            alert.error('La Pareja: ' + teamID + ' ya existe en el grupo:' + teamFoundInGroup.GroupNumber)
            return
        }
        // Validar si gruopo esta lleno
        let isGroupFull = groupsRef.current.find((group) => group.GroupID === target);
        if (isGroupFull && isGroupFull.Teams.length === parseInt(values.GroupsSize)) {
            alert.error('El grupo: ' + isGroupFull.GroupNumber + ' ya se encuentra lleno')
            return
        }

        let groupFound = groupsRef.current.find((group) => group.GroupID === target)
        let teamFound = teamsRef.current.find((team) => team.ID === teamID)

        if (groupFound && teamFound) {
            // marcar Team con e grupo asignado

            let payload = {
                "TournamentID": values.TournamentID,
                "CategoryID": values.CategoryID,
                "GroupID": groupFound.GroupID,
                "TeamID": teamFound.ID,
                "GroupNumber": groupFound.GroupNumber,
                "Name": teamFound.Name,
            }
            let myURL = `/v1/tournament/groups/addteam`
            axios.post(myURL, payload)
                .then((response) => {
                    alert.success(`Pareja: ${teamFound.Name} ha sido agregada al grupo #${groupFound.GroupNumber}`)
                    loadGroupData();
                    loadTeams();
                })
                .catch((error) => {
                    alert.error(error.message)
                })
        }

    }

    const handleCreateEmptyGroup = () => {
        if (values.TournamentID === '' || values.CategoryID === '') {
            return
        }

        let payload = {
            TournamentID: values.TournamentID,
            CategoryID: values.CategoryID
        }

        let myURL = '/v1/tournament/createemptygroup';
        axios.post(myURL, payload)
            .then((response) => {
                alert.success(response.data.data.Name + " ha sido creado")
            })
            .catch((error) => {
                alert.error('Error al crear el grupo')
            })
    }

    const removeTeamFromGroup = (team) => {
        let myURL = `/v1/tournament/groups/deleteteam?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}&GroupID=${team.GroupID}&TeamID=${team.TeamID}`
        axios.delete(myURL)
            .then((response) => {
                alert.success(`La pareja: ${team.Name} ha sido eliminada del Grupo: #${team.GroupNumber}`)
                loadGroupData();
            })
            .catch((error) => {
                alert.error(`${error.message}`)
            })
    }

    const renderGroup = (grupo) => {
        const renderTeams = () => {

            if (grupo.Teams && grupo.Teams[0].TeamID) {
                return (
                    grupo.Teams.map((item) => (
                        <>

                            <Grid item xs={2} sx={{ borderBottom: '1px' }}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    <b>{`${item.Name}`}</b>
                                </Box>
                            </Grid> 
                            <Grid item xs={1} sx={{ borderBottom: '1px' }}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    <b>{`${item.Player1.Ranking + item.Player2.Ranking}`}</b>
                                </Box>
                            </Grid>
                            <Grid item xs={1}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    <Typography variant='subtitle2'>
                                        {item.Player1.Ranking}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={3}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    <Typography variant='h6' textTransform={'capitalize'}>
                                        {item.Player1.Name ? item.Player1.Name.toLowerCase() :''}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={1}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    <Typography variant='subtitle2'>
                                        {item.Player2.Ranking}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    <Typography variant='h6' textTransform={'capitalize'}>
                                        {item.Player2.Name ? item.Player2.Name.toLowerCase() : ''}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={1}>
                                <Tooltip title='Eliminar del Grupo' placement="top" arrow>
                                    <Button onClick={() => removeTeamFromGroup(item)}>
                                        <IconTrash />
                                    </Button>
                                </Tooltip>
                            </Grid>

                        </>
                    ))
                )
            }
            else {
                return (<Grid xs={12} justifyContent={'center'} display={'flex'}><Typography variant='h2'>Grupo Vacio </Typography></Grid>)
            }
        }





        return (
            <div droppable="true"
                onDragOver={(evt => draggingOver(evt))}
                onDrop={(evt => onDrop(evt, grupo.GroupID))} >
                <Paper elevation={2}>
                    <Grid container spacing={2} padding={2}>
                        <Grid item xs={12} textAlign={'center'} >
                            Grupo #{grupo.GroupNumber}
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        {renderTeams()}
                    </Grid>
                </Paper>
            </div>
        )
    }


    const renderTeamList = (team) => {
        if (team.ExistsInGroup) {
            <></>
        } else {

            return (
                <div draggable onDragStart={(evt) => startDrag(evt, team)}>
                    <Paper elevation={2} >
                        <Grid container spacing={2} paddingX={2}>
                            <Grid item xs={12} textAlign={'center'}>
                                <Typography variant='h4' textTransform={'capitalize'}>
                                    {team.Name.toLowerCase()}
                                </Typography>

                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={4}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    {DisplayPaymentStatus(team.PaymentStatus1)}
                                    <Typography variant={'subtitle2'}>
                                        J1
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={8}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    <Typography variant='h6' textTransform={'capitalize'}>
                                        {team.Name1.toLowerCase()}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={4}>
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'}>
                                    {DisplayPaymentStatus(team.PaymentStatus2)}
                                    <Typography variant={'subtitle2'}>
                                        J2
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={8} >
                                <Box display={'flex'} alignContent={'space-around'} alignItems={'center'} minHeight={'40px'} >
                                    <Typography variant='h6' textTransform={'capitalize'}>
                                        {team.Name2.toLowerCase()}
                                    </Typography>

                                </Box>
                            </Grid>

                        </Grid>
                    </Paper>

                </div>
            )
        }
    }

    useEffect(() => {
        loadGroupData(1)
    }, [values.TournamentID, values.CategoryID])

    const renderGamesRolDialog = () => (
        <Dialog open={gamesRolOpen} onClose={handleClose} sx={{
            "& .MuiDialog-container": {
                "& .MuiPaper-root": {
                    width: "100%",
                    maxWidth: "850px",  // Set your width here
                },
            },
        }}>
            <DialogTitle textAlign={'center'}>
                <b>Partidos de fase de Grupos</b>
            </DialogTitle>
            <DialogContent>
                <GamesRol inDialog tournamentid={values.TournamentID} categoryid={values.CategoryID} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    )

    const openGamesRolDialog = () => {
        setGamesRolOpen(true);
    }

    const handleClose = () => {
        setGamesRolOpen(false);
    }
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
                    <SelectCategories
                        name='CategoryID'
                        value={values.CategoryID}
                        label="Category"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        name='GroupsSize'
                        label="Tamaño del Grupo"
                        value={values.GroupsSize}
                        onChange={handleUpdate}
                        size={'medium'}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={3} >
                    <Box justifyContent={'space-around'} display={'flex'} alignItems={'center'}>
                        <Button variant={'contained'} onClick={handleCreateEmptyGroup} disabled={values.CategoryID === '' || values.TournamentID === ''}>Crear Grupo</Button>
                        <Button variant={'contained'} onClick={openGamesRolDialog} >Ver Partidos</Button>
                    </Box>
                </Grid>
            </Grid>
        )
    }

    return (
        <div>
            <MainCard title="Despliegue de grupos" darkTitle>
                {renderSelectors()}
                <Box paddingTop={1}>
                    <Grid container >
                        <Grid item xs={4} textAlign={'center'}>
                            <Typography variant='h3'>Parejas</Typography>
                            <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 340px)', overflowX: 'hidden' }}>
                                <Grid container spacing={3} paddingLeft={1} paddingRight={1} paddingTop={3}>
                                    {teamsRef.current.filter((item) => !item.ExistsInGroup).length > 0 && (
                                        <>
                                            {teamsRef.current.filter((item) => !item.ExistsInGroup).map((item) => (
                                                <Grid item xs={12}>
                                                    {renderTeamList(item)}
                                                </Grid>
                                            ))}
                                        </>
                                    )}

                                </Grid>
                            </PerfectScrollbar>
                        </Grid>
                        <Grid item xs={8} textAlign={'center'}>
                            <Typography variant='h3'>Grupos</Typography>
                            <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 340px)', overflowX: 'hidden' }}>
                                <Grid container spacing={3} paddingX={2} paddingTop={3}>
                                    {groupsRef.current.length > 0 && (
                                        <>
                                            {
                                                groupsRef.current.map((item) => (
                                                    <Grid item xs={12}>
                                                        {renderGroup(item)}
                                                    </Grid>
                                                ))
                                            }
                                        </>
                                    )}
                                    {groupsRef.current.length === 0 && (
                                        <Grid item>
                                            <Typography variant={'h3'}>
                                                Sin Resultados
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </PerfectScrollbar>
                        </Grid>
                    </Grid>
                </Box>
                {renderGamesRolDialog()}
            </MainCard>
        </div>
    )
}

export default DrawGroups
