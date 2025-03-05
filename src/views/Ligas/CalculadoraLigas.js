import { Box, TextField, Grid } from '@mui/material'
import React from 'react'
import { useAlert } from 'react-alert';

const CalculadoraLigas = () => {
    const alert = useAlert();
    const [values, setValues] = React.useState({
        Name: 'Gran liga Padel Now',
        Club: 'Virtual Club Padel Now',
        StartDate: '2022-01-01',
        EndDate: '2022-12-31',
        NumberOfPlayers: 16,
        NumberOfCourts: 4,
        Rounds: 3,
        DaysOfWeek: ['Tuesday', 'Thursday'],
        GameDuration: 90,
    })


    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        switch (name) {
            case 'NumberOfCourts':
                alert.info('recalculando por número de canchas...');
                break;

            default:
                break;
        }

    }
    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <TextField label='Nombre de la liga' name='Name' value={values.Name} onChange={handleUpdate} />
                </Grid>
                <Grid item xs={3}>
                    <TextField label='Club' value={values.Club} name='Club' onChange={handleUpdate} />
                </Grid>
                <Grid item xs={6} />

                <Grid item xs={3}>
                    <TextField label='Numero de canchas' value={values.NumberOfCourts} name='NumberOfCourts' onChange={handleUpdate} />
                </Grid>
                <Grid item xs={3}>
                    <TextField label='Numero de rondas' value={values.Rounds} name='Rounds' onChange={handleUpdate} />
                </Grid>
                <Grid item xs={3}>
                    <TextField label='Numero de Jugadores' value={values.NumberOfPlayers} name='NumberOfPlayers' onChange={handleUpdate} />
                </Grid>

            </Grid>

            <Grid container spacing={2} paddingTop={2}>
                <Grid item xs={3}>
                    <TextField label='Costo por cancha' value={values.CourtCost} name='CourtCost' onChange={handleUpdate} />
                </Grid>
                <Grid item xs={3}>
                    <TextField label='Costo por Bolas' value={values.BallsCost} name='BallsCost' onChange={handleUpdate} />
                </Grid>
                <Grid item xs={3}>
                </Grid>
                <Grid item xs={3}>
                </Grid>
            </Grid>


        </Box>
    )
}

export default CalculadoraLigas