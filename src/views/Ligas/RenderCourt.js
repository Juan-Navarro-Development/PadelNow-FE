import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

const CourtBox = styled(Box)(({ theme }) => ({
    backgroundColor: '#077dfd', // Light green color for the court
    minHeight: '300px',
    minWidth: '400px',
    border: '5px solid white',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
}));

const CourtLine = styled(Box)({
    backgroundColor: 'white',
    position: 'absolute',
});

const PlayerBox = styled(Box)(({ theme }) => ({
    width: '140px',
    height: '80px',
    backgroundColor: 'rgba(255, 255, 255)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
    zIndex: 1,
}));

const RenderCourt = ({ players }) => {
    return (
        <>
            <Box display="flex" justifyContent="space-around" width="100%">
                <Typography variant="h2" component={'div'}>6</Typography>
                <Typography variant="h2" component={'div'}>4</Typography>

            </Box>
            <CourtBox>
                {/* Court lines */}
                <CourtLine sx={{ top: '50%', left: 0, right: 0, height: '2px' }} /> {/* Center line */}
                <CourtLine sx={{ top: 0, bottom: 0, left: '50%', width: '2px' }} /> {/* Net */}
                <CourtLine sx={{ top: '0px', bottom: '0px', left: '20%', width: '2px' }} /> {/* Singles sideline */}
                <CourtLine sx={{ top: '0px', bottom: '0px', right: '20%', width: '2px' }} /> {/* Singles sideline */}

                {/* Players */}
                <Box display="flex" justifyContent="space-between" width="100%">
                    <PlayerBox>
                        <Typography display={'flex'} textAlign={'center'} variant="body2" style={{wordBreak: 'break-word'}} component={'div'} >{players?.[0] || 'Player 1'}</Typography>
                    </PlayerBox>
                    <PlayerBox>
                        <Typography variant="body2">{players?.[1] || 'Player 2'}</Typography>
                    </PlayerBox>
                </Box>
                <Box display="flex" justifyContent="space-between" width="100%">
                    <PlayerBox>
                        <Typography variant="body2">{players?.[2] || 'Player 3'}</Typography>
                    </PlayerBox>
                    <PlayerBox>
                        <Typography variant="body2">{players?.[3] || 'Player 4'}</Typography>
                    </PlayerBox>
                </Box>
            </CourtBox>
        </>
    );
};

export default RenderCourt;