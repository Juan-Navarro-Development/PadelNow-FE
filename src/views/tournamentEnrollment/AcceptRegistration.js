/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import { Grid, Button, DialogActions, DialogContent, DialogTitle, Divider, Typography, Box } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useAlert } from 'react-alert';
import { useNavigate } from 'react-router';

const AcceptRegistration = (props) => {
    const navigate = useNavigate();
    const alert = useAlert();
    const [refreshScreen, setRefreshScreen] = useState(false);
    const { tournamentid, categoryid, row } = props
    let userRecord = useRef({});
    let tournamentRecord = useRef({});
    let categoryRecord = useRef({});
    let ideikaProduct = useRef({});

    const loadData = () => {
        let myPromises = [
            axios.get(`/v1/catalogs/users?page=-1&ID=${row.ID}`),
            axios.get(`/v1/catalogs/categories?limit=-1&ID=${categoryid}`),
            axios.get(`/v1/catalogs/tournaments?limit=-1&ID=${tournamentid}`),
 //           axios.get(`/v1/utility/ideika/tournamentprice?TournamentID=${tournamentid}`)
        ]
    
        Promise.all(myPromises)
            .then((responses) => {
                if (responses[0].data.data)
                    userRecord.current = responses[0].data.data;

                if (responses[1].data.data)
                    categoryRecord.current = responses[1].data.data;

                if (responses[2].data.data)
                    tournamentRecord.current = responses[2].data.data;

/*                 if (responses[3].data.data)
                    ideikaProduct.current = responses[3].data.data;
 */
                setRefreshScreen(prev => !prev);
            })
            .catch((error) => {
                console.log("Error:", error)
                alert.error('Error leyendo jugadores, torneos o categorias')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    const PostRegistration = () => {
        const myURL = `/v1/tournament/registerplayerintournament`;
        const payload = {
            "TournamentID": tournamentRecord.current[0].ID,
            "CategoryID": categoryRecord.current[0].ID,
            "UserID": userRecord.current[0].ID
        };

        axios.post(myURL, payload)
            .then((response) => {
                if (response.data.ID) {
                    alert.success('Registro a torneo: ' + tournamentRecord.current[0].Description + ', para el usuario: ' + userRecord.current[0].Name + ', en la categoria: ' + categoryRecord.current[0].Description + ' ah sido hecha con exito.')
                    props.reload();
                    props.onclose();
                }
            })
            .catch((error) => {
                console.log("Error:", error)
                alert.error('Error creando registro a torneo')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    useEffect(() => {
        loadData();
    }, [])


    return (
        <>
            <DialogTitle>
                <Typography variant={'h2'} textAlign={'center'}>
                    Confirmar Inscripción
                </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Grid container spacing={2} display={'flex'} alignItems={'center'}>
                    <Grid item xs={2}>
                        <Typography variant={'body1'} >
                            <b>Torneo</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={10} >
                        <Box sx={{ borderStyle: 'ridge', borderRadius: '5px', padding: '5px' }}>
                            {tournamentRecord.current[0] ? tournamentRecord.current[0].Description : ''}
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant={'body1'} >
                            <b>Categoria</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={10} >
                        <Box sx={{ borderStyle: 'ridge', borderRadius: '5px', padding: '5px' }}>
                            {categoryRecord.current[0] ? categoryRecord.current[0].Description : ''}
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant={'body1'} >
                            <b>Jugador</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={10} >
                        <Box sx={{ borderStyle: 'ridge', borderRadius: '5px', padding: '5px' }}>
                            {userRecord.current[0] ? userRecord.current[0].Name : ''}
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant={'body1'} >
                            <b>Codigo</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={4} >
                        <Box sx={{ borderStyle: 'ridge', borderRadius: '5px', padding: '5px' }}>
                            {ideikaProduct.current.CODIGO ? ideikaProduct.current.CODIGO : ''}
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant={'body1'} >
                            <b>Precio</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={4} >
                        <Box sx={{ borderStyle: 'ridge', borderRadius: '5px', padding: '5px' }}>
                            {ideikaProduct.current.PRECIO ? ideikaProduct.current.PRECIO : ''}
                        </Box>
                    </Grid>
                </Grid>

            </DialogContent>
            <DialogActions>
                <Button onClick={props.onclose} variant={'contained'} color={'secondary'} >Cancelar</Button>
                <Button onClick={PostRegistration} variant={'contained'} color={'primary'}>Crear inscripción</Button>
            </DialogActions>
        </>
    )
}

export default AcceptRegistration