/* eslint-disable no-unused-vars*/

import React, { useEffect, useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material"
import SelectCategories from "components/SelectCategories"
import SelectTournaments from "components/SelectTournament"
import SubCard from "ui-component/cards/SubCard"
import axios from "axios"
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'
import GamesRol from "./GamesRol"

const CreateGames = () => {
    const navigate = useNavigate();
    const alert = useAlert();
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [gamesRolOpen, setGamesRolOpen] = useState(false);

    const [values, setValues] = React.useState(
        {
            CategoryID: '1',
            TournamentID: '4',
            GamesCount: 0
        }
    )
    const crearPartidosPorGrupos = () => {
        if (values.CategoryID === '' || values.TournamentID === '') {
            alert.error('Torneo y categoria son requeridos...')
            return
        }
        let payload = {
            "CategoryID": parseInt(values.CategoryID),
            "TournamentID": parseInt(values.TournamentID)
        }
        axios.post('/v1/tournament/creategamesbygroup', payload)
            .then((response) => {
                alert.success("Creacion de juegos terminada existosamente")
                handleClose();

            })
            .catch((error) => {
                alert.error("Error durante la inscripcione", error.message);
                handleClose();
            })
    }

    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        if (name && value) {
            setValues({ ...values, [name]: value });
        }
    };

    const CargaJuegos = () => {
        let myURL = `/v1/tournament/listgames?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`;
        axios.get(myURL)
            .then((response) => {
                if (response.data.data) {
                    setValues({ ...values, 'GamesCount': response.data.data.length });
                } else {
                    setValues({ ...values, 'GamesCount': 0 });
                }
            })
            .catch((error) => {
                alert.error('Error al leer juegos existentes ...')

            })
    }

    const openGamesRolDialog = () => {
        setGamesRolOpen(true);
    }

    const openConfirmaDialog = () => {
        CargaJuegos();
        setConfirmationOpen(true);
    }

    const handleClose = () => {
        setConfirmationOpen(false);
        setGamesRolOpen(false);
    }

    const renderConfirmationDialog = () => (
        <Dialog open={confirmationOpen} onClose={handleClose} >
            <DialogTitle textAlign={'center'}>
                <b>Crear partidos para fase de grupos</b>
            </DialogTitle>
            <DialogContent>
                Existen {values.GamesCount} partidos, para este torneo y categoria. Al dar click en aceptar estos partidos seran eliminados y nuevos seran creados, esta seguro?
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button onClick={crearPartidosPorGrupos}>Aceptar</Button>
            </DialogActions>
        </Dialog>
    )


    const renderGamesRolDialog = () => (
        <Dialog open={gamesRolOpen} onClose={handleClose} sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                width: "100%",
                maxWidth: "850px",  // Set your width here
              },
            },
          }}>
            <DialogTitle textAlign={'center'}>
                <b>Partidos de fase de Grupos</b>
            </DialogTitle>
            <DialogContent>
                <GamesRol inDialog tournamentid={values.TournamentID} categoryid={values.CategoryID} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    )

    return (
        <SubCard title="Crear partidos en base a grupos" >
            <Grid container spacing={2}>
                <Grid item sm={10} md={4}>
                    <SelectTournaments
                        name='TournamentID'
                        value={values.TournamentID}
                        label="Torneos"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item sm={10} md={4} >
                    <SelectCategories
                        name='CategoryID'
                        value={values.CategoryID}
                        label="Category"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item sm={4} display={'flex'} justifyContent={'space-evenly'}>
                    <Button variant={'contained'} onClick={openConfirmaDialog}>Crear Partidos</Button>
                    <Button variant={'contained'} onClick={openGamesRolDialog} >Ver Partidos</Button>
                </Grid>
            </Grid>
            {renderConfirmationDialog()}
            {renderGamesRolDialog()}
        </SubCard>

    )
}

export default CreateGames