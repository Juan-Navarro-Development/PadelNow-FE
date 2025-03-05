/* eslint-disable react-hooks/exhaustive-deps */
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import axios from 'axios';
import React, { useRef, useState } from 'react'
import { useAlert } from 'react-alert';
import MainCard from 'ui-component/cards/MainCard';

const UpdateGameResults = (props) => {
    const alert = useAlert();
    let WinnerRef = useRef(0);
    let scoreErrorMessageRef = useRef('');


    const [values, setValues] = useState({
        Team1Set1: props.game.Team1Set1,
        Team1Set2: props.game.Team1Set2,
        Team1Set3: props.game.Team1Set3,
        Team2Set1: props.game.Team2Set1,
        Team2Set2: props.game.Team2Set2,
        Team2Set3: props.game.Team2Set3,
        WinningReason:'0',
        Comment: ''
    });

    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };


    const PutGameResults = () => {
        let payload = {
            "ID": props.game.GameResultsID,
            "GameID": parseInt( props.game.GameID),
            "Team1Set1": parseInt(values.Team1Set1),
            "Team1Set2": parseInt(values.Team1Set2),
            "Team1Set3": parseInt(values.Team1Set3),
            "Team2Set1": parseInt(values.Team2Set1),
            "Team2Set2": parseInt(values.Team2Set2),
            "Team2Set3": parseInt(values.Team2Set3),
            "Winner": WinnerRef.current,
            "WinningReason": values.WinningReason,
            "Comments": values.Comment
        }
        axios.put("/v1/tournament/gameresults", payload)
            .then((response) => {
                props.getdata();
                props.handleclose();
                alert.info("Resultados guardados exitosamente ...")
            })
            .catch((err) => {
                alert.error('Error almacenando resultados del partido...')
            })
    }

    const DeleteGameResults = () => {
        if (!props.game.GameResultsID || props.game.ID === 0) {
            alert.error('No se puede eliminar un partido sin resultados almacenados ...')
            return
        }
        let myURL = `/v1/tournament/gameresults?GameResultsID=${props.game.GameResultsID}&GameID=${props.game.ID}`
        axios.delete(myURL)
            .then((response) => {
                props.getdata();
                props.handleclose();
                alert.info("Resultados eliminados exitosamente ...")
            })
            .catch((err) => {
                alert.error('Error almacenando resultados del partido...')
            })
    }



    const FindWinner = () => {
/* 
        if (!(values.competitionMode && values.competitionMode.PointsPerSet && values.competitionMode.TieBreakPoints)) {
            return 0
        }
         */
        scoreErrorMessageRef.current = '';

        if (isNaN(values.Team1Set1)
            || isNaN(values.Team1Set2)
            || isNaN(values.Team1Set3)
            || isNaN(values.Team2Set1)
            || isNaN(values.Team2Set2)
            || isNaN(values.Team2Set3)) {
            scoreErrorMessageRef.current = 'Los valores de los sets deben ser numericos';
            return 0
        }
        
        const maxPointsPerSet = 6 // values.competitionMode.PointsPerSet;
        let tieBreakPoints = 7    //values.competitionMode.TieBreakPoints;

        let Team1Set1 = parseInt(values.Team1Set1);
        let Team1Set2 = parseInt(values.Team1Set2);
        let Team1Set3 = parseInt(values.Team1Set3);

        let Team2Set1 = parseInt(values.Team2Set1);
        let Team2Set2 = parseInt(values.Team2Set2);
        let Team2Set3 = parseInt(values.Team2Set3);

        if ((Team1Set1 > (maxPointsPerSet + 1))
            || (Team1Set2 > (maxPointsPerSet + 1))
            || (Team2Set1 > (maxPointsPerSet + 1))
            || (Team2Set2 > (maxPointsPerSet + 1))
        ){
            scoreErrorMessageRef.current = 'El valor maximo de puntos ganados por set es ' + (maxPointsPerSet + 1)
            return 0
        }


        //Primer set
        if ((Team1Set1 !== 0 && Team2Set1 !== 0)) {
            if (Team1Set1 === Team2Set1) {
                scoreErrorMessageRef.current = 'Primer set sin definición, set empatado';
                return 0
            }
            if (Team1Set1 < maxPointsPerSet && Team2Set1 < maxPointsPerSet) {
                scoreErrorMessageRef.current = 'Primer set sin definición, el ganador del set debe haber ganado por lo menos: ' + maxPointsPerSet + ' puntos';
                return 0
            }
        }
        // Segundo set
        if ((Team1Set2 !== 0 && Team2Set2 !== 0)) {
            if (Team1Set2 === Team2Set2) {
                scoreErrorMessageRef.current = 'Segundo set sin definición, set empatado';
                return 0
            }
            if (Team1Set2 < maxPointsPerSet && Team2Set2 < maxPointsPerSet) {
                scoreErrorMessageRef.current = 'Segundo set sin definición, el ganador del set debe haber ganado por lo menos: ' + maxPointsPerSet + ' puntos';
                return 0
            }
        }

        //Tercer set
        if (tieBreakPoints === 0) {
            tieBreakPoints = maxPointsPerSet;
        }
        if ((Team1Set3 !== 0 && Team2Set3 !== 0)) {
            if (Team1Set3 === Team2Set3) {
                scoreErrorMessageRef.current = 'Tercer set sin definición, set empatado';
                return 0
            }
            if (Team1Set3 < maxPointsPerSet && Team2Set3 < maxPointsPerSet) {
                scoreErrorMessageRef.current = 'Tercer set sin definición, el ganador del set debe haber ganado por lo menos: ' + maxPointsPerSet + ' puntos';
                return 0
            }
        }

        let ATeam = 0;
        let BTeam = 0;

        if (Team1Set1 >= maxPointsPerSet && Team2Set1 < Team1Set1) { ATeam++ }
        if (Team2Set1 >= maxPointsPerSet && Team1Set1 < Team2Set1) { BTeam++ }

        if (Team1Set2 >= maxPointsPerSet && Team2Set2 < Team1Set2) { ATeam++ }
        if (Team2Set2 >= maxPointsPerSet && Team1Set2 < Team2Set2) { BTeam++ }

        if (ATeam === 1 || BTeam === 1) {
            if (Team1Set3 >= maxPointsPerSet && Team2Set3 < Team1Set3) { ATeam++ }
            if (Team2Set3 >= maxPointsPerSet && Team1Set3 < Team2Set3) { BTeam++ }
        }
        if (ATeam + BTeam >= 2) {
            if (ATeam > BTeam) {
                WinnerRef.current = 1
                return 1

            }
            if (BTeam > ATeam) {
                WinnerRef.current = 2
                return 2
            }
        }

        return 0
    }

    WinnerRef.current = FindWinner();

    return (
        <MainCard title='Actualizar resultados' >
            <Grid container spacing={1} paddingY={2} paddingLeft={1}>
                <Grid item xs={5.5} style={{ border: "1px solid grey", borderTopLeftRadius: '10px', display: 'flex', alignItems: 'center' }} >
                    <Typography variant={'body2'} >
                        {`${props.game.Team1[0].Name} / ${props.game.Team1[1].Name}`}
                    </Typography>
                </Grid>
                <Grid item xs={1.5} style={{ border: "1px solid grey" }}>
                    <TextField
                        variant="standard"
                        inputProps={{ tabIndex: "1", min: 0, style: { textAlign: 'center'} }}
                        name='Team1Set1'

                        style={{ paddingRight: '.5rem', paddingBottom: '.5rem' }}
                        value={values.Team1Set1}
                        onChange={handleUpdate}
                    />
                </Grid>
                <Grid item xs={1.5} style={{ border: "1px solid grey" }}>
                    <TextField
                        inputProps={{ tabIndex: "2", style: { textAlign: 'center'} }}
                        variant="standard"
                        name='Team1Set2'
                        style={{ paddingRight: '.5rem', paddingBottom: '.5rem' }}
                        value={values.Team1Set2}
                        onChange={handleUpdate}
                    />
                </Grid>
                <Grid item xs={1.5} style={{ border: "1px solid grey" }}>
                    <TextField
                        inputProps={{ tabIndex: "4", min: 0, style: { textAlign: 'center'} }}
                        variant="standard" name='Team1Set3'
                        style={{ paddingRight: '.5rem', paddingBottom: '.5rem' }}
                        value={values.Team1Set3}
                        onChange={handleUpdate}
                    />
                </Grid>
                <Grid item xs={2} style={{ border: "1px solid grey", borderTopRightRadius: '10px' }}  display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    {WinnerRef.current === 1 && (
                        <Typography variant={'h4'} >Gano</Typography>
                    )}
                </Grid>

                <Grid item xs={5.5} style={{ border: "1px solid grey", borderBottomLeftRadius: '10px', display: 'flex', alignItems: 'center' }} >
                    {`${props.game.Team2[0].Name} / ${props.game.Team2[1].Name}`}
                </Grid>
                <Grid item xs={1.5} style={{ border: "1px solid grey" }}>
                    <TextField
                        inputProps={{ tabIndex: "1", min: 0 , style: { textAlign: 'center'}}}
                        variant="standard"
                        name='Team2Set1'
                        style={{ paddingRight: '.5rem', paddingBottom: '.5rem' }}
                        value={values.Team2Set1}
                        onChange={handleUpdate}
                    />
                </Grid>
                <Grid item xs={1.5} style={{ border: "1px solid grey" }}>
                    <TextField
                        variant="standard"
                        inputProps={{ tabIndex: "3", min: 0, style: { textAlign: 'center'} }}
                        name='Team2Set2'
                        style={{ paddingRight: '.5rem', paddingBottom: '.5rem' }}
                        value={values.Team2Set2}
                        onChange={handleUpdate}
                    />
                </Grid>
                <Grid item xs={1.5} style={{ border: "1px solid grey" }}>
                    <TextField
                        variant="standard"
                        inputProps={{ tabIndex: "5", min: 0, style: { textAlign: 'center'} }}
                        name='Team2Set3'
                        style={{ paddingRight: '.5rem', paddingBottom: '.5rem' }}
                        value={values.Team2Set3}
                        onChange={handleUpdate}
                    />
                </Grid>
                <Grid item xs={2} style={{ border: "1px solid grey", borderBottomRightRadius: '10px' }} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    {WinnerRef.current === 2 && (
                        <Typography variant={'h4'} >Gano</Typography>
                    )}
                </Grid>
                <Grid item xs={12} >
                    <FormControl size='small' fullWidth sx={{ paddingTop: '5px', padding: '-10px' }} >
                        <InputLabel id="WinningReasonL">Gano por </InputLabel>
                        <Select
                            inputProps={{ tabIndex: "7" }}
                            labelId="WinningReasonL"
                            id={'WinningReason'}
                            name={'WinningReason'}
                            value={values.WinningReason}
                            onChange={handleUpdate}>
                            <MenuItem value='' key='0'>Indefinido</MenuItem>
                            <MenuItem value='Por sets' key='1'>Por sets</MenuItem>
                            <MenuItem value='Default por ausencia' key='2'>Default por ausencia</MenuItem>
                            <MenuItem value='Default por lesion' key='3'>Default por lesion</MenuItem>

                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} >
                    {scoreErrorMessageRef.current && (
                        <Typography variant={'body2'} color={'error'}>
                            {scoreErrorMessageRef.current}
                        </Typography>
                    )}
                </Grid> 
                <Grid item xs={12} >
                    <TextField
                        fullWidth
                        inputProps={{ tabIndex: "8" }}
                        label='Comentarios'
                        name='Comment'
                        value={values.Comment}
                        onChange={handleUpdate}
                    />
                </Grid>
                <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                    <Button variant={'contained'} color={'warning'} tabIndex={6} onClick={DeleteGameResults}>Borrar</Button>
                    <Button variant={'contained'} color={'secondary'} tabIndex={7} onClick={props.handleclose}>Cancelar</Button>
                    <Button variant={'contained'} color={'primary'} tabIndex={8} onClick={PutGameResults}>Aceptar</Button>
                </Grid>
            </Grid>

        </MainCard>
    )
}

export default UpdateGameResults