/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, IconButton, Typography } from '@mui/material'
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import axios from 'axios';
import { useAlert } from 'react-alert';
import { IconShirt, IconShirtOff } from '@tabler/icons';

const CaptureKitDelivery = (props) => {
    const alert = useAlert();
    const { game } = props;

    const [KitList, setKitList] = useState([]);

    const postKitDelivered = (TournamentID, GameID, PlayerID, TeamID) => {
        try {
            let payload = {
                TournamentID: TournamentID,
                GameID: parseInt(GameID),
                UserID: PlayerID,
                TeamID: TeamID
            }
            axios.post('/v1/tournament/kit', payload)
                .then((response) => {
                    alert.success('Entrega de kit guardada correctamente');
                    getKitDeliveries(game.TournamentID, game.ID);
                })
                .catch((error) => {
                    alert.error('Error al guardar la entrega de kit');
                });
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    const deleteKitDelivered = (TournamentID, GameID, PlayerID) => {
        try {
            axios.delete(`/v1/tournament/kit?TournamentID=${TournamentID}&GameID=${GameID}&UserID=${PlayerID}`)
                .then((response) => {
                    alert.success('Entrega de kit eliminada correctamente');
                    getKitDeliveries(game.TournamentID, game.ID);
                })
                .catch((error) => {
                    alert.error('Error al eliminar la entrega de kit: '+ error.message);
                });
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    const handelKitClick = (TournamentID, GameID, PlayerID, TeamID) => {
        let KitExists = false;
        if (KitList.length > 0) {
            KitExists = KitList.find((Kit) => Kit.UserID === PlayerID) ? true : false;
        }
        if (KitExists) {
            deleteKitDelivered(TournamentID, GameID, PlayerID);
        } else {
            postKitDelivered(TournamentID, GameID, PlayerID, TeamID);

        }
    };


    const getKitDeliveries = (TournamentID, GameID) => {
        try {
            axios.get(`/v1/tournament/kit?TournamentID=${TournamentID}&GameID=${GameID}`)
                .then((response) => {
                    if (response.data && response.data.data && response.data.data.length > 0) {
                        setKitList(response.data.data);
                    } else {
                        setKitList([]);
                    }
                })
                .catch((error) => {
                    alert.error('Error al obtener la lista de entregas de kits');
                });
        } catch (error) {
            alert.error('Error al intentar obtener la lista de entregas de kits');
            // Handle error
        }
    }

    const isDelievered = (PlayerID) => {
        if (KitList && KitList.length === 0) {
            return false;
        }
        let isPresent = KitList.find((Kit) => Kit.UserID === PlayerID) ? true : false;
        return isPresent;
    }

    useEffect(() => {
        getKitDeliveries(game.TournamentID, game.ID);
    }, []);

    const renderPlayer = (PlayerID, Name, TeamID) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px', border: '1px solid blue', minWidth: '270px' }} flexDirection={'column'}>
            <Typography variant="h6" component="div">{`${PlayerID} - ${Name}`}</Typography>

            <Grid container spacing={2} >
                <Grid item xs={2} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    {isDelievered(PlayerID) && (
                        <IconButton disable={!isDelievered(PlayerID)} onClick={() => handelKitClick(game.TournamentID, game.ID, PlayerID, TeamID)}>
                            <IconShirtOff color='#a80a27'  size={'20'}/>
                        </IconButton >
                    )}
                </Grid>
                <Grid item xs={8} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Typography variant={'h3'} component="div" color={isDelievered(PlayerID) ? 'royalblue' : '#a80a27'}>{isDelievered(PlayerID) ? 'Entregado' : 'No entregado'}</Typography>
                </Grid>
                <Grid item xs={2} display={'flex'} justifyContent={'center'}  alignItems={'center'}>
                    {!isDelievered(PlayerID) && (

                        <IconButton disable={isDelievered(PlayerID)} onClick={() => handelKitClick(game.TournamentID, game.ID, PlayerID, TeamID)}>
                            <IconShirt color='royalblue' size={'20'} />
                        </IconButton>
                    )}
                </Grid>
            </Grid>
        </Box>
    )

    return (
        <MainCard title={(<Box bgcolor={'#33cd32'} display={'flex'} justifyContent={'center'} minHeight={'40px'} alignItems={'center'}><Typography variant='H2'>Entrega de Kits</Typography> </Box>)} content={true}>
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

export default CaptureKitDelivery