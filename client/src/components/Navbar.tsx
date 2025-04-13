import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import EmailIcon from '@mui/icons-material/Email';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';

// Styled components for a more modern look
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const NavButton = styled(Button)(({ theme, active }: { theme: any, active: boolean }) => ({
  margin: theme.spacing(0, 1),
  fontWeight: active ? 600 : 500,
  position: 'relative',
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: theme.spacing(2),
    right: theme.spacing(2),
    height: 3,
    borderRadius: 3,
    backgroundColor: theme.palette.primary.main,
  } : {}
}));

const Navbar = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Check if a path is active
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Email Marketing
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ 
              mx: 1,
              fontWeight: isActive('/') ? 600 : 500,
              position: 'relative',
              '&::after': isActive('/') ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 2,
                right: 2,
                height: 3,
                borderRadius: 3,
                backgroundColor: 'primary.main',
              } : {}
            }}
          >
            Dashboard
          </Button>
          
          <Button
            color="primary"
            aria-controls="create-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            endIcon={<ArrowDropDownIcon />}
            sx={{ ml: 2 }}
          >
            Create Email
          </Button>
          <Menu
            id="create-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem 
              component={RouterLink} 
              to="/create-email"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Single Email</ListItemText>
            </MenuItem>
            <MenuItem 
              component={RouterLink} 
              to="/bulk-email"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <CloudUploadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Bulk Import</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar; 