import * as React from "react";
import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import { Container } from "@mui/system";
import ReactPlayer from "react-player";
import { makeStyles } from "@mui/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import PlaybackControls from "./components/PlaybackControls";
import Stack from "@mui/material/Stack";
import { io } from "socket.io-client";
import screenfull from "screenfull";

const socket = io.connect("http://localhost:5000");

const useStyles = makeStyles({
	playerWrapper: {
		width: "100%",
		height: "480px",
		position: "relative",
		top: 10,
	},
});

const format = seconds => {
	if (isNaN(seconds)) {
		return "00:00";
	}
	const date = new Date(seconds * 1000);
	const hh = date.getUTCHours();
	const mm = date.getUTCMinutes();
	const ss = date.getSeconds().toString().padStart(2, "0");
	if (hh) {
		return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
	}
	return `${mm}:${ss}`;
};

let count = 0;

const App = () => {
	const classes = useStyles();

	const [room, setRoom] = useState("");

	const joinRoom = () => {
		if (room !== "") {
			socket.emit("join-room", room);
			alert(`Joined room ${room}`);
		}
	};

	const [state, setState] = useState({
		playing: false,
		played: 0,
		seeking: false,
		muted: false,
		volume: 0.8,
		playbackRate: 1.0,
	});

	const { playing, played, volume, muted, playbackRate } = state;

	const [url, setUrl] = useState("");
	const [play, setPlay] = useState(
		"https://www.youtube.com/watch?v=ldXJudwtmy4"
	);

	const [timeDisplayFormat, setTimeDisplayFormat] = useState("normal");

	const playerRef = useRef(null);
	const playerContainerRef = useRef(null);
	const controlsRef = useRef(null);

	const handlePlayPause = () => {
		socket.emit("send-data", "play", room);
	};

	const handleRewind = () => {
		// playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
		socket.emit("send-rewind", playerRef.current.getCurrentTime() - 10, room);
	};

	const handleForward = () => {
		// playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
		socket.emit("send-forward", playerRef.current.getCurrentTime() + 10, room);
	};

	const handleProgress = changeState => {
		console.log(changeState);
		if (count > 2) {
			controlsRef.current.style.visibility = "hidden";
			count = 0;
		}

		if (controlsRef.current.style.visibility == "visible") count += 1;

		if (!state.seeking) {
			setState({ ...state, ...changeState });
		}
	};

	const handleSeekChange = (e, newValue) => {
		setState({ ...state, played: parseFloat(newValue / 100) });
	};

	const handleSeekMouseDown = e => {
		setState({ ...state, seeking: true });
	};

	const handleSeekMouseUp = (e, newValue) => {
		setState({ ...state, seeking: false });
		// playerRef.current.seekTo(newValue / 100);
		socket.emit("send-seek", newValue / 100, room);
	};

	const handleVolumeChange = (e, newValue) => {
		setState({
			...state,
			volume: parseFloat(newValue / 100),
			muted: newValue === 0 ? true : false,
		});
	};

	const handleVolumeSeekDown = (e, newValue) => {
		setState({
			...state,
			volume: parseFloat(newValue / 100),
			muted: newValue === 0 ? true : false,
		});
	};

	const handleMute = () => {
		setState({ ...state, muted: !muted });
	};

	const handlePlaybackRateChange = rate => {
		// setState({ ...state, playbackRate: rate });
		socket.emit("send-rate", rate, room);
	};

	const handleToggleFullScreen = () => {
		screenfull.toggle(playerContainerRef.current);
	};

	const handleChangeDisplayFormat = () => {
		setTimeDisplayFormat(
			timeDisplayFormat === "normal" ? "remaining" : "normal"
		);
	};

	const handleMouseMove = () => {
		controlsRef.current.style.visibility = "visible";
		count = 0;
	};

	const currentTime = playerRef.current
		? playerRef.current.getCurrentTime()
		: "00:00";
	const duration = playerRef.current
		? playerRef.current.getDuration()
		: "00:00";
	const elapsedTime =
		timeDisplayFormat === "normal"
			? format(currentTime)
			: `-${format(duration - currentTime)}`;
	const totalDuration = format(duration);

	React.useEffect(() => {
		socket.on("recv-url", url => {
			setPlay(url);
		});
		socket.on("recv-data", data => {
			if (data === "play") {
				setState({ ...state, playing: !state.playing });
			}
		});
		socket.on("recv-seek", seek => {
			playerRef.current.seekTo(seek);
		});

		socket.on("recv-rewind", rewind => {
			playerRef.current.seekTo(rewind);
		});

		socket.on("recv-forward", forward => {
			playerRef.current.seekTo(forward);
		});

		socket.on("recv-rate", rate => {
			setState({ ...state, playbackRate: rate });
		});
	});

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position='static' sx={{ bgcolor: "#3B9AE1" }}>
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
						Parallel Player
					</Typography>
					<Stack spacing={1} direction='row' style={{ margin: 10 }}>
						<TextField
							id='outlined-basic'
							label='Enter Room'
							variant='outlined'
							color='secondary'
							value={room}
							onChange={e => setRoom(e.target.value)}
						/>
						<Button variant='contained' onClick={joinRoom}>
							Join
						</Button>
					</Stack>
				</Toolbar>
			</AppBar>
			<Container maxWidth='md'>
				<Stack spacing={1} direction='row'>
					<TextField
						id='outlined-basic'
						label='Enter Link'
						variant='outlined'
						value={url}
						onChange={e => setUrl(e.target.value)}
						style={{ width: "100%", marginTop: 20 }}
					/>
					<Button
						variant='contained'
						style={{ marginTop: 20 }}
						onClick={() => socket.emit("send-url", url, room)}
					>
						Search
					</Button>
				</Stack>
				<div
					ref={playerContainerRef}
					className={classes.playerWrapper}
					onMouseMove={handleMouseMove}
				>
					<ReactPlayer
						ref={playerRef}
						width={"100%"}
						height={"100%"}
						url={play}
						playing={playing}
						controls={false}
						volume={volume}
						muted={muted}
						onProgress={handleProgress}
						playbackRate={playbackRate}
					/>
					<PlaybackControls
						ref={controlsRef}
						onPlayPause={handlePlayPause}
						playing={playing}
						onRewind={handleRewind}
						onForward={handleForward}
						played={played}
						onSeek={handleSeekChange}
						onSeekMouseDown={handleSeekMouseDown}
						onSeekMouseUp={handleSeekMouseUp}
						onVolumeChange={handleVolumeChange}
						onVolumeSeekDown={handleVolumeSeekDown}
						volume={volume}
						muted={muted}
						onMute={handleMute}
						elapsedTime={elapsedTime}
						totalDuration={totalDuration}
						playbackRate={playbackRate}
						onPlaybackRateChange={handlePlaybackRateChange}
						onToggleFullScreen={handleToggleFullScreen}
						onChangeDisplayFormat={handleChangeDisplayFormat}
					/>
				</div>
			</Container>
		</Box>
	);
};

export default App;
