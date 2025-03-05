import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import { useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Toolbar, AppBar, Typography } from '@mui/material';


const columns = [
    { id: 'Name', label: 'Nombre', minWidth: 100 },
    { id: 'Description', label: 'Descripcion', minWidth: 170 },
    {
        id: 'Address',
        label: 'Dirección',
        minWidth: 170,
        align: 'left',
        format: (value) => value.toLocaleString('en-US'),
    },
    {
        id: 'Contact',
        label: 'Contacto',
        minWidth: 170,
        align: 'center',
        format: (value) => value.toLocaleString('en-US'),
    },
    {
        id: 'Phone',
        label: 'Telefono',
        minWidth: 170,
        align: 'right',
        format: (value) => value.toFixed(2),
    },
];



export default function Browser() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [rows, setRows] = React.useState([]);


    const loadData = (newPage) => {
        axios.get('/v1/catalogs/clubs?page=' + newPage)
            .then((response) => {
                setRows(response.data.data)
            })
            .catch((error) => {
                console.log("Error:", error)
            })
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        loadData(newPage + 1)
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(1);
    };

    useEffect(() => {
        loadData(1)
    }, [])


    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <AppBar position="static">     <Toolbar>
                <Typography variant='h3' sx={{flexGrow:1}}>Listado de Clubs</Typography>
            </Toolbar>
            </AppBar>
            <MainCard >

                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: '85%' }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows
                                    .map((row, index) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={`r-${index}`}>
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={`${column.id}-${index}`} align={column.align}>
                                                            {column.format && typeof value === 'number'
                                                                ? column.format(value)
                                                                : value}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        count={-1}
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </MainCard>
        </Paper>
    );
}
