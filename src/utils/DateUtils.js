import dayjs from "dayjs"

const dayOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const LongDateFormat =(date)=> {
    const day = dayjs(date).date();
    const month = months[dayjs(date).month()];
    const year = dayjs(date).year();
    const dayWeek = dayOfWeek[dayjs(date).day()];
    return `${dayWeek}, ${day} de ${month} de ${year}`;
    
}

const ShortDayOfTheWeek = (date) => {
    const day = dayjs(date).date();
    const month = months[dayjs(date).month()];
    const dayWeek = dayOfWeek[dayjs(date).day()];

    return `${dayWeek}, ${day} de ${month}`
}       
export { LongDateFormat, ShortDayOfTheWeek }