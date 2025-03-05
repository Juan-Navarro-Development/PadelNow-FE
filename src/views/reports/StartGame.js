/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Grid, Typography } from '@mui/material'
import { Box } from '@mui/system';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert';
import MainCard from 'ui-component/cards/MainCard';

const StartGame = (props) => {
    const alert = useAlert();
    const [isButtonCliccked, setIsButtonClicked] = useState(false);


    const [values, setValues] = useState({
        CourtAssigned: "",
    });


    const PostStartGame = async () => {
        let payload = {
            "ID": parseInt(props.game.GameID),
        }
        payload.GameStarted = dayjs().format('YYYY/MM/DDTHH:mm:ssZ');
        setIsButtonClicked(true);

        try {
            let results = await axios.post("/v1/tournament/updategamebyfield", payload)
            console.log('results de grabar asignacion de cancha', results.status);
            setIsButtonClicked(false);
            props.loaddata(props.game.TournamentID);
            props.handleclose();
            alert.info("Partido iniciado ...")

        } catch (error) {
            alert.error('Error almacenando partido iniciado...', error.message)
        }
    }


    useEffect(() => {
        setValues({ ...values, CourtAssigned: props.game.CourtAssigned })
    }, [])

    return (
        <MainCard title={'Iniciar Partido'} >
            <Grid container spacing={1} paddingY={2} paddingLeft={1} >
                <Grid item xs={12} style={{ border: "1px solid grey", borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    <Box display={'flex'} textAlign={'center'} flexDirection={'column'}>
                        <Typography variant={'caption'} fontWeight={500} fontSize={16} component={'div'}>
                            {`${props.game.Team1Name1}`}
                        </Typography>
                        <Typography variant={'caption'} fontWeight={500} fontSize={16} component={'div'}>
                            {`${props.game.Team1Name2}`}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} style={{ border: "1px solid grey", display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    <Box display={'flex'} textAlign={'center'} flexDirection={'column'}>
                        <Typography variant={'caption'} fontWeight={500} fontSize={16} component={'div'}>
                            {`${props.game.Team2Name1}`}
                        </Typography>
                        <Typography variant={'caption'} fontWeight={500} fontSize={16} component={'div'}>
                            {`${props.game.Team2Name2}`}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} style={{ border: "1px solid grey", display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    <Typography variant='h2'>
                        Cancha : {values.CourtAssigned}
                    </Typography>
                </Grid>

                <Grid item xs={12} display={'flex'} justifyContent={'space-between'} marginTop={2}>
                    <Button variant={'contained'} color={'secondary'} tabIndex={6} onClick={props.handleclose}>Cancelar</Button>
                    <Button variant={'contained'} color={'primary'} tabIndex={7} disabled={isButtonCliccked} onClick={PostStartGame}>Iniciar</Button>
                </Grid>
            </Grid>

        </MainCard>
    )
}

export default StartGame;