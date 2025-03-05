// assets
import { IconBrandChrome, IconHelp,IconUser, IconUsers } from '@tabler/icons';

// constant
const icons = { IconBrandChrome, IconHelp, IconUser, IconUsers };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
    id: 'sample-docs-roadmap',
    type: 'group',
    children: [
        {
            id: 'sample-page',
            title: 'Sample Page',
            type: 'item',
            url: '/sample-page',
            icon: icons.IconBrandChrome,
            breadcrumbs: false
        },
        {
            id: 'documentation',
            title: 'Documentation',
            type: 'item',
            url: 'https://codedthemes.gitbook.io/berry/',
            icon: icons.IconHelp,
            external: true,
            target: true
        },
        {
            id: 'Club',
            title: 'Listado de clubs2',
            type: 'item',
            url: '/views/clubs/Browse',
            icon: icons.IconHelp,
            breadcrums: false
        },
        {
            id: 'DrawGroup',
            title: 'Grupos',
            type: 'item',
            url: '/views/groups/draw',
            icon: icons.IconUsers,
            breadcrums: false
        },
        {
            id: 'BrowseUsers',
            title: 'Usuarios',
            type: 'item',
            url: '/views/users/browse',
            icon: icons.IconUser,
            breadcrums: false
        }
        
    ]
};

export default other;
