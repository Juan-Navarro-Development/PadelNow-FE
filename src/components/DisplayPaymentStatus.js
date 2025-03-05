import { Box, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { IconAccessible, IconAccessibleOff } from '@tabler/icons'

const DisplayPaymentStatus = (PaymentStatus) => {

    return (
        <Box alignContent={'flex-end'} display={'flex'} paddingRight={1} >
            {PaymentStatus && (
                <Tooltip describeChild title='Inscrito' arrow placement={'top'}>
                    <Typography variant='subtitle1' component='p' color={'#43a847'}><IconAccessible size={'30px'} /></Typography>
                </Tooltip>
            )}

            {!PaymentStatus && (
                <Tooltip describeChild title='No Inscrito' arrow placement={'top'}>
                    <Typography variant='subtitle1' component='p' color={'#f5252c'}><IconAccessibleOff size={'30px'} /></Typography>
                </Tooltip>
            )}
        </Box>
    )
}

export default DisplayPaymentStatus