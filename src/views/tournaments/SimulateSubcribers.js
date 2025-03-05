/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Box, Button, Grid, TextField } from '@mui/material'
import axios from 'axios'
import SelectCategories from 'components/SelectCategories'
import SelectTournaments from 'components/SelectTournament'
import React, { useState } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'
import SubCard from 'ui-component/cards/SubCard'

const SimulateSubcribers = () => {
    const navigate = useNavigate();
    const alert = useAlert();
    const [values, setValues] = useState({
        TournamentID: '',
        CategoryID: '',
        UserCount: ''
    })

    const SimularInscipciones = () => {

        let payload = {
            "CategoryID": values.CategoryID,
            "TournamentID": values.TournamentID,
            "UserCount": values.UserCount

        }
        axios.post('/v1/tournament/simulateenrollment', payload)
            .then((response) => {
                alert.success("Inscripcion completa")
            })
            .catch((error) => {
                alert.error("Error durante la inscripcione")
            })
    }

    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };


    return (
        <SubCard title="Simular inscripciones" >
            <Grid container spacing={2} >
                <Grid item sm={12} >
                    <SelectTournaments
                        name='TournamentID'
                        value={values.TournamentID}
                        label="Torneos"
                        handleupdate={handleUpdate} />

                </Grid>
                <Grid item sm={12} >
                    <SelectCategories
                        name='CategoryID'
                        value={values.CategoryID}
                        label="Category"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item sm={12} >
                    <TextField
                        fullWidth
                        size='small'
                        id="UserCount"
                        label="Cantidad de usuarios"
                        name="UserCount"
                        value={values.UserCount}
                        onChange={handleUpdate}
                    />

                </Grid>
                <Grid item sm={12} justifyItems={'center'}>
                        <Button variant={'contained'} onClick={SimularInscipciones}> Simular inscripciones</Button>

                </Grid>
            </Grid>
        </SubCard>

    )
}

export default SimulateSubcribers