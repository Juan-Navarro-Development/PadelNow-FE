/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */

import { Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'

const SelectUsers = (props) => {
    const navigate = useNavigate();
    const alert = useAlert();

    const { filter } = props;
    const [rows, setRows] = useState([])

    const loadComboData = () => {
        if (props.tournamentid === '')  {
            return;
        }
        let myURL = '/v1/catalogs/users?page=-1'
        myURL += props.categoryid && props.categoryid !== '' ? '&CategoryID=' + props.categoryid :'';
        myURL += props.tournamentid && props.tournamentid !== '' ? '&TournamentID=' + props.tournamentid :'';
        
        myURL += filter && filter.length > 0 ? `&filter=${filter}` : '';

        let optionsArray = [];
        axios.get (myURL)
            .then((responses) => {
                optionsArray.push({label: '', id: ''});
                optionsArray.push(...responses.data.data.map((item)=> ({label: item.Name + ' | ' + item.CategoryDescription +' | ' + item.Phone, id:item.ID, CategoryID: item.CategoryID})));
                console.log('Conteo Usuarios : ', optionsArray.length);
                setRows(optionsArray);
            })
            .catch((err) => {
                alert.error('Error leyendo Usuarios')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }


    useEffect(() => {
        loadComboData();
    }, [props.tournamentid])


    const handleUpdate =(value) =>{
        let e = {};
        e.target = {};
        if (value && value.id && props.name){
            e.target.name = props.name;
            e.target.value = value;
            props.handleupdate(e);
        }
    }

    return (
        <>
            <Autocomplete
                {...props}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                size={'small'}
                options={rows}
                renderInput={(params) => <TextField {...params} label="Jugadores" />}
                onChange={(event,value) => handleUpdate(value)}

            />

        </>
    )
}

export default SelectUsers