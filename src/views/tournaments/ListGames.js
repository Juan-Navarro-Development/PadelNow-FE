import { Divider, FormControl, Grid, InputLabel, List, ListItem, MenuItem, Select } from '@mui/material'
import { IconEye,IconCircle } from '@tabler/icons';
import axios from 'axios';
import React from 'react'
import { useAlert } from 'react-alert';
import { useNavigate } from 'react-router';
import SubCard from 'ui-component/cards/SubCard';

const ListGames = props => {
    const alert = useAlert();
    const navigate = useNavigate();
    const [values, setValues] = React.useState({});
    const [games, setGames ]  = React.useState({});
    const { categories } = props

    
    const handleUpdate = (e) => {
        // setHasChanges(true);
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        if (name && name != "" && value && value != ""){
            LoadGames(value);
        }

    };

    const LoadGames = ( CategoryID) =>{
        let myPromises = [
            axios.get('/v1/catalogs/categories?limit=-1'),
        ]
        Promise.all(myPromises)
            .then((responses) => {
                setGames(responses[0].data.data);
               })
            .catch((err) => {
                alert.error('Error leyendo Juegos')
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }

    const GameDisplay = (game) => {

    }
    return (
        <div>
            <SubCard title="Juegos no asignados">
                <FormControl fullWidth>
                    <InputLabel id="Category">Categoria</InputLabel>
                    <Select
                        labelId="Categoryl"
                        id="CategoryL"
                        name="category"
                        value={values.category}
                        label="Category"
                        onChange={handleUpdate}
                    >
                        {categories.map((row) => {
                            return <MenuItem value={row.ID} color={row.Color}>
                                <Grid container xs={12}>
                                    <Grid item xs ={11}>{row.Description}</Grid>
                                    <Grid item xs={1}><IconCircle color={row.Color} /></Grid>
                                </Grid>
                            </MenuItem>
                        })}
                    </Select>
                </FormControl>

            </SubCard>
            <Divider />
            <List>
                <ListItem>
                    {values.category}
                </ListItem>
                
            </List>

        </div>
    )
}


export default ListGames