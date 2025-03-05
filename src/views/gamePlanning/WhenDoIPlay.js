/*  eslint-disable  react-hooks/exhaustive-deps*/
import { Grid, Typography } from '@mui/material'
import { Box } from '@mui/system'
import axios from 'axios'
import SearchComponent from 'components/SearchComponent'
import SelectTournaments from 'components/SelectTournament'
import React, { useEffect } from 'react'
import { useAlert } from 'react-alert'
import MainCard from 'ui-component/cards/MainCard'
import { getCategoryColor } from 'assets/categoryColors';
import PerfectScrollbar from 'react-perfect-scrollbar';
import dayjs from 'dayjs';

const WhenDoIPlay = () => {
    const alert = useAlert();
    const [rows, setRows] = React.useState([]);
    const [values, setValues] = React.useState({
        TournamentID: '',
        SearchStr: '',
    })

    const handleUpdate = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        })
    }

    const cellWidth = 270;
    const cellHeight = 200;

    const filterTournamentGamesByUser = (searchStr) => {
        console.log('filterTournamentGamesByUser: ', searchStr);
        if (searchStr.length < 3) {
            setRows([]);
            return;
        }
        axios.get(`/v1/tournament/listgames?TournamentID=${values.TournamentID}&SearchStr=${searchStr}`)
            .then((response) => {
                setRows(response.data.data.sort((a, b) => a.StartTime > b.StartTime ? 1 : -1));
            })
            .catch((error) => {
                alert.error('Error al cargar los juegos del torneo');
                console.log('filterTournamentGamesByUser error: ', error);
            })
    }

    useEffect(() => {
        filterTournamentGamesByUser(values.SearchStr);
    }, [values.SearchStr])

    return (
        <MainCard title="Cuando me toca jugar ?">
            <Grid container spacing={1}>
                <Grid item xs={12} md={6} lg={4} xl={3}>

                    <SelectTournaments
                        name='TournamentID'
                        value={values.TournamentID}
                        label="Torneo"
                        handleupdate={handleUpdate} />
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <SearchComponent callfunction={(searchStr) => {
                        setValues({ ...values, SearchStr: searchStr });
                        filterTournamentGamesByUser(searchStr);
                    }}
                    />
                </Grid>
            </Grid>
            <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 290px)', overflow: 'visible' }} >
                <Grid container spacing={3} paddingTop={3}>
                    {rows.length > 0 ? (

                        rows.map((row) => (
                            <>
                                <Grid item xs={12} sm={6} lg={4} xl={3}>
                                    <Box

                                        width={`${cellWidth - 10}px`}
                                        height={`${cellHeight - 40}px`}
                                        border={`1px solid ${getCategoryColor(row.CategoryID).bgColor}`}
                                        paddingBottom={1}
                                        borderRadius={'5px'}
                                    >

                                        <Box bgcolor={getCategoryColor(row.CategoryID).bgColor}>
                                            <Typography
                                                display={'flex'}
                                                alignItems={'center'}
                                                justifyContent={'center'}
                                                variant={'caption'}
                                                color={getCategoryColor(row.CategoryID).textColor} fontWeight={500}
                                            >
                                                {`${row.CategoryDescription}-G${row.GroupNumber} `}
                                            </Typography>
                                        </Box>
                                        <Box >
                                            <Typography
                                                display={'flex'}
                                                alignItems={'center'}
                                                justifyContent={'center'}
                                                variant={'caption'}
                                                color={getCategoryColor(row.CategoryID).textColor} fontWeight={500}
                                            >
                                                {row.StartTime === '0001-01-01T00:00:00Z' ? 'N/A' : dayjs(row.StartTime).format('DD/MM')}
                                            </Typography>
                                        </Box>
                                        <Box >
                                            <Typography
                                                display={'flex'}
                                                alignItems={'center'}
                                                justifyContent={'center'}
                                                variant={'caption'}
                                                color={getCategoryColor(row.CategoryID).textColor} fontWeight={700}
                                            >
                                                {row.StartTime === '0001-01-01T00:00:00Z' ? 'N/A' : dayjs(row.StartTime).format('hh:mm A')}
                                            </Typography>
                                        </Box><Box display={'flex'}
                                            flexDirection={'column'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                        >

                                            <Box  >
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }} >{row.Team1Name1}</Typography>
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }} >{row.Team1Name2}</Typography>
                                            </Box>

                                            <Typography variant={'caption'} >vs</Typography>

                                            <Box >
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{row.Team2Name1}</Typography>
                                                <Typography variant={'subtitle2'} style={{ color: 'black' }}>{row.Team2Name2}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            </>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant={'h3'} textAlign={'center'}>No hay resultados para mostrar</Typography>
                        </Grid>
                    )}
                </Grid>
            </PerfectScrollbar >

        </MainCard>

    )
}

export default WhenDoIPlay