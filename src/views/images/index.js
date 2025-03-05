import React from 'react'
import ImageUploadPage from './ImageUploadPage'
import ImageViewerPage from './ImageViewerPage'
import ImageRemovePage from './ImageRemovePage'
import { Grid } from '@mui/material'

const index = () => {
  return (
    <Grid container spacing={2} >
        <Grid item size={{ xs: 12, md: 6 }} >
          <ImageUploadPage/>
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <ImageViewerPage/>
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <ImageRemovePage/>
        </Grid>
      </Grid>
  )
}

export default index