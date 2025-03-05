//import dashboard from './dashboard';
import pages from './pages';
//import utilities from './utilities';
//import other from './other';
//import menuAdministracion from './menuAdministracion';
import {TournamentOperationsMenu} from './tournamentAdministration';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
   // items: [pages, menuAdministracion,TournamentOperationsMenu,utilities]
    items: [TournamentOperationsMenu,pages]
};

export default menuItems;
