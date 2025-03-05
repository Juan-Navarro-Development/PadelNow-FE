/* eslint-disable jsx-a11y/alt-text, func-names, no-unused-vars, no-shadow */
/* eslint-disable react-hooks/exhaustive-deps, */
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Dropzone from 'react-dropzone';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'
import { IconRotate, IconAspectRatio } from '@tabler/icons';
import { Button, Grid, Slider, Stack } from '@mui/material';
import './styles.css'

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: 'black',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const focusedStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

function ImageCropper({ setFinalImage, setIsPreviewOpen, closeImageLoader, aspectRatio }) {
  const maxSize = 20000000;
  const acceptedFileTypes = 'image/x-png, image/png, image/jpg, image/jpeg, image/gif, image/webp';
  const acceptedFileTypesArray = acceptedFileTypes.split(',').map((item) => item.trim());
  const [srcImage, setSrcImage] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [rotationValue, setRotationValue] = useState(0);
  const [zoomValue, setZoomValue] = useState(1.0);
  const canvasRef = useRef();
  const imageRef = useRef();
  const [crop, setCrop] = useState({ x: 0, y: 0 })

  const isDragAccept = true;
  const isDragReject = true;
  const isFocused = true;

  const changeZoomValue = (value) => {
    setZoomValue(value);
  }

  const changeRotationValue = (value) => {
    setRotationValue(value);
  }
  const verifyFile = (files) => {
    if (files && files.length > 0) {
      const currentFile = files[0];
      const currentFileSize = currentFile.size;
      const currentFileType = currentFile.type;
      if (currentFileSize > maxSize) {
        //CreateNotification('error', t('Generic.FileTooLarge'), '')
        return false;
      }
      if (!acceptedFileTypesArray.includes(currentFileType)) {
        // CreateNotification('error', t('Generic.FileTypeInvalid'), '');
        return false
      }
      return true
    }
    return false
  }

  const onDrop = (files, rejectedFiles) => {
    if (files && files.length > 0) {
      const fileValid = verifyFile(files);
      if (fileValid) {
        const currentFile = files[0];
        const myFileReader = new FileReader();
        myFileReader.addEventListener('load', () => {
          setSrcImage(myFileReader.result);
        }, false)
        myFileReader.readAsDataURL(currentFile);
      }
    }
    if (rejectedFiles.length > 0) {
      //  CreateNotification('error', t('Generic.FileTooLarge'))
      console.log('Error on selected file : ', rejectedFiles[0].errors[0].code)
    }
  }

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        srcImage,
        croppedAreaPixels,
        rotationValue
      )
      console.log('donee', { croppedImage })
      setFinalImage(croppedImage);
      setIsPreviewOpen(true);
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, rotationValue])


  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  return (


    <Grid container spacing={3}>
      <Grid item xs={6} textAlign={'center'} alignContent={'center'}>
        <IconAspectRatio />
        <Slider value={zoomValue}
          min={1}
          max={7}
          step={0.1}
          marks
          aria-labelledby="Zoom"
          onChange={(e, zoom) => changeZoomValue(zoom)}
          classes={{ container: 'slider' }}
        />
      </Grid>
      <Grid item xs={6} textAlign={'center'} alignContent={'center'}>
        <IconRotate />
        <Slider value={rotationValue}
          min={0}
          max={360}
          step={5}
          aria-labelledby="Zoom"
          onChange={(e, rotation) => changeRotationValue(rotation)}
          classes={{ container: 'slider' }}
        />
      </Grid>

      <Grid item xs={12}>
        <Dropzone onDrop={onDrop} maxSize={maxSize} multiple={false} acceptedFileTypes={acceptedFileTypes}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps(style)}>
                <input {...getInputProps()} />
                <div style={style} >
                  Arrastre Imagen o de click para seleccionar de dispositivo
                </div>
              </div>
            </section>
          )}
        </Dropzone>

      </Grid>

      <Grid item xs={12} style={{ height: '400px' }}>
        {srcImage !== null
          ? <div className='crop-container' >
            <Cropper
              image={srcImage}
              crop={crop}
              rotation={rotationValue}
              zoom={zoomValue}
              maxZoom={7}
              aspect={1}
              onCropChange={setCrop}
              onRotationChange={setRotationValue}
              onCropComplete={onCropComplete}
              onZoomChange={setZoomValue}
            />

          </div>
          : ''

        }
      </Grid>
      <Grid item xs={12} >
        <Stack spacing={2} direction='row' justifyContent='end' paddingTop={3}>
          <Button onClick={closeImageLoader} variant='contained'>cancelar</Button>
          <Button onClick={showCroppedImage} variant='contained'>aceptar</Button>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default ImageCropper;