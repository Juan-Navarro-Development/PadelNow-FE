/* eslint-disable no-unused-vars */

import React, { useState } from "react"
import { Button, Grid } from "@mui/material"
import SelectCategories from "components/SelectCategories"
import SelectTournaments from "components/SelectTournament"
import SubCard from "ui-component/cards/SubCard"
import axios from "axios"
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'

const CreateGroups = () => {
    const navigate = useNavigate();
    const alert = useAlert();

    const [values, setValues] = React.useState(
        {
            CategoryID: '',
            TournamentID: ''
        }
    )
    const [isCreateButtonClicked, setIsCreateButtonClicked] = useState(false);
    const crearGrupos = () => {
        setIsCreateButtonClicked(true);
        if (values.CategoryID === '' || values.TournamentID === '') {
            alert.error('Torneo y categoria son requeridos...')
            return
        }
        let payload = {
            "CategoryID": values.CategoryID,
            "TournamentID": values.TournamentID
        }
        axios.post('/v1/tournament/creategroups', payload)
            .then((response) => {
                alert.success("Grupos creados satisfactoriamiente")
                axios.post('/v1/tournament/creategamesbygroup', payload)
                    .then((response) => {
                        alert.success("Partidos por grupos creados satisfactoriamente")
                        setIsCreateButtonClicked(false);

                    })
                    .catch((error) => {
                        alert.error("Error durante la creacion de partidos"+ error.message);
                        setIsCreateButtonClicked(false);
                    })
            })
            .catch((error) => {
                alert.error("Error durante la creacion de grupos" + error.message);
                setIsCreateButtonClicked(false);
            })
    }

    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        if (name && value) {
            setValues({ ...values, [name]: value });
        }
    };


    return (
        <SubCard title="Crear Grupos" >
            <Grid container spacing={2}>
                <Grid item sm={10} md={5}>
                    <SelectTournaments
                        name='TournamentID'
                        value={values.TournamentID}
                        label="Torneos"
                        handleupdate={handleUpdate} />

                </Grid>
                <Grid item sm={10} md={5} >
                    <SelectCategories
                        name='CategoryID'
                        value={values.CategoryID}
                        label="Category"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item sm={2}>
                    <Button variant={'contained'} onClick={crearGrupos} disabled={isCreateButtonClicked}>Crear Grupos</Button>
                </Grid>
            </Grid>

        </SubCard>

    )
}

export default CreateGroups