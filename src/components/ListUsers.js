import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useAlert } from 'react-alert';
import { useNavigate } from 'react-router';


const ListUsers = (props) => {
    const navigate = useNavigate();
    const alert = useAlert();

    const { filter } = props;
    const [rows, setRows] = useState([])

    const loadData = () => {
        let myURL = '/v1/catalogs/users?page=-1'
        myURL += props.categoryid && props.categoryid !== '' ? '&CategoryID=' + props.categoryid :'';
        myURL += filter && filter.length > 0 ? `&SearchString=${filter}` : '';
        let myPromises = [
            axios.get(myURL),

        ]
        Promise.all(myPromises)
            .then((responses) => {
                setRows(responses[0].data.data);
            })
            .catch((err) => {
                alert.error('Error leyendo Usuarios')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    useEffect(() => {
        loadData();
    }, [])

    useEffect(() => {
        loadData();
    }, [filter])

  
    const startDrag = (evt, row) => {
        evt.dataTransfer.setData('userID', row.ID)
    }

    const RenderCard = (row) => {
        return (
            <Grid item xs={12}  >
                <Paper elevation={2} draggable onDragStart={(evt) => startDrag(evt, row)} padding={2} >
                    <Box padding={2}>
                        <Typography variant={'body1'}>{row.Name}</Typography>
                        <Typography variant={'subtitle2'}>{row.CategoryDescription}</Typography>
                    </Box>
                </Paper>
            </Grid>
        )
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}>

                <Grid container spacing={2} >
                    {rows && rows.length > 0 && (
                        rows.map((row) => RenderCard(row))
                    )}

                    {rows && rows.length === 0 && (
                        <Grid item xs={12}>
                            <Box justifyContent={'center'} display={'flex'}>
                                <Typography variant='h2'>Sin Resultados...</Typography>
                            </Box>
                        </Grid>

                    )}
                </Grid>
            </PerfectScrollbar >
        </LocalizationProvider>
    )


}

export default ListUsers