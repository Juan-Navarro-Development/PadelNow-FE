import { Grid } from '@mui/material'
import { Box } from '@mui/system'
import GetImageFromURL from 'components/GetImageFromURL'
import React from 'react'

const PrintableLayout = (props) => {
    return (
        <div
            {...props}
            style={{
                backgroundImage: `url("/v1/utility/image?name=fondocup&folder=sponsors")`,
                backgroundPositionY: '-75px',
                backgroundRepeat: "no-repeat",
                backgroundSize: 'cover',
                width: '800px',
                height: '1200px'
            }} >
            <Box marginTop={5} height={'250px'}>
                <Grid container  >
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='leftHeader' width={'200px'} />
                    </Grid>
                    <Grid item xs={4}>
                    </Grid>
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='rightHeader' width={'200px'} />
                    </Grid>
                </Grid>
            </Box>
            <Box id='WorkArea' sx={{ marginTop: '100px' }} display={'flex'} height={'500px'}>
                {props.children}
            </Box>
            <Box marginTop={5} height={'250px'}>
                <Grid container  >
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='suerox' width={'120px'} />
                    </Grid>
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='' width={'120px'} />
                    </Grid>
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='volka' width={'120px'} />
                    </Grid>
                    {/* segundo renglon */}
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='hornet' width={'120px'} />
                    </Grid>
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='' width={'120px'} />
                    </Grid>
                    <Grid item xs={4} alignItems={'center'} display={'flex'} justifyContent={'center'}>
                        <GetImageFromURL folder='sponsors' name='ABG' width={'120px'} />
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
}

export default PrintableLayout