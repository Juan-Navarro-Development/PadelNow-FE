/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Button, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Paper, Select, Switch, TextField } from '@mui/material'
import React from 'react'
import { styled } from '@mui/material/styles';
import { useAlert } from 'react-alert';
import axios from 'axios';
import SubCard from 'ui-component/cards/SubCard';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import SelectClubs from 'components/SelectClubs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import SelectTournaments from 'components/SelectTournament';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.h1,
    padding: theme.spacing(5),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const CreateTimeSlots = (props) => {
    const alert = useAlert();
    const sixAM = dayjs().set('hour', 6).startOf('hour');

    const [values, setValues] = React.useState(
        {
            TournamentID: '',
        }
    )


    const CreateTimeSlots = () =>{
        let payload = {
            'TournamentID': values.TournamentID
        }
        let myURL ='/v1/tournament/createtimeslots'

        axios.post(myURL,payload)
        .then ((response) =>{
            alert.success( ' ' + response.data.results+ ' Time slots fueron creados...')
        })
        .catch((error) =>{
            alert.error('Error creando timeslots ...')
        })
    }



    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid item xs={12}>{/*  Crear Torneo */}
                <Item>
                    <SubCard title="Crear Torneo">
                        <Grid container spacing={2} >
                            <Grid item xs={12}>
                               <SelectTournaments 
                                name='TournamentID'
                                value={values.TournamentID}
                                label="Torneo"
                                handleupdate={handleUpdate}/>
                            </Grid>
                            <Grid item xs={12}>
                                <Button onClick={() => CreateTimeSlots()} variant='outlined'>
                                    Crear Time Slots 
                                </Button>
                            </Grid>
                        </Grid>
                    </SubCard>
                </Item>
            </Grid>

        </LocalizationProvider>
    )
}

export default CreateTimeSlots