/* eslint-disable no-unused-expressions,  array-callback-return, no-loop-func, no-unused-vars, react-hooks/exhaustive-deps */

import { Box, ImageList, ImageListItem } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert';
import { useNavigate } from 'react-router';
import ImageUploader from './ImageUploader';

const ImageCatalog = () => {
    const [images, setImages] = useState([]);
    const alert = useAlert();


    const loadImages = () => {
        let myURL = '/v1/utility/imageavailable';
        axios.get(myURL)
            .then((response) => {
                setImages(response.data.data)
            })
            .catch((error) => {
                alert.error("Error cargando imagenes...")
            })
    }

    useEffect(() => {
        loadImages();
    }, [])



    return (
        <Box>
            <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
                {images.map((item) => (
                    <ImageListItem key={item.img}>
                        <img
                            srcSet={`${item.Url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            src={`${item.Url}?w=164&h=164&fit=crop&auto=format`}
                            alt={item.Description}
                            loading="lazy"
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <ImageUploader />
        </Box>
    )
}

export default ImageCatalog