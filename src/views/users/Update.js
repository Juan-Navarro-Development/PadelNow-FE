/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Button, DialogActions, DialogContent, DialogTitle, FormControl, Grid, TextField, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import axios from 'axios'
import LoadImageFromURL from 'components/LoadImageFromURL'
import SelectCategories from 'components/SelectCategories'
import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs';
import { RowingSharp } from '@mui/icons-material'
import SelectPermissions from 'components/SelectPermissions'

const Update = (props) => {
  const { handleClose, row } = props
  const [values, setValues] = useState({
    CategoryID: props.row.CategoryID,
    GivenName: props.row.GivenName,
    FamilyName: props.row.FamilyName,
    Email: props.row.Email,
    PermissionID: props.row.PermissionID,
    Phone: props.row.Phone,
    Observations: props.row.Observations,
    MemberSince: dayjs(props.row.MemberSince),
    Birthday: dayjs(props.row.Birthday),
    myImage: '',
    Ranking: props.row.Ranking,
    HasPicture: props.row.HasPicture,
    IdekaClientID: row.IdeikaClientID
  });
  const [myImage, setMyImage] = useState('');


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



  const updateUser = () => {
    const payload = {
      'ID': row.ID,
      'Email': values.Email,
      'Name': `${values.GivenName}, ${values.FamilyName}`,
      'FamilyName': values.FamilyName,
      'GivenName': values.GivenName,
      'Phone': values.Phone,
      'Birthday': values.Birthday.format('YYYY-MM-DDTHH:MM:ssZ'),
      'MemberSince': values.MemberSince.format('YYYY-MM-DDTHH:MM:ssZ'),
      'PermissionID': values.PermissionID,
      'CategoryID': values.CategoryID,
      'IdeikaClientID': row.IdeikaClientID,
      'Ranking': parseInt(values.Ranking),
    }
    if (values.myImage.size) {
      payload.HasPicture = 1;
    }
    axios.put('/v1/catalogs/users', payload)
      .then((response) => {

        if (values.myImage && values.myImage !== '') {
          imagePOST(row.ID)
        }
        handleClose();
      })
      .catch((err) => {
        console.log('Error al crear usuario')
      })

  }


  const imagePOST = (imageID) => {
    let formData = new FormData();
    formData.append("file", values.myImage);
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


  return (
    <div>
      <DialogTitle align='center'  ><Typography sx={{ backgroundColor: 'lightgray' }}>Datos del atleta</Typography></DialogTitle>
      <DialogContent >
        <Grid container spacing={2} paddingTop={1} >
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              fullWidth
              label='Nombre(s)'
              name='GivenName'
              value={values.GivenName}
              onChange={handleUpdate}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              fullWidth
              label='Apellido(s)'
              name='FamilyName'
              value={values.FamilyName}
              onChange={handleUpdate}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size='small'
              fullWidth
              label='Telefono'
              name='Phone'
              value={values.Phone}
              onChange={handleUpdate}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size='small'
              label='Correo electronico'
              name='Email'
              value={values.Email}
              onChange={handleUpdate}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectCategories name='CategoryID' value={values.CategoryID} handleupdate={handleUpdate} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectPermissions name='PermissionID' value={values.PermissionID} handleupdate={handleUpdate} />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl size={'small'} fullWidth>
              <DatePicker
                format="DD/MM/YYYY"
                label="Miembro Desde"
                name="MemberSince"
                value={values.MemberSince}
                onChange={(newValue) => handleDateUpdate(newValue, "MemberSince")}
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
                value={values.Birthday}
                onChange={(newValue) => handleDateUpdate(newValue, "Birthday")}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              disabled
              size='small'
              label='IDEIKA'
              id='IdeikaClientID'
              name='IdeikaClientID'
              defaultValue={row.IdeikaClientID}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type={'number'}
              size='small'
              label='Puntos'
              id='Ranking'
              name='Ranking'
              value={values.Ranking}
              onChange={handleUpdate}
            />
          </Grid>

          <Grid item xs={12} alignItems={'center'}>
            <LoadImageFromURL
              loadimage
              id="myImage"
              name="myImage"
              imageid={props.row.ID}
              handleupdate={handleUpdate}
              height='200px'
            />
          </Grid>
        </Grid>

      </DialogContent>
      <DialogActions>
        <Button variant='contained' color={'error'} onClick={handleClose}>Cancelar</Button>
        <Button variant='contained' color={'secondary'} onClick={updateUser}>Actualizar</Button>
      </DialogActions>
    </div>
  )
}

export default Update