import * as React from "react";
import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import { Container } from "@mui/system";
import ReactPlayer from "react-player";
import { makeStyles } from "@mui/styles";
import { createTheme, IconButton, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import PlaybackControls from "./PlaybackControls";
import Stack from "@mui/material/Stack";
import { io } from "socket.io-client";
import screenfull from "screenfull";
import Appbar from "./Appbar";
// import { createTheme } from "@mui/system";
import { ThemeProvider } from "@mui/system";
import "../css/app.css";

const theme = createTheme({
	palette: {
		primary: {
			main: "#54BAB9",
		},
		secondary: {
			main: "#343434",
		},
	},
	typography: {
		fontFamily: "Montserrat",
	},
});

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
const rooms = [];

const Player = () => {
	const classes = useStyles();

	const makeroom = length => {
		var result = "";
		var characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	};

	const joinRoom = () => {
		if (room !== "") {
			localStorage.setItem("last-room", room);
			socket.emit("join-room", room);
			alert(`Joined room ${room}`);
			rooms.push(room.toString());
			// alert(rooms);
			if (rooms.length > 1 && rooms[0] !== rooms[1]) {
				socket.emit("leave-room", rooms[0]);
			}
			rooms.shift();
		} else alert("Please enter a room name");
	};

	const visibleControl = () => {
		controlsRef.current.style.visibility = "visible";
	};

	var [room, setRoom] = useState("");

	const [state, setState] = useState({
		playing: false,
		played: 0,
		seeking: false,
		muted: false,
		volume: 0.8,
		playbackRate: 1,
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

	const handlePlay = () => {
		// setState({ ...state, playing: true });
		socket.emit(
			"send-state",
			{
				playing: true,
				rate: playbackRate,
				time: playerRef.current.getCurrentTime(),
			},
			room
		);
	};

	const handlePause = () => {
		// setState({ ...state, playing: false });
		// socket.emit("send-state", "pause", room);
		socket.emit(
			"send-state",
			{
				playing: false,
				rate: playbackRate,
				time: playerRef.current.getCurrentTime(),
			},
			room
		);
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
		// console.log(changeState);
		if (count > 2) {
			controlsRef.current.style.visibility = "hidden";
			count = 0;
		}

		if (controlsRef.current.style.visibility === "visible") count += 1;

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
		const lastroom = localStorage.getItem("last-room");
		const newroom = makeroom(5);
		const localurl = localStorage.getItem("last-url");
		if (lastroom) {
			setRoom(lastroom);
			socket.emit("join-room", lastroom);
			rooms.push(lastroom.toString());
		}
		if (!lastroom && room === "") {
			setRoom(newroom);
			socket.emit("join-room", newroom);
			rooms.push(room.toString());
		}
		if (localurl) {
			setUrl(localurl);
			setPlay(localurl);
		}
	}, []);

	React.useEffect(() => {
		localStorage.setItem("last-room", room);
		localStorage.setItem("last-url", play);

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

		socket.on("recv-state", state => {
			if (state.playing === true) {
				setState({ ...state, playing: true, playbackRate: state.rate });
				if (Math.abs(playerRef.current.getCurrentTime() - state.time) > 1)
					playerRef.current.seekTo(state.time);
			} else {
				setState({ ...state, playing: false, playbackRate: state.rate });
			}
		});
	});

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ flexGrow: 1 }}>
				<Appbar room={room} setRoom={setRoom} joinRoom={joinRoom} />
				<Container maxWidth='md'>
					<Stack spacing={1} direction='row'>
						<TextField
							sx={{
								input: { color: "white" },
							}}
							id='outlined-basic'
							label='Enter Link'
							variant='outlined'
							value={url}
							onChange={e => setUrl(e.target.value)}
							style={{
								width: "100%",
								marginTop: 20,
								// backgroundColor: "#343434",
							}}
							focused
						/>
						<Button
							// sx={{
							// 	bgcolor: "secondary.main",
							// 	color: "secondary.contrastText",
							// 	"&:hover": {
							// 		bgcolor: "secondary.dark",
							// 	},
							// }}
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
						onTouchStart={handleMouseMove}
						onTouchMove={handleMouseMove}
					>
						<ReactPlayer
							ref={playerRef}
							width={"100%"}
							height={"100%"}
							url={play}
							playing={playing}
							onPlay={handlePlay}
							onPause={handlePause}
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
						{/* overlay upon screen to bring controls */}
						<Button
							style={{
								width: "100%",
								height: screenfull.isFullscreen ? "1080px" : "480px",
								position: "relative",
								top: screenfull.isFullscreen ? "-1080px" : "-480px",
								backgroundColor: "transparent",
								zIndex: 0,
								cursor: "none",
							}}
							variant='contained'
							onClick={visibleControl}
							onMouseMove={visibleControl}
						></Button>
					</div>
				</Container>
			</Box>
			<div
				style={{
					fontFamily: "montserrat",
					width: "100%",
					alignItems: "center",
					justifyContent: "center",
					display: "flex",
					marginTop: 20,
				}}
			>
				<p>App under development</p>
			</div>
		</ThemeProvider>
	);
};

export default Player;
