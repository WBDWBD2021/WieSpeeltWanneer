import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import { Menu, MenuItem } from '@mui/material';

const MobileNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // Main navigation items for bottom bar
    const mainItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { label: 'Wedstrijden', icon: <SportsTennisIcon />, path: '/wedstrijden' },
        { label: 'Spelers', icon: <PeopleIcon />, path: '/spelers' },
    ];

    // More menu items
    const moreItems = [
        { label: 'Clubs', path: '/clubs' },
        { label: 'Teams', path: '/teams' },
        { label: 'Competities', path: '/competities' },
    ];

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuClick = (path: string) => {
        navigate(path);
        handleMenuClose();
    };

    // Determine current active value
    const getCurrentValue = () => {
        if (mainItems.some(item => location.pathname.startsWith(item.path))) {
            const item = mainItems.find(item => location.pathname.startsWith(item.path));
            return item?.path;
        }
        if (moreItems.some(item => location.pathname.startsWith(item.path))) {
            return 'more';
        }
        return location.pathname;
    };

    return (
        <>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={getCurrentValue()}
                    onChange={(event, newValue) => {
                        if (newValue === 'more') {
                            // Menu is handled by click on specific action, but we need to catch it here too if needed
                        } else {
                            navigate(newValue);
                        }
                    }}
                >
                    {mainItems.map((item) => (
                        <BottomNavigationAction
                            key={item.path}
                            label={item.label}
                            value={item.path}
                            icon={item.icon}
                        />
                    ))}

                    <BottomNavigationAction
                        label="Meer"
                        value="more"
                        icon={<MenuIcon />}
                        onClick={handleMenuOpen}
                    />
                </BottomNavigation>
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                {moreItems.map((item) => (
                    <MenuItem
                        key={item.path}
                        onClick={() => handleMenuClick(item.path)}
                        selected={location.pathname.startsWith(item.path)}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default MobileNavigation;
