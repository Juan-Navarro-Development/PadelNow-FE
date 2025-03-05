/* eslint-disable react-hooks/exhaustive-deps */
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'
import { LongDateFormat } from '../utils/DateUtils'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const SelectConsecutiveDays = (props) => {
    const alert = useAlert();
    const [rows, setRows] = useState([])

    dayjs.locale('es');

    const loadComboData = () => {
        let startDate = dayjs(props.startdate)
        const endDate = dayjs(props.enddate).add(1, 'day');

        let dates = [];
        let counter = 0;
        while (startDate.isBefore(endDate)) {
            dates.push({
                ID: startDate.format('YYYY-MM-DD'),
                Description: LongDateFormat(startDate)
            });
            startDate = startDate.add(1, 'day');
            counter++;
            if (counter > 100) {
                alert.error('Error al cargar las fechas');
                break;
            }
        }
        setRows(dates);
    }

    useEffect(() => {

        loadComboData();
    }, [props.startdate, props.enddate])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormControl size='small' fullWidth sx={{ marginRight: 2 }}>
                <InputLabel id="TournamentL">Fechas disponibles</InputLabel>
                <Select
                    labelId="TournamentL"
                    id={props.name}
                    name={props.name}
                    value={props.value}
                    label="Fechas disponibles"
                    onChange={props.handleupdate}>
                    <MenuItem value='' key='AllCategories'><Typography variant={'overline'}>Seleccione Fecha</Typography></MenuItem>
                    {rows.map((row) => {
                        return <MenuItem value={row.ID} key={'consec' +row.ID}>
                            <Typography variant={'overline'}>{row.Description}</Typography>
                        </MenuItem>
                    })}

                </Select>
            </FormControl>
        </LocalizationProvider>
    )
}

export default SelectConsecutiveDays