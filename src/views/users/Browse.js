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
import { AppBar, Button, Dialog, Grid, TextField, Toolbar, Typography } from '@mui/material';
import { IconEdit, IconEye } from '@tabler/icons';
import { useState } from 'react';
import Add from './Add';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router';
import { useAlert } from 'react-alert';
import SelectCategories from 'components/SelectCategories';
import SelectPermissions from 'components/SelectPermissions';


const columns = [
    { id: 'GivenName', label: 'Nombre', minWidth: 100 },
    { id: 'FamilyName', label: 'Apellido', minWidth: 100 },
    { id: 'Ranking', label: 'Puntos', minWidth: 50 },
    { id: 'CategoryDescription', label: 'Categoria', minWidth: 100 },
    { id: 'PermissionDescription', label: 'Permisos', minWidth: 100 },
    { id: 'actions', label: 'Acciones', minWidth: 30, FormatDisplay: 'actions', align: 'center' }
];


export default function Browser() {
    const navigate = useNavigate();
    const alert = useAlert();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRows] = useState([]);
    const [values, setValues] = useState({
        CategoryID: '',
        PermissionID: '',
        SearchString: ''
    });
    const [modalOpen, setModalOpen] = React.useState(false);
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [viewOpen, setViewOpen] = React.useState(false);
    const [addOpen, setAddOpen] = React.useState(false);
    const [updateOpen, setUpdateOpen] = React.useState(false);



    const loadData = (newPage) => {
        let myURL = '/v1/catalogs/users?page=' + newPage;
        if (values.CategoryID && values.CategoryID.length > 0) {
            myURL += `&CategoryID=${values.CategoryID}`
        }

        if (values.PermissionID && values.PermissionID.length > 0) {
            myURL += `&PermissionID=${values.PermissionID}`
        }
        if (values.SearchString && values.SearchString.length > 0) {
            myURL += `&SearchString=${values.SearchString}`
        }
        axios.get(myURL)
            .then((response) => {
                setRows(response.data.data)
            })
            .catch((error) => {
                console.log("Error:", error)
                alert.error('Error leyendo usuarios')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
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
        loadData(1);
    }, [])


    const openView = (value) => {
        console.log("View ", value)
    }
    const openAdd = (value) => {
        console.log("View ", value)
    }

    const openUpdate = (value) => {
        console.log("Update ", value)
        setUser(value);
        setModalOpen(true);
    }


    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const formatDataValue = (definition, value) => {
        let result = '';
        switch (definition.FormatDisplay) {
            case 'Text':
                result = value[definition.id];
                break;
            /*         case 'Check':
                       return value[definition.FieldName] === 1 ? (
                         <IconX name="simple-icon-check" />
                       ) : (
                         <IconX name="simple-icon-close" />
                       );
               
              */
            case 'Date':
                const myDate = new Date(value[definition.id]);
                result = myDate.toLocaleDateString();
                
                break;
            case 'DateTime':
                const myDateTime = new Date(value[definition.id]);
                result = `${myDateTime.toLocaleDateString()} ${myDateTime.toLocaleTimeString()}`;
                break;
            /*        case 'Image':
                        return (
                        
                            <LoadImageFromURL
                            id={`at-row-${value.ID || ''}`}
                            height="100"
                            picurl={`/rest/api/v4/system/general/image?max_age=5&target=${definition.Target}&id=${value[definition.FieldName]}`}
                            alt="blob"
                            />
                        
                        );
              */
            case 'number':
                return <Typography>{value[definition.id]}</Typography>;
            case 'actions':
                return (
                    <div className="d-flex justify-content-around align-items-center">
                        {/*    <IconX name="simple-icon-eye" onClick={() => onViewClick(value)} />{' '} */}
                        <IconEye onClick={() => openView(value)} />
                        <IconEdit onClick={() => openUpdate(value)} />
                    </div>
                );

            default:
                result = value[definition.id];
                break;
        }
        return result;
    };


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Grid container spacing={2} paddingX={2} paddingY={2}>
                    <Grid item xs={12} md={3} lg={3} >
                        <TextField
                            size='small'
                            fullWidth
                            label='Buscar'
                            name='SearchString'
                            value={values.SearchString}
                            onChange={handleUpdate}
                        />
                    </Grid>
                    <Grid item xs={12} md={3} lg={3} >
                        <SelectCategories
                            name='CategoryID'
                            value={values.CategoryID}
                            label="Category"
                            handleupdate={handleUpdate} />

                    </Grid>
                    <Grid item xs={12} md={3} lg={2} >
                        <SelectPermissions
                            name='PermissionID'
                            value={values.PermissionID}
                            label="Permisos"
                            handleupdate={handleUpdate} />


                    </Grid>
                    <Grid item xs={12} md={1} lg={1} >
                        <Button variant={'contained'} onClick={() => loadData(1)}>Buscar</Button>
                    </Grid>
                    <Grid item xs={12} md={1} lg={1} >
                        <Button variant={'contained'} onClick={() => setAddOpen(true)} >Nuevo</Button>
                    </Grid>
                </Grid>
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
                                        .map((row) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={row.ID}>
                                                    {columns.map((column) => {
                                                        return (
                                                            <TableCell key={column.id} align={column.align}>
                                                                {formatDataValue(column, row)}
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
                <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
                    <Add />
                </Dialog>
            </Paper>
        </LocalizationProvider>
    );
}

