import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// login option 3 routing
const DrawCalendar = Loadable(lazy(() => import('views/gamePlanning/DrawCalendar')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const MinimalLayoutRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/views/drawcalendarminimal',
            element: <DrawCalendar />
        },
    ]
};

export default MinimalLayoutRoutes;
