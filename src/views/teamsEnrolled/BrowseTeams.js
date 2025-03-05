/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';
import { Button, Dialog, Divider, Grid, Paper, Typography } from '@mui/material';
import SelectTournaments from 'components/SelectTournament';
import SelectCategories from 'components/SelectCategories';
import { Box } from '@mui/system';
import LoadImageFromURL from 'components/LoadImageFromURL';
import UpdateTeam from './UpdateTeam';
import CreateTeam from './CreateTeam';

const columns = [
    { id: 'Name', label: 'Equipo', minWidth: 50 },
    { id: 'Name1', label: 'Jugador A', minWidth: 100 },
    { id: 'Ranking1', label: 'Puntos A', minWidth: 50 },
    { id: 'Name2', label: 'Jugador B', minWidth: 100 },
    { id: 'Ranking2', label: 'PuntosB', minWidth: 50 },
    { id: 'actions', label: 'Acciones', minWidth: 30, FormatDisplay: 'actions', align: 'center' }
];


const BrowseTeams = () => {

    const [rows, setRows] = useState([]);
    const [values, setValues] = useState(
        {
            CategoryID: '',
            TournamentID: ''
        }
    )
    const [updateTeamIsOpen, setUpdateTeamIsOpen] = useState(false);
    const [createTeamIsOpen, setCreateTeamIsOpen] = useState(false);

    let currentRow = useRef({});

    const loadData = (newPage) => {
        if (values.TournamentID && values.CategoryID) {


            let URL = `/v1/tournament/enrolledteams?page=-1&CategoryID=${values.CategoryID}&TournamentID=${values.TournamentID}`
            axios.get(URL)
                .then((response) => {
                    setRows(response.data.data)
                })
                .catch((error) => {
                    console.log("Error:", error)
                })
        }
    }

    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        if (name && value) {
            setValues({ ...values, [name]: value });
        }
    };

    const opeUpdateTeam = (row) => {
        currentRow.current = row;
        setUpdateTeamIsOpen(true)
    }
    const opeCreateTeam = (row) => {
        setCreateTeamIsOpen(true)
    }

    useEffect(() => {
    loadData(1);
    
    }, [])
    

    const RenderCard = (row) => {

        return (
            <Grid item sm={12} md={6} lg={4} key={row.ID}>
                <Paper elevation={2}>
                    <Box padding={2}>
                        <Typography align='center' variant={'h4'}>{row.Name}</Typography>
                        <Divider />
                        <Box display={'flex'} flexDirection={'column'} paddingTop={2}>
                            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                <LoadImageFromURL id={row.Member1ID} imageid={row.Member1ID} imagename={row.Name1} height='100px' thumbnail />
                                <Typography variant={'body1'}>{row.Name1}</Typography>
                                <Typography variant={'body1'}>{row.Ranking1}</Typography>
                            </Box>
                            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                <LoadImageFromURL id={row.Member2ID} imageid={row.Member2ID} imagename={row.Name2} height='100px' thumbnail />
                                <Typography variant={'body1'}>{row.Name2}</Typography>
                                <Typography variant={'body1'}>{row.Ranking2}</Typography>
                            </Box>
                        </Box>
                        <Box display={'flex'} justifyContent={'center'} >
                            <Button onClick={()=> opeUpdateTeam(row)}>Cambiar pareja</Button>
                        </Box>
                    </Box>
                </Paper>

            </Grid>
        )
    }


    return (
        <div>
            <div class="table-responsive">
                <MainCard title="Despliegue de equipos inscritos">
                    <Grid container spacing={2}>
                        <Grid item sm={10} md={4}>
                            <SelectTournaments
                                name='TournamentID'
                                value={values.TournamentID}
                                label="Torneos"
                                handleupdate={handleUpdate} />

                        </Grid>
                        <Grid item sm={10} md={4} >
                            <SelectCategories
                                name='CategoryID'
                                value={values.CategoryID}
                                label="Category"
                                handleupdate={handleUpdate} />
                        </Grid>
                        <Grid item sm={2} md={4} display={'flex'} justifyContent={'space-around'}>
                        <Button variant={'contained'} onClick={() => loadData(1)} >Buscar parejas</Button>
                        <Button variant={'contained'} onClick={() => opeCreateTeam()}>Nueva pareja</Button>
                            
                        </Grid>
                    </Grid>

                    {rows && rows.length === 0 && (
                        <Grid item xs={12} paddingTop={2}>
                            <Box justifyContent={'center'} display={'flex'}>
                                <Typography variant='h2'>Sin Resultados...</Typography>
                            </Box>
                        </Grid>

                    )}
                    {rows && rows.length > 0 && (
                        <Grid container spacing={2} paddingY={2}>
                            {rows.map((row) => RenderCard(row))}

                        </Grid>
                    )}
                </MainCard>
            </div>
            <Dialog open={updateTeamIsOpen} onClose={() => setUpdateTeamIsOpen(false)}  fullWidth={true} maxWidth={'md'}>
                <UpdateTeam row={currentRow.current} category={values.CategoryID} tournament={values.TournamentID} onclose={() => setUpdateTeamIsOpen(false)} reload={loadData}/>
            </Dialog>            
            <Dialog open={createTeamIsOpen} onClose={() => setCreateTeamIsOpen(false)} fullWidth={true} maxWidth={'md'}>
                <CreateTeam row={currentRow.current} category={values.CategoryID} tournament={values.TournamentID} onclose={() => setCreateTeamIsOpen(false)} reload={loadData}/>
            </Dialog>
        </div >
    )
}

export default BrowseTeams
