import { Button, CardActionArea, CardContent, Grid, MenuItem, Select, TextField } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react'
import { useAlert } from 'react-alert';
import SubCard from 'ui-component/cards/SubCard';


const ImageUploader = () => {
    const alert = useAlert();
    const [file, setFile] = useState();
    const [values,setValues] = useState({
        Description: '',
        Type: '',
    })

    const uploadImage = async () => {
        let formData = new FormData();
        formData.append("filedata", file);
        let header = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        const myUrl = 'https://dev.padel-now.app/api/admin/manager/upload_img.php'
        axios.post(myUrl, formData, header)
            .then((response) => {
                console.log("ok : ", response)
                // registrar imagen en BD
                let URL = response.data.img;
                if (URL && URL.length >0 ){

                    let payload = {
                        "Description": values.Description,
                        "Type": values.Type,
                        "URL": URL
                    }
                    axios.post('/v1/utility/imageavailable', payload)
                    .then ((response) => {
                        alert.success('Image subida Exitosamente')
                    })
                    .catch((error) => {
                        alert.error(' Error al registrar imagen en BD')
                    })
                }
            })
            .catch((err) => {
                console.log('Error: ', err)
                alert.error('Error al subir imagen')

            })
    }

    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    function handleChange(e) {
        console.log(e.target.files);
        setFile(e.target.files[0]);
    }

    return (
        <SubCard title={'Subir Imagen'} darkTitle>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField 
                        id="Description" 
                        name="Description"
                        placeholder='Descripción'
                        onChange={handleUpdate}
                        value={values.Description} 
                        fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <Select 
                        id="ImageType" 
                        placeholder='Tipo de Imagen' fullWidth 
                        value={values.Type}
                        name="Type"
                        onChange={handleUpdate}>

                            <MenuItem value='' >Seleccione tipo de imagen</MenuItem>
                            <MenuItem value='Logo' >Logo</MenuItem>
                            <MenuItem value='Background' >Fondo de pagina</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField type="file" onChange={handleChange} fullWidth />
                    </Grid>
                </Grid>
            </CardContent>
            <CardActionArea>
                <Button onClick={uploadImage} variant={'contained'}> Subir imagen</Button>

            </CardActionArea>
        </SubCard>
    );
}


export default ImageUploader