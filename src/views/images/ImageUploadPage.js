import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Snackbar,
  Alert,
  Input,
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';

const validationSchema = Yup.object({
  id: Yup.string().required('ID es requerido'),
  name: Yup.string().required('Nombre es requerido'),
  image: Yup.mixed().required('Imagen es requerida'),
});

const ImageUploadPage = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formik = useFormik({
    initialValues: {
      id: '',
      name: '',
      image: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('id', values.id);
        formData.append('name', values.name);
        formData.append('file', values.image);

      let response = await axios.post('/v1/images/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setSnackbar({ open: true, message: 'Imagen subida exitosamente' , severity: 'success' });
        formik.resetForm();
        console.log('Response', response.data); 
        // TODO almacenar el nombre de la imagen en la base de datos o utilizarlo para mostrarla en el frontend.

      } catch (error) {
        console.error('Error al subir la imagen:', error);
        setSnackbar({ open: true, message: 'Error al subir la imagen', severity: 'error' });
      }
    },
  });

  const handleImageChange = (event) => {
    formik.setFieldValue('image', event.currentTarget.files[0]);
  };

  return (
    <MainCard title="Subir Imagen" minHeight={'300px'}>
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem' }}>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="id"
              name="id"
              label="ID"
              value={formik.values.id}
              onChange={formik.handleChange}
              error={formik.touched.id && Boolean(formik.errors.id)}
              helperText={formik.touched.id && formik.errors.id}
              margin="normal"
            />
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Nombre"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
            />
            <Box mt={2}>
              <Input
                type="file"
                inputProps={{ accept: 'image/*' }}
                onChange={handleImageChange}
              />
              {formik.touched.image && formik.errors.image && (
                <Typography color="error">{formik.errors.image}</Typography>
              )}
            </Box>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              style={{ marginTop: '1rem' }}
            >
              Subir Imagen
            </Button>
          </form>
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default ImageUploadPage;