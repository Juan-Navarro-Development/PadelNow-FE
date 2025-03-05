import React from  'react';
import { Box } from '@mui/system';
import { Grid, Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';


const SelectPrintableColors = (props) => {
    const myColors = [
        { bgColor: '#00008b', textColor: '#d1c3fc' },
        { bgColor: '#ffffff', textColor: '#000080' },
        { bgColor: '#808080', textColor: '#ffffff' },
        { bgColor: '#d7d9ea', textColor: '#3f457a' },
        { bgColor: '#443477', textColor: '#01ffff' },
        { bgColor: '#e1f379', textColor: '#121926' },
    ]
    const {handleclose, print} = props;


    const printPDF = (item) => {
        print(item);
        handleclose();
    }
    return (
        <MainCard title='Selección de colores para impresión'>
            <Grid container spacing={2} paddingBottom={3}>
                {myColors.map((item, index) => (
                    <Grid item xs={12} md={4}>
                        <Box onClick={() =>printPDF (item)} bgcolor={item.bgColor} minHeight={'150px'} minWidth={'150px'} display={'flex'} alignItems={'center'} justifyContent={'center'} border='1px solid black'>
                            <Typography variant={'h1'} color={item.textColor}>Color {index +1 }</Typography>

                        </Box>
                    </Grid>

                ))}
             
            </Grid>
            <Box display={'flex'} justifyContent={'center'}>
                <Typography variant={'h6'}>De click en la combinación de color que desea para la impresión</Typography>
            </Box>
        </ MainCard>
    );
};

export default SelectPrintableColors;