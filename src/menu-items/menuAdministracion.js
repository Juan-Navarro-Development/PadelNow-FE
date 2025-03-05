// assets
import { IconBrandChrome, IconBeach,IconUser, IconUsers } from '@tabler/icons';

// constant
const icons = { IconBrandChrome, IconBeach, IconUser, IconUsers };
// ==============================|| MENU Adminstracion ||============================== //

const menuAdministracion = {
    id: 'administration',
    title: 'Administración',
    type: 'group',
    children: [
        {
            id: 'Club',
            title: 'Clubs',
            type: 'item',
            url: '/views/clubs/Browse',
            icon: icons.IconBeach,
            breadcrums: true
        },
        {
            id: 'BrowseUsers',
            title: 'Usuarios',
            type: 'item',
            url: '/views/users',
            icon: icons.IconUser,
            breadcrums: true
        }
    ]
};

export default menuAdministracion;
