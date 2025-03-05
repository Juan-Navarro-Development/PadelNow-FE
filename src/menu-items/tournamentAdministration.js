// assets
import { IconBrandChrome, IconBeach, IconUser, IconUsers, IconTournament, IconUserPlus, IconCalendarStats, IconAffiliate, IconAbacus, IconCalendarEvent, IconCalendarOff, IconCalendar } from '@tabler/icons';

// constant
const icons = { IconCalendar, IconCalendarOff, IconCalendarEvent, IconAbacus, IconBrandChrome, IconBeach, IconUser, IconUsers, IconTournament, IconUserPlus, IconCalendarStats, IconAffiliate };
// ==============================|| MENU Adminstracion ||============================== //

const TournamentOperationsMenu = {
    id: 'Operations',
    title: 'Operaciones',
    type: 'group',
    children: [
      {
            id: 'GroupAdmin1',
            title: 'Grupos',
            type: 'collapse',
            icon: icons.IconUsers,
            children: [
                {
                    id: 'Crear Timeslots',
                    title: 'Crear Timeslots',
                    type: 'item',
                    url: '/views/tournament/createtimeslots',
                    icon: icons.IconCalendar,
                    breadcrums: true
                },
                {
                    id: 'Crear Grupos',
                    title: 'Crear Grupos',
                    type: 'item',
                    url: '/views/tournament/creategroups',
                    icon: icons.IconUsers,
                    breadcrums: true
                },
                {
                    id: 'DisplayGroups',
                    title: 'Editar Grupos',
                    type: 'item',
                    url: '/views/groups/draw',
                    icon: icons.IconCalendarStats,
                    breadcrums: true

                },
                {
                    id: 'CreateGames',
                    title: 'Crear Juegos',
                    type: 'item',
                    url: '/views/groups/creategames',
                    icon: icons.IconCalendarStats,
                    breadcrums: true

                },
 /*                {
                    id: 'Parejas',
                    title: 'Editar Parejas',
                    type: 'item',
                    url: 'views/tournament/teamsenrolled',
                    icon: icons.IconCalendarStats,
                    breadcrums: true

                },
 */                
            ]
        },
        {
            id: 'CalendarsAdmin1',
            title: 'Calendario',
            type: 'collapse',
            icon: icons.IconCalendarStats,
            children: [
                {
                    id: 'ScheduleRestrictions',
                    title: 'Restricciones horarias',
                    type: 'item',
                    url: '/views/gameplanning/restrictions',
                    icon: icons.IconCalendarOff,
                    breadcrums: true

                },
                {
                    id: 'Calendario',
                    title: 'Calendario Juegos',
                    type: 'item',
                    url: '/views/gameplanning',
                    icon: icons.IconCalendarEvent,
                    breadcrums: true

                },
                {
                    id: 'CalendarioMinimal',
                    title: 'Calendario Juegos (F)',
                    type: 'item',
                    url: '/views/drawcalendarminimal',
                    icon: icons.IconCalendarEvent,
                    breadcrums: true

                },
                {
                    id: 'DailyGames',
                    title: 'Partidos diarios (W)',
                    type: 'item',
                    url: '/views/gameplanning/drawgamecalendar',
                    icon: icons.IconCalendarOff,
                    breadcrums: true

                },
                {
                    id: 'GamesByDate',
                    title: 'Rol  de juegos',
                    type: 'item',
                    url: '/views/gameplanning/gamesrol',
                    icon: icons.IconCalendar,
                    breadcrums: true

                },
                {
                    id: 'WhenDoIPlay',
                    title: 'Cuando son mis partidos',
                    type: 'item',
                    url: '/views/gameplanning/whendoiplay',
                    icon: icons.IconCalendar,
                    breadcrums: true

                },
 
            ]
        },
        {
            id: 'ResultsAdmin1',
            title: 'Resultados',
            type: 'collapse',
            icon: icons.IconAbacus,
            children: [
                {
                    id: 'GroupResults',
                    title: 'Resultados por Grupo',
                    type: 'item',
                    url: '/views/roundrobinwinner',
                    icon: icons.IconTournament,
                    breadcrums: true

                },
                {
                    id: 'Playoffs',
                    title: 'Eliminatorias',
                    type: 'item',
                    url: '/views/playoffs/DrawBrackets',
                    icon: icons.IconTournament,
                    breadcrums: true

                },
                {
                    id: 'AddRankingPoints',
                    title: 'Actualizar puntos(W)',
                    type: 'item',
                    url: '/views/pointsawarded',
                    icon: icons.IconTournament,
                    breadcrums: true

                },
            
            ]
        }, 
         {
            id: 'AdminSection',
            title: 'Administracion',
            type: 'collapse',
            icon: icons.IconUser,
            children: [
                {
                    id: 'printableSetup',
                    title: 'Imagenes',
                    type: 'item',
                    url: '/views/images',
                    icon: icons.IconCalendarEvent,
                    breadcrums: true

                },
                {
                    id: 'ListadoPartidos',
                    title: 'Listado de partidos',
                    type: 'item',
                    url: '/views/reports',
                    icon: icons.IconCalendarEvent,
                    breadcrums: true

                },
                {
                    id: 'CalculaPlayoffs',
                    title: 'Calcula playoffs',
                    type: 'item',
                    url: '/views/calculateplayoffs',
                    icon: icons.IconCalendarEvent,
                    breadcrums: true

                },
            ]
        },

        /* {
            id: 'ReservationSection',
            title: 'Reservaciones',
            type: 'collapse',
            icon: icons.IconCalendar,
            children: [
                {
                    id: 'ReservationCreate',
                    title: 'Crear Reservacion',
                    type: 'item',
                    url: '/views/createreservations',
                    icon: icons.IconCalendarEvent,
                    breadcrums: true

                },
            ]
        },
        {
            id: 'SimulateSubcribers',
            title: 'Simular Inscripciones',
            type: 'item',
            url: '/views/tournament/simulatesubscribers',
            icon: icons.IconAffiliate,
            breadcrums: true
        } */
    ]
};



export { TournamentOperationsMenu };
