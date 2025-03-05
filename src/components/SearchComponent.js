import { InputAdornment, TextField } from '@mui/material';
import { IconSearch } from '@tabler/icons';
import React, { useState } from 'react'

const SearchComponent = (props) => {
    const [searchString, setSearchString] = useState('');
    const [timer, setTimer] = useState(null);


    const searchUpdated = e => {
        setSearchString(e.target.value)

        clearTimeout(timer)

        const newTimer = setTimeout(() => {
            props.callfunction(e.target.value, '')
        }, 500)

        setTimer(newTimer)
    }
    return (
        <TextField 
            fullWidth
            size='small'
            label='Buscar'
            id='SearchString'
            name='SearchString'
            value={searchString}
            onChange={searchUpdated}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconSearch />
                    </InputAdornment>
                )
            }}
        />
    )
}

export default SearchComponent