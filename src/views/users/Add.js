/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Button, DialogActions, DialogContent, DialogTitle, FormControl, Grid, TextField, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import axios from 'axios'
import LoadImageFromURL from 'components/LoadImageFromURL'
import SelectCategories from 'components/SelectCategories'
import SelectPermissions from 'components/SelectPermissions'
import React, { useEffect, useMemo, useState } from 'react'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router'
import dayjs from 'dayjs';
import { useFormik } from 'formik'
import * as Yup from 'yup';


const Add = (props) => {
    const navigate = useNavigate();
    const alert = useAlert();
    const { handleClose } = props

    const [myImage, setMyImage] = useState('');


    const validateForm = () => {

    }

    const createUser = (values) => {

        if (formik.values.GivenName === '' || Object.keys(formik.errors).length > 0){
            alert.error('Campos invalidos o requeridos...')
            return
        }
        const payload = {
            'Email': formik.values.Email,
            'Name': `${formik.values.GivenName}, ${formik.values.FamilyName}`,
            'FamilyName': formik.values.FamilyName,
            'GivenName': formik.values.GivenName,
            'MemberSince': formik.values.MemberSince.format('YYYY-MM-DDTHH:MM:ssZ'),
            'Birthday': formik.values.Birthday.format('YYYY-MM-DDTHH:MM:ssZ'),
            'PermissionID': formik.values.PermissionID,
            'CategoryID': formik.values.CategoryID,
            'Ranking': parseInt(formik.values.Ranking),
            "Phone": formik.values.Phone,
        }
        payload.HasPicture = formik.values.myImage ? '1' : '0';
        axios.post('/v1/catalogs/users', payload)
            .then((response) => {

                if (formik.values.myImage && formik.values.myImage !== '') {
                    imagePOST(response.data.ID)
                }
                handleClose();
            })
            .catch((error) => {
                alert.error('Error creando usuario, ' + error.message)
                console.log('Error al crear usuario')
                if (error.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })

        //    handleClose();
    }


    const imagePOST = (imageID) => {
        let formData = new FormData();
        formData.append("file", formik.values.myImage);
        formData.append("ID", imageID);
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
    };

    const UserValidationSchema = Yup.object().shape({
        GivenName: Yup.string()
            .min(2, 'Muy Corto!')
            .max(50, 'Muy Largo!')
            .required('Requerido!'),
        FamilyName: Yup.string()
            .min(2, 'Muy Corto!')
            .max(50, 'Muy Largo!')
            .required('Requerido!'),
        Phone: Yup.string()
            .min(8, 'Muy Corto!')
            .max(18, 'Muy Largo!')
            .required('Requerido!'),

        Email: Yup.string()
            .email('Correo Invalido')
            .required('Requerido'),

    });

    const formik = useFormik({
        initialValues: {
            CategoryID: '',
            GivenName: '',
            FamilyName: '',
            Email: '',
            Phone: '',
            PermissionID: '',
            Observations: '',
            Birthday: dayjs(),
            MemberSince: dayjs(),
            myImage: '',
            Ranking: '',
        },
        onSubmit: values => {
            createUser(values);
        },
        validationSchema: UserValidationSchema,
        validateOnBlur: true
    })



    return (
        <div>

            <DialogTitle align='center'  ><Typography sx={{ backgroundColor: 'lightgray' }}>Datos del jugador</Typography></DialogTitle>
            <DialogContent >

                <Grid container spacing={2} paddingTop={1} >
                    <Grid item xs={12} md={6}>
                        <TextField
                            size='small'
                            fullWidth
                            label='Nombre(s)'
                            name='GivenName'
                            value={formik.values.GivenName}
                            onChange={formik.handleChange}
                        />
                        {formik.errors.GivenName && <Typography variant={'caption'} fontSize={10} color={'red'}>{formik.errors.GivenName}</Typography>}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            size='small'
                            fullWidth
                            label='Apellido(s)'
                            name='FamilyName'
                            value={formik.values.FamilyName}
                            onChange={formik.handleChange}
                        />
                        {formik.errors.FamilyName && <Typography variant={'caption'} fontSize={10} color={'red'}>{formik.errors.FamilyName}</Typography>}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            size='small'
                            fullWidth
                            label='Telefono'
                            name='Phone'
                            value={formik.values.Phone}
                            onChange={formik.handleChange}
                        />
                        {formik.errors.Phone && <Typography variant={'caption'} fontSize={10} color={'red'}>{formik.errors.Phone}</Typography>}

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size='small'
                            label='Correo electronico'
                            name='Email'
                            value={formik.values.Email}
                            onChange={formik.handleChange}
                        />
                        {formik.errors.Email && <Typography variant={'caption'} fontSize={10} color={'red'}>{formik.errors.Email}</Typography>}

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectCategories
                            name='CategoryID'
                            value={formik.values.CategoryID}
                            handleupdate={formik.handleChange} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectPermissions
                            name='PermissionID'
                            value={formik.values.PermissionID}
                            handleupdate={formik.handleChange} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl size={'small'} fullWidth>
                            <DatePicker
                                format="DD/MM/YYYY"
                                label="Fecha de Ingreso"
                                name="MemberSince"
                                value={formik.values.MemberSince}
                                onChange={(value) => formik.setFieldValue('MemberSince', value, true)}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <DatePicker
                                format="DD/MM/YYYY"
                                size='small'
                                label="Fecha de Nacimiento"
                                name="Birthday"
                                value={formik.values.Birthday}
                                onChange={(value) => formik.setFieldValue('Birthday', value, true)}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type={'number'}
                            size='small'
                            label='Puntos'
                            id='Ranking'
                            name='Ranking'
                            value={formik.values.Ranking}
                            onChange={formik.handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                    </Grid>
                    <Grid item xs={12} alignItems={'center'}>
                        <LoadImageFromURL
                            loadimage
                            id="myImage"
                            name="myImage"
                            imageid={-1}
                            handleupdate={(value) => formik.setFieldValue('myImage', value.target.value, true)}
                            height='200px'
                        />
                    </Grid>
                </Grid>

            </DialogContent>
            <DialogActions>
                <Button variant='contained' color={'error'} onClick={handleClose}>Cancelar</Button>
                <Button variant='contained' color={'secondary'} onClick={createUser}>Crear</Button>
            </DialogActions>
        </div>
    )
}

export default Add