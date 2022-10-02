import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import {
	IconButton,
	ListItemSecondaryAction,
	TextField,
	Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LoginIcon from "@mui/icons-material/Login";
// import Search from "@mui/icons-material/Search";
// import SearchIconWrapper from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginLeft: 0,
	width: "100%",
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(1),
		width: "auto",
	},
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("sm")]: {
			width: "12ch",
			"&:focus": {
				width: "20ch",
			},
		},
	},
}));

const Appbar = ({ room, setRoom, joinRoom }) => {
	return (
		<AppBar
			position='static'
			sx={{
				bgcolor: "secondary.main",
				color: "secondary.contrastText",
			}}
		>
			<Toolbar>
				<IconButton
					size='large'
					edge='start'
					color='inherit'
					aria-label='menu'
					sx={{ mr: 2 }}
				>
					<MenuIcon />
				</IconButton>
				<Typography variant='h6' component={"div"} sx={{ flexGrow: 1 }}>
					ParaPlay
				</Typography>
				<Stack spacing={1} direction='row' style={{ margin: 10 }}>
					<Search>
						<SearchIconWrapper>
							<LoginIcon />
						</SearchIconWrapper>
						<StyledInputBase
							placeholder='Search…'
							inputProps={{ "aria-label": "search" }}
							value={room}
							onChange={e => setRoom(e.target.value)}
						/>
					</Search>
					<Button
						// sx={{
						// 	bgcolor: "secondary.main",
						// 	color: "secondary.contrastText",
						// 	"&:hover": {
						// 		bgcolor: "secondary.dark",
						// 	},
						// }}
						variant='contained'
						onClick={joinRoom}
					>
						Join
					</Button>
				</Stack>
			</Toolbar>
		</AppBar>
	);
};

export default Appbar;
