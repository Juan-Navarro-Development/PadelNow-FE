/* eslint-disable   react-hooks/exhaustive-deps, array-callback-return,  no-unused-vars */
import { Button, Grid, Typography, Divider, TextField, InputAdornment } from '@mui/material'
import { Box } from '@mui/system'
import { IconSearch } from '@tabler/icons'
import axios from 'axios'
import SelectCategories from 'components/SelectCategories'
import SelectTournaments from 'components/SelectTournament'
import React, { useEffect, useRef, useState } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'
import MainCard from 'ui-component/cards/MainCard'
import PerfectScrollbar from 'react-perfect-scrollbar'
import './styles.css'

const PointsAwardedListing = () => {
    const alert = useAlert();
    const navigate = useNavigate();

    const [values, setValues] = useState(
        {
            CategoryID: '',
            TournamentID: '',
        }
    )

    var TeamsRef = useRef([]);
    var PlayoffRef = useRef([]);
    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });

    };
    const evenColor = '#e0e0e0';
    const oddColor = '#fcee83';

    const [refreshScreen, setRefreshScreen] = useState(false);

    const renderSelectors = () => (
        <Box >
            <Grid container spacing={1} padding={1}>
                <Grid item xs={4}>
                    <SelectTournaments
                        name='TournamentID'
                        label='Torneo'
                        handleupdate={handleUpdate}
                        value={values.TournamentID}
                    />
                </Grid>
                <Grid item xs={4}>
                    <SelectCategories
                        name='CategoryID'
                        value={values.CategoryID}
                        label="Category"
                        handleupdate={handleUpdate} />

                </Grid>
                <Grid item xs={4}>
                    <Box display={'flex'} justifyContent={'space-evenly'} >
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )

    const renderData = () => {
        const noZeroes = (value) => {
            return value === 0 ? '' : `${value}`;
        }
        return (
            <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 300px)', overflowX: 'hidden' }}>
                <Grid container spacing={1} padding={1}>
                    <Grid item xs={1}><Typography variant="h6" >Equipo</Typography></Grid>
                    <Grid item xs={3}><Typography variant="h6" >Integrantes</Typography></Grid>
                    <Grid item xs={1}><Typography variant="h6" >Grupos</Typography></Grid>
                    <Grid item xs={1}><Typography variant="h6" >16avos</Typography></Grid>
                    <Grid item xs={1}><Typography variant="h6" >8avos</Typography></Grid>
                    <Grid item xs={1}><Typography variant="h6" >4tos</Typography></Grid>
                    <Grid item xs={1}><Typography variant="h6" >Semifinal</Typography></Grid>
                    <Grid item xs={1}><Typography variant="h6" >Sub campeon</Typography></Grid>
                    <Grid item xs={2}><Typography variant="h6" >Campeon</Typography></Grid>

                    {TeamsRef.current && TeamsRef.current.length > 0 && (
                        <>
                            {TeamsRef.current.map((team, index) => (
                                <>
                                    <Grid item xs={1} display={'flex'} alignItems={'center'} bgcolor={index % 2 === 0 ? evenColor : oddColor}>
                                        <Typography variant="h6">{index + 1}</Typography>
                                    </Grid>
                                    <Grid item xs={3} bgcolor={index % 2 === 0 ? evenColor : oddColor}>
                                        <Box display={'flex'} flexDirection={'column'}>
                                            <Typography variant="h6">1.-{team.Name1}</Typography>
                                            <Typography variant="h6">2.-{team.Name2}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Grupos)}</Typography></Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Dieciseisavos)}</Typography></Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Octavos)}</Typography></Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Cuartos)}</Typography></Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Semifinales)}</Typography></Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Final)}</Typography></Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Campeon)}</Typography></Grid>
                                    <Grid item xs={1} bgcolor={index % 2 === 0 ? evenColor : oddColor}><Typography variant="h6" >{noZeroes(team.Total)}</Typography></Grid>
                                </>
                            ))
                            }
                        </>
                    )}
                </Grid>
            </PerfectScrollbar>
        )
    }

    useEffect(() => {
        if (values.TournamentID && values.CategoryID) {
            LoadData();
        }
    }, [values.TournamentID, values.CategoryID])

    const LoadData = () => {
        let myPromises = [];
        myPromises.push(axios.get(`/v1/tournament/enrolledteams?CategoryID=${values.CategoryID}&TournamentID=${values.TournamentID}`))
        myPromises.push(axios.get(`/v1/tournament/pointsawarded?CategoryID=${values.CategoryID}&TournamentID=${values.TournamentID}`))
        Promise.all(myPromises)
            .then((responses) => {
                if (responses[0].data) {
                    TeamsRef.current = responses[0].data.data.map((item) => {
                        item.Grupos = 0;
                        item.Dieciseisavos = 0;
                        item.Octavos = 0;
                        item.Cuartos = 0;
                        item.Semifinales = 0;
                        item.Final = 0;
                        item.Campeon = 0;
                        return item;
                    })
                } else {
                    TeamsRef.current = [];
                }

                if (responses[1].data && responses[1].data.Playoffs) {
                    PlayoffRef.current = responses[1].data.Playoffs;
                } else {
                    PlayoffRef.current = [];
                }
                const PointsAwarded = responses[1].data.PointsAwarded;
                let myTeams = TeamsRef.current.map((item) => {
                    // buscar los que perdieron en 16
                    let Grupos = PlayoffRef.current.filter((playoff) => item.TeamID === playoff.TeamID)
                    let Dieciseisavos = PlayoffRef.current.filter((playoff) => item.TeamID === playoff.TeamID && playoff.Round === 16 && playoff.Win === 0)
                    let Octavos = PlayoffRef.current.filter((playoff) => item.TeamID === playoff.TeamID && playoff.Round === 8 && playoff.Win === 0)
                    let Cuartos = PlayoffRef.current.filter((playoff) => item.TeamID === playoff.TeamID && playoff.Round === 4 && playoff.Win === 0)
                    let Semifinales = PlayoffRef.current.filter((playoff) => item.TeamID === playoff.TeamID && playoff.Round === 2 && playoff.Win === 0)
                    let Final = PlayoffRef.current.filter((playoff) => item.TeamID === playoff.TeamID && playoff.Round === 1 && playoff.Win === 0)

                    let Campeon = PlayoffRef.current.filter((playoff) => item.TeamID === playoff.TeamID && playoff.Round === 1 && playoff.Win === 1)

                    if (Grupos.length === 0) item.Grupos = PointsAwarded.find((item) =>  item.Round === 999 ).RankingPoints;
                    if (Dieciseisavos.length !== 0) item.Dieciseisavos = PointsAwarded.find((item) =>  item.Round === 16 ).RankingPoints;
                    if (Octavos.length !== 0) item.Octavos = PointsAwarded.find((item) =>  item.Round === 8 ).RankingPoints;
                    if (Cuartos.length !== 0) item.Cuartos = PointsAwarded.find((item) =>  item.Round === 4 ).RankingPoints;
                    if (Semifinales.length !== 0) item.Semifinales = PointsAwarded.find((item) =>  item.Round === 2 ).RankingPoints;
                    if (Final.length !== 0) item.Final = PointsAwarded.find((item) =>  item.Round === 1 ).RankingPoints;

                    if (Campeon.length !== 0) item.Campeon = PointsAwarded.find((item) =>  item.Round === 0 ).RankingPoints;
                    item.Total = item.Grupos + item.Dieciseisavos + item.Octavos + item.Cuartos + item.Semifinales + item.Final + item.Campeon;
                    return item
                })
                TeamsRef.current = myTeams;
                setRefreshScreen(refreshScreen => refreshScreen + 1)
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <MainCard title="Puntos Ganados">
            {renderSelectors()}
            {renderData()}
        </MainCard>
    )
}

export default PointsAwardedListing;