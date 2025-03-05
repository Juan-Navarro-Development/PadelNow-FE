/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Button, DialogActions, DialogContent, DialogTitle, FormControl, Grid, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import axios from 'axios'
import LoadImageFromURL from 'components/LoadImageFromURL'
import SelectCategories from 'components/SelectCategories'
import React, { useEffect, useState } from 'react'

const View = (props) => {
    const { handleClose } = props
    const { CategoryID, GivenName, FamilyName,Email,ID } = props.row
    const [values, setValues] = useState({
        CategoryID: '',
        GivenName: '',
        FamilyName: '',
        Email:'',
    });


    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const handleDateUpdate = (newValue, name) => {
        // setHasChanges(true);
        if (name && newValue) {
            setValues({ ...values, [name]: newValue });
        }
    };

    useEffect(() => {
        setValues({
            CategoryID: CategoryID,
            GivenName: GivenName,
            FamilyName: FamilyName,
            Email: Email,
            ID: ID
        })
    }, [])


    const createUser = () => {
        const payload = {

        }
    }


    const handleImageUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        if (name && value) {
            setValues({ ...values, [name]: value });
            let formData = new FormData();
            formData.append("file", value);
            formData.append("ID", "a401d49b-2961-4415-841f-5e38bd546f69");
            let header = {
                headers: {
                    "Content-Type": false,
                }
            }
            axios.post("/v1/utility/imageupload", formData, header)
                .then((response) => {
                    console.log("ok : ", response)
                })
                .catch((err) => {
                    console.log('Error: ', err)
                })
        }
    };


    return (
        <div>
            <DialogTitle align='center' variant=''>Datos de usuario</DialogTitle>
            <DialogContent >


                <Grid container spacing={3} >
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            style={{ marginTop: '10px' }}
                            label='Nombre(s)'
                            name='GivenName'
                            value={values.GivenName}
                            onChange={handleUpdate}
                        />

                    </Grid>
                    <Grid item xs={6}>

                        <TextField
                            style={{ marginTop: '10px' }}
                            fullWidth
                            label='Apellido(s)'
                            name='FamilyName'
                            value={values.FamilyName}
                            onChange={handleUpdate}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <SelectCategories name='CategoryID' value={values.CategoryID} handleupdate={handleUpdate} />

                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <DatePicker
                                label="Fecha de Nacimiento"
                                name="BirthDate"
                                value={values.Birthday}
                                onChange={(newValue) => handleDateUpdate(newValue, "Birthday")}
                            />
                        </FormControl>

                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            style={{ marginTop: '10px' }}
                            label='Correo electronico'
                            name='Email'
                            value={values.Email}
                            onChange={handleUpdate}
                        />

                    </Grid>
                    <Grid item xs={12} alignItems={'center'}>
                        <LoadImageFromURL
                            loadimage
                            id="myImage"
                            name="myImage"
                            imageid={values.ID}
                            imagename={props.Name}
                            height='200px'
                        />
                    </Grid>
                </Grid>

            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={handleClose}>Cancelar</Button>
            </DialogActions>
        </div>
    )
}

export default View