import React from 'react'
import IconList from '../../components/icons/SideBar/IconList'
import IconCalendar from '../../components/icons/SideBar/IconCalendar';
import IconUsers from '../../components/icons/SideBar/IconUsers';
import IconUserCheck from '../../components/icons/SideBar/IconUserCheck';
import IconDashboard from '../../components/icons/SideBar/IconDashboard';
import IconScissors from '../../components/icons/SideBar/IconScissors';
import IconBox from '../../components/icons/IconBox';
import IconLogout from '../../components/icons/SideBar/IconLogout';
import NavLink from '../../components/other/NavLink';

   const workItems = [
    {
      href: '/appointments',
      label: 'Записи',
      icon: <IconList />,
    },
    {
      href: '/calendar',
      label: 'Календарь',
      icon: <IconCalendar />,
    },
    {
      href: '/clients',
      label: 'Клиенты',
      icon: <IconUsers />,
    },
    {
      href: '/staff',
      label: 'Сотрудники',
      icon: <IconUserCheck />,
    },
    {
      href: '/analytics',
      label: 'Аналитика',
      icon: <IconDashboard />,
    },
  ]

  export default workItems