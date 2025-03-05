/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, IconButton, Typography } from '@mui/material'
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import axios from 'axios';
import { useAlert } from 'react-alert';
import { IconUserCheck, IconUserX } from '@tabler/icons';

const CaptureGameAttendance = (props) => {
    const alert = useAlert();
    const { game } = props;

    const [attendanceList, setAttendanceList] = useState([]);

    const postAttendance = (TournamentID, GameID, PlayerID, TeamID) => {
        try {
            let payload = {
                TournamentID: TournamentID,
                GameID: parseInt(GameID),
                UserID: PlayerID,
                TeamID: TeamID
            }
            axios.post('/v1/tournament/attendance', payload)
                .then((response) => {
                    alert.success('Asistencia guardada correctamente');
                    getAttendance(game.TournamentID, game.ID);
                })
                .catch((error) => {
                    alert.error('Error al guardar la asistencia');
                });
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    const deleteAttendance = (TournamentID, GameID, PlayerID) => {
        try {
            axios.delete(`/v1/tournament/attendance?TournamentID=${TournamentID}&GameID=${GameID}&UserID=${PlayerID}`)
                .then((response) => {
                    alert.success('Asistencia eliminada correctamente');
                    getAttendance(game.TournamentID, game.ID);
                })
                .catch((error) => {
                    alert.error('Error al eliminar la asistencia');
                });
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    const handelAttendanceClick = (TournamentID, GameID, PlayerID, TeamID) => {
        let attendanceExists = false;
        if (attendanceList.length > 0) {
            attendanceExists = attendanceList.find((attendance) => attendance.UserID === PlayerID) ? true : false;
        }
        if (attendanceExists) {
            deleteAttendance(TournamentID, GameID, PlayerID);
        } else {
            postAttendance(TournamentID, GameID, PlayerID, TeamID);

        }
    };


    const getAttendance = (TournamentID, GameID) => {
        try {
            axios.get(`/v1/tournament/attendance?TournamentID=${TournamentID}&GameID=${GameID}`)
                .then((response) => {
                    if (response.data && response.data.data && response.data.data.length > 0) {
                        setAttendanceList(response.data.data);
                    } else {
                        setAttendanceList([]);
                    }
                })
                .catch((error) => {
                    alert.error('Error al obtener la asistencia');
                });
        } catch (error) {
            alert.error('Error al intentar obtener la asistencia');
            // Handle error
        }
    }

    const isPlayerPresent = (PlayerID) => {
        if (attendanceList && attendanceList.length === 0) {
            return false;
        }
        let isPresent = attendanceList.find((attendance) => attendance.UserID === PlayerID) ? true : false;
        return isPresent;
    }

    useEffect(() => {
        getAttendance(game.TournamentID, game.ID);
    }, []);

    const renderPlayer = (PlayerID, Name, TeamID) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px', border: '1px solid blue', minWidth: '270px' }} flexDirection={'column'}>
            <Typography variant="h6" component="div">{`${PlayerID} - ${Name}`}</Typography>

            <Grid container spacing={2} >
                <Grid item xs={2} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    {isPlayerPresent(PlayerID) && (
                        <IconButton disable={!isPlayerPresent(PlayerID)} onClick={() => handelAttendanceClick(game.TournamentID, game.ID, PlayerID, TeamID)}>
                            <IconUserX color='#a80a27'  size={'20'}/>
                        </IconButton >
                    )}
                </Grid>
                <Grid item xs={8} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Typography variant={'h3'} component="div" color={isPlayerPresent(PlayerID) ? 'royalblue' : '#a80a27'}>{isPlayerPresent(PlayerID) ? 'Presente' : 'Ausente'}</Typography>
                </Grid>
                <Grid item xs={2} display={'flex'} justifyContent={'center'}  alignItems={'center'}>
                    {!isPlayerPresent(PlayerID) && (

                        <IconButton disable={isPlayerPresent(PlayerID)} onClick={() => handelAttendanceClick(game.TournamentID, game.ID, PlayerID, TeamID)}>
                            <IconUserCheck color='royalblue' size={'20'} />
                        </IconButton>
                    )}
                </Grid>
            </Grid>
        </Box>
    )

    return (
        <MainCard title={(<Box bgcolor={'cornflowerblue'} display={'flex'} justifyContent={'center'} minHeight={'40px'} alignItems={'center'}><Typography variant='H2'>Asistencia</Typography> </Box>)} content={true}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '250px', minWidth: '400px' }}>
                <Grid container spacing={2} >
                    <Grid item xs={12} md={6}>
                        {renderPlayer(game.Team1[0].ID, game.Team1[0].Name, game.Team1ID)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                    {renderPlayer(game.Team1[1].ID, game.Team1[1].Name, game.Team1ID)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      
                    {renderPlayer(game.Team2[0].ID, game.Team2[0].Name, game.Team2ID)}

                    </Grid>
                    <Grid item xs={12} md={6}>
                    {renderPlayer(game.Team2[1].ID, game.Team2[1].Name, game.Team2ID)}
                       
                    </Grid>
                </Grid>
            </Box>
        </MainCard>
    )
}

export default CaptureGameAttendance