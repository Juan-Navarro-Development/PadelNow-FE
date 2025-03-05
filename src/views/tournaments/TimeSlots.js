/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import React, { useEffect } from 'react'
import { useAlert } from 'react-alert';
import { useNavigate } from 'react-router';
import SubCard from 'ui-component/cards/SubCard';
import ListGames from './ListGames';
import MainCard from 'ui-component/cards/MainCard';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


const TimeSlots = (props ) => {
    const [data, setData] = React.useState([]);

    const alert = useAlert();
    const navigate = useNavigate();

    const loadData = () => {
        let myPromises = [
            axios.get('/v1/tournament/gettimeslots?TournamentID=d009aa9c-583c-4c1e-aea5-c3bcf28e0752&FilterDate=2023-09-08')

        ]
        Promise.all(myPromises)
            .then((responses) => {
                setData(responses[0].data.data);
            })
            .catch((err) => {
                alert.error('Error leyendo catalogos')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    useEffect(() => {
        loadData()
    }, [])
    let maxColumn = 1

    const FormatDate = (myDate) => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        let StartTime = new Date(myDate);
        return StartTime.getDay() + '-' + months[StartTime.getMonth()] + '-' + StartTime.getFullYear();

    }

    const DisplayGame = (row) => {
        let StartTimeStr = FormatDate(row.StartTime)
        return (
            <Paper>
                <Grid container xs={12}>
                    <Grid item xs={2} >
                        <Item>
                            {row.CourtNumber}
                        </Item>

                    </Grid>
                    <Grid item xs={10}>
                        <Item>
                            {StartTimeStr}
                        </Item>

                    </Grid>
                </Grid>
            </Paper>
        )
    }

    return (
        <MainCard title={"Programación de Partidos"}>
        <Grid container xs={12}>
            <Grid item xs={2}>
                <ListGames {...props} />
            </Grid>
            <Grid item xs={10}>
                <SubCard title="Time slots">
                    <Grid container spacing={2} >

                        {data.length > 0 &&
                            data.map((row, index) => {
                                maxColumn = maxColumn <= row.CourtNumber ? row.CourtNumber : maxColumn
                                return (
                                    <Grid item xs={3} border={1} alignContent={'center'}>
                                        {DisplayGame(row)}
                                    </Grid>
                                )
                            }

                            )}
                    </Grid>
                </SubCard>

            </Grid>
        </Grid>

        </MainCard>
    )
}

export default TimeSlots