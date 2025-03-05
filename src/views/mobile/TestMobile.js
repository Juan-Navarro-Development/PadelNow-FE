import React from 'react'
import { BrowserView, MobileView } from 'react-device-detect';

import WhenDoIPlay from 'views/gamePlanning/WhenDoIPlay';
import { Box } from '@mui/material';


const TestMobile = () => {
    return (
        <div>
            <BrowserView>
                <WhenDoIPlay />
            </BrowserView>
            <MobileView>
                <Box sx={{ px: 2 }}>
                    <WhenDoIPlay />
                </Box>
            </MobileView>
        </div>
    )
}

export default TestMobile