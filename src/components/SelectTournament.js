/* eslint-disable react-hooks/exhaustive-deps */
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'

const SelectTournaments = (props) => {
    const navigate = useNavigate();
    const alert = useAlert();
    const [rows, setRows] = useState([])

    const loadComboData = () => {
        let myPromises = [
            axios.get('/v1/catalogs/tournaments?limit=-1'),

        ]
        Promise.all(myPromises)
            .then((responses) => {
                setRows(responses[0].data.data);
            })
            .catch((err) => {
                alert.error('Error leyendo Torneos')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    useEffect(() => {
        loadComboData();
    }, [])

    return (
        <FormControl size='small' fullWidth sx={{ marginRight: 2 }}>
            <InputLabel id="TournamentL">Torneos</InputLabel>
            <Select
                labelId="TournamentL"
                id={props.name}
                name={props.name}
                value={props.value}
                label="Torneo"
                onChange={props.handleupdate}>

                <MenuItem value='' key='AllTournaments'><Typography variant={'overline'}>Todos</Typography></MenuItem>
                {rows.map((row) => {
                    return <MenuItem value={row.ID} key={'tour'+row.ID}>
                        <Typography variant={'overline'}>{row.Description}</Typography>
                    </MenuItem>
                })}
            </Select>
        </FormControl>
    )
}

export default SelectTournaments