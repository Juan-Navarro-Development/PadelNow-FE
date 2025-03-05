/* eslint-disable react-hooks/exhaustive-deps */

import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'


const SelectCategories = (props) => {
    const navigate = useNavigate();
    const alert = useAlert();
    const [rows, setRows] = useState([])

    const loadComboData = () => {
        let myPromises = [
            axios.get('/v1/catalogs/categories?page=-1'),

        ]
        Promise.all(myPromises)
            .then((responses) => {
                setRows(responses[0].data.data);
            })
            .catch((err) => {
                alert.error('Error leyendo Categorias')
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
            <InputLabel id="CategoryL">Categoria</InputLabel>
            <Select
                labelId="CategoryL"
                id={props.name}
                name={props.name}
                value={props.value}
                label="Category"
                onChange={props.handleupdate}>

                <MenuItem value='' key='AllCategories'><Typography variant={'overline'} >Todos</Typography></MenuItem>
                {rows.map((row) => {
                    return <MenuItem value={row.ID} key={'Cat' + row.ID} >
                            <Typography variant={'overline'}>{row.Description}</Typography>
                    </MenuItem>
                })}
            </Select>
        </FormControl>
    )
}

export default SelectCategories