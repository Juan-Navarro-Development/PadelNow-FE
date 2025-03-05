/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import * as React from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { Box, Button, Dialog, Divider, FormControlLabel, Grid, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { useAlert } from 'react-alert';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import LoadImageFromURL from 'components/LoadImageFromURL';
import './styles.css';
import { useState } from 'react';
import { IconPencil, IconAccessible, IconAccessibleOff } from '@tabler/icons';
import SelectCategories from 'components/SelectCategories';
import PerfectScrollbar from 'react-perfect-scrollbar';
import SelectTournaments from 'components/SelectTournament';
import AcceptRegistration from './AcceptRegistration';
import CancelRegistration from './CancelRegistration';

export default function BrowserList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const [rows, setRows] = React.useState([]);
    const [stats,setStats] = React.useState({});
    const [acceptRegistrationOpen, setAcceptRegistrationOpen] = React.useState(false);
    const [cancelRegistrationOpen, setCancelRegistrationOpen] = React.useState(false);

    let currentRow = React.useRef({})
    const [values, setValues] = useState({
        CategoryID: '',
        TournamentID: '',
        SearchString: '',
        Status: '1'
    });

    const loadData = (newPage) => {
        if (values.CategoryID === "" && values.TournamentID === '') {
            alert.error('Torneo y Categoria son requeridos')
            return
        }

        
        let myURL = `/v1/tournament/registeredplayerbytournament?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}&Status=${values.Status}`;
        if (values.SearchString && values.SearchString.length > 0) {
            myURL += `&SearchString=${values.SearchString}`
        }
        
        axios.get(myURL)
            .then((response) => {
                setRows(response.data.data);
                setStats(response.data.stats);
            })
            .catch((error) => {
                console.log("Error:", error)
                alert.error('Error leyendo usuarios')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }
    useEffect(() => {
        loadData();
    }, [])

    const formatDate = (myDate) => {
        let d = new Date(myDate);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    }

    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const openAcceptRegistration = (row) => {
        currentRow.current = row;
        setAcceptRegistrationOpen(true);
    }
    
    const openCancelRegistration = (row) => {
        currentRow.current = row;
        setCancelRegistrationOpen(true);
    }

    const RenderCard = (row) => {
        return (
            <Grid item sm={12} md={6} lg={4} key={row.ID} >
                <Paper elevation={2} >
                    <Box paddingX={2} paddingTop={2} paddingBottom={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'} bgcolor={row.CategoryColor} sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                        <LoadImageFromURL id={row.ID} imageid={row.ID} imagename={row.Name} height='100px' thumbnail />
                        <Box>
                            <Typography variant='h4' marginLeft={1.5} component={'h2'}> {row.Name} </Typography>
                            <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{row.CategoryDescription}</Typography>
                        </Box>
                        <Box><Typography variant='h4'>{`${row.Ranking} Pts`} </Typography></Box>
                    </Box>
                    <Divider variant={'fullWidth'} />

                    <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingTop={2} >

                        <Box paddingX={2} display={'flex'} alignItems='center'  >
                            <Typography variant='subtitle1' component='p'>Miembro desde :</Typography>
                            <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{formatDate(row.MemberSince)}</Typography>

                        </Box>

                        <Box paddingX={2} display={'flex'} alignItems='center'  >

                            <Typography variant='subtitle1' component='p'>Nacio el :</Typography>
                            <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{formatDate(row.Birthday)}</Typography>

                        </Box>

                    </Box>
                    <Box display={'flex'} alignItems='center' justifyContent='space-between' paddingBottom={1}>

                        <Box paddingX={2} display={'flex'} alignItems='center'  >

                            <Typography variant='subtitle1' component='p'>Telefono :</Typography>
                            <Typography variant='subtitle2' component='p' paddingLeft={0.5}>{row.Phone}</Typography>

                        </Box>

                    </Box>
                    <Box paddingX={2} display={'flex'} alignItems='center'  >
                        {row.PaymentStatus && (
                            <Typography variant='subtitle1' component='p' color={'#43a847'}><IconAccessible size={'30px'} /></Typography>
                        )}

                        {!row.PaymentStatus && (
                            <Typography variant='subtitle1' component='p' color={'#f5252c'}><IconAccessibleOff size={'30px'} /></Typography>
                        )}
                    </Box>

                    <Box display={'flex'} justifyContent={'flex-end'}>
                    {row.PaymentStatus && (
                        <Button variant={'contained'} onClick={() => openCancelRegistration(row)} color={'warning'}>Cancelar inscripción</Button>
                    )}
                     {!row.PaymentStatus && (
                         <Button variant={'contained'} onClick={() => openAcceptRegistration(row)} color={'primary'}>Inscribir</Button>
                     )}
                    </Box>
                </Paper>
            </Grid>
        )
    }
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display={'flex'} justifyContent={'center'} paddingY={2}>
                <Typography variant='h2'>Inscripciones a torneo</Typography>
            </Box>
            <Box display={'flex'} justifyContent={'space-between'} paddingBottom={2}>
                <Grid container spacing={2}>

                    <Grid item xs={12} lg={5} >
                        <SelectTournaments name='TournamentID' value={values.TournamentID} handleupdate={handleUpdate} />
                    </Grid>
                    <Grid item xs={12} lg={5} >
                        <SelectCategories name='CategoryID' value={values.CategoryID} handleupdate={handleUpdate} />
                    </Grid>
                    <Grid item xs={12} lg={5} >
                        <TextField
                            size='small'
                            fullWidth
                            label='Nombre(s)'
                            name='SearchString'
                            value={values.SearchString}
                            onChange={handleUpdate}
                        />
                    </Grid>
                    <Grid item xs={12} lg={5} >
                        <RadioGroup row value={values.Status} onChange={handleUpdate} name='Status' id='Status'>
                            <FormControlLabel value="1" control={<Radio color={'primary'} />} label={<Typography variant={'subtitle1'}>Todos {stats.Todos}</Typography>} />
                            <FormControlLabel value="2" control={<Radio color={'primary'} />} label={<Typography variant={'subtitle1'}>Inscritos {stats.Inscritos}</Typography>} />
                            <FormControlLabel value="3" control={<Radio color={'primary'} />} label={<Typography variant={'subtitle1'}>No inscritos {stats.NoInscritos}</Typography>} />
                        </RadioGroup>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Box display={'flex'} justifyContent={'flex-end'}>
                            <Button variant={'contained'} sx={{ marginRight: 2 }} onClick={loadData}>Aplicar filtro</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}>
                <Grid container spacing={2} paddingY={2}>
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
            <Dialog open={acceptRegistrationOpen} onClose={() => setAcceptRegistrationOpen(false)}  fullWidth={true} maxWidth={'sm'}>
                <AcceptRegistration row={currentRow.current} categoryid={values.CategoryID} tournamentid={values.TournamentID}  onclose={() => setAcceptRegistrationOpen(false)} reload={loadData}/>
            </Dialog>            
            <Dialog open={cancelRegistrationOpen} onClose={() => setCancelRegistrationOpen(false)}  fullWidth={true} maxWidth={'sm'}>
                <CancelRegistration row={currentRow.current} categoryid={values.CategoryID} tournamentid={values.TournamentID} onclose={() => setCancelRegistrationOpen(false)} reload={loadData}/>
            </Dialog>            

        </LocalizationProvider>
    )
}

