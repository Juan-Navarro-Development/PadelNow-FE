import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

const ImageRemovePage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('/v1/images/list');
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      setSnackbar({ open: true, message: 'Error al cargar las imágenes', severity: 'error' });
    }
  };

  const handleImageChange = (event) => {
    setSelectedImage(event.target.value);
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) {
      setSnackbar({ open: true, message: 'Por favor, selecciona una imagen', severity: 'warning' });
      return;
    }

    try {
      await axios.delete(`/v1/images/${selectedImage}`);
      setSnackbar({ open: true, message: 'Imagen eliminada con éxito', severity: 'success' });
      setSelectedImage('');
      fetchImages(); // Refresh the list of images
    } catch (error) {
      console.error('Error deleting image:', error);
      setSnackbar({ open: true, message: 'Error al eliminar la imagen', severity: 'error' });
    }
  };

  return (
    <MainCard title="Eliminar Imagen" minHeight={'300px'}>
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem' }}>
          <Box mb={2}>
            <Typography variant="h6">Selecciona una imagen para eliminar:</Typography>
          </Box>
          <Select
            fullWidth
            value={selectedImage}
            onChange={handleImageChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecciona una imagen
            </MenuItem>
            {images.map((image) => (
              <MenuItem key={image} value={image}>
                {image}
              </MenuItem>
            ))}
          </Select>
          <Button
            color="secondary"
            variant="contained"
            fullWidth
            onClick={handleDeleteImage}
            style={{ marginTop: '1rem' }}
          >
            Eliminar Imagen
          </Button>
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

export default ImageRemovePage;