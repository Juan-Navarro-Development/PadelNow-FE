/* eslint-disable no-unused-vars */

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useState } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'

const SelectPlayLevel = (props) => {
    const navigate = useNavigate();
    const alert = useAlert();
    const [rows, setRows] = useState([])

    return (
        <FormControl size='small' fullWidth sx={{ marginRight: 2 }}>
            <InputLabel id="PlayLevel">Nivel de juego</InputLabel>
            <Select
                labelId="TournamentL"
                id={props.name}
                name={props.name}
                value={props.value}
                label="Nivel de juego"
                onChange={props.handleupdate}>

                <MenuItem value='0' key='Nivel no definido'>Sin definir</MenuItem>
                <MenuItem value='2' key={2} >Principiante</MenuItem>
                <MenuItem value='3' key={3} >Intermedio</MenuItem>
                <MenuItem value='5' key={5} >Avanzado</MenuItem>
            </Select>
        </FormControl>
    )
}

export default SelectPlayLevel