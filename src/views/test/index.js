import { Grid } from '@mui/material';
import React from 'react'
import CalculadoraLigas from 'views/Ligas/CalculadoraLigas';
import RenderCourt from 'views/Ligas/RenderCourt';

const index = () => {
  
  return (
    <div>
      <CalculadoraLigas />
      <Grid container spacing={2}>
        <Grid item xs={'auto'} >
          <RenderCourt players={['Juan jose Navarro Alvarez', 'Antonio Pedemonty', 'Fernando Gonzales', 'Maria Navarro']} />
        </Grid>
        <Grid item xs={'auto'}>
          <RenderCourt players={['Juana Maria Ramirez Rincon ', 'Antonio Pedemonty', 'Fernando Gonzales', 'Maria Navarro']} />
        </Grid>
        <Grid item xs={'auto'}>
          <RenderCourt players={['Jose David Torres Ayala', 'Antonio Pedemonty', 'Fernando Gonzales', 'Maria Navarro']} />
        </Grid>
        <Grid item xs={'auto'}>
          <RenderCourt players={['1 ', 'Antonio Pedemonty', 'Fernando Gonzales', 'Maria Navarro']} />
        </Grid>

      </Grid>
    </div>
  )
}

export default index