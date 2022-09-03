import React, { forwardRef } from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { makeStyles, styled } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Forward10RoundedIcon from "@mui/icons-material/Forward10Rounded";
import Replay10RoundedIcon from "@mui/icons-material/Replay10Rounded";
import { PlayArrowRounded } from "@mui/icons-material";
import { PauseRounded } from "@mui/icons-material";
import { VolumeUpRounded, VolumeOffRounded } from "@mui/icons-material";
import { Button, Slider } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { FullscreenRounded } from "@mui/icons-material";
import Popover from "@mui/material/Popover";

const useStyles = makeStyles({
	controlsWrapper: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		zIndex: 1,
	},
	controlIcons: {
		transform: "scale(0.9)",
		"&:hover": {
			color: "#fff",
			transform: "scale(1)",
		},
	},
	bottomIcons: {
		color: "#999",
		"&:hover": {
			color: "#fff",
		},
	},
});

function ValueLabelComponent(props) {
	const { children, value } = props;

	return (
		<Tooltip enterTouchDelay={0} placement='top' title={value}>
			{children}
		</Tooltip>
	);
}

const PrettoSlider = styled(Slider)({
	color: "#52af77",
	height: 8,
	"& .MuiSlider-track": {
		border: "none",
	},
	"& .MuiSlider-thumb": {
		height: 24,
		width: 24,
		backgroundColor: "#fff",
		border: "2px solid currentColor",
		"&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
			boxShadow: "inherit",
		},
		"&:before": {
			display: "none",
		},
	},
	"& .MuiSlider-valueLabel": {
		lineHeight: 1.2,
		fontSize: 12,
		background: "unset",
		padding: 0,
		width: 32,
		height: 32,
		borderRadius: "50% 50% 50% 0",
		backgroundColor: "#52af77",
		transformOrigin: "bottom left",
		transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
		"&:before": { display: "none" },
		"&.MuiSlider-valueLabelOpen": {
			transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
		},
		"& > *": {
			transform: "rotate(45deg)",
		},
	},
});

export default forwardRef(
	(
		{
			onPlayPause,
			playing,
			played,
			onRewind,
			onForward,
			onSeek,
			onSeekMouseDown,
			onSeekMouseUp,
			onVolumeChange,
			onVolumeSeekDown,
			volume,
			muted,
			onMute,
			elapsedTime,
			totalDuration,
			playbackRate,
			onPlaybackRateChange,
			onToggleFullScreen,
			onChangeDisplayFormat,
		},
		ref
	) => {
		const classes = useStyles();

		const [anchorEl, setAnchorEl] = React.useState(null);

		const handlePopover = event => {
			setAnchorEl(event.currentTarget);
		};

		const handleClose = () => {
			setAnchorEl(null);
		};
		const open = Boolean(anchorEl);
		const id = open ? "playbackrate-popover" : undefined;
		return (
			<div className={classes.controlsWrapper} ref={ref}>
				<Grid
					container
					direction={"row"}
					alignItems='center'
					justifyContent='space-between'
					style={{ padding: 16 }}
				>
					{/* <Grid item>
					<Typography variant='h5' style={{ color: "#fff" }}>
						Video Title
					</Typography>
				</Grid> */}
				</Grid>
				<Grid
					container
					direction='row'
					alignItems='center'
					justifyContent='center'
				>
					<IconButton
						onClick={onRewind}
						className={classes.controlIcons}
						style={{
							color: "#fff",
							fontSize: 75,
							marginRight: 64,
							opacity: 0.8,
						}}
						aria-label='rewind'
					>
						<Replay10RoundedIcon fontSize='inherit' />
					</IconButton>

					<IconButton
						onClick={onPlayPause}
						className={classes.controlIcons}
						style={{ color: "#fff", fontSize: 75, opacity: 0.8 }}
						aria-label='play'
					>
						{playing ? (
							<PauseRounded fontSize='inherit' />
						) : (
							<PlayArrowRounded fontSize='inherit' />
						)}
					</IconButton>

					<IconButton
						onClick={onForward}
						className={classes.controlIcons}
						style={{
							color: "#fff",
							fontSize: 75,
							marginLeft: 64,
							opacity: 0.8,
						}}
						aria-label='forward'
					>
						<Forward10RoundedIcon fontSize='inherit' />
					</IconButton>
				</Grid>
				<Grid
					container
					direction='row'
					justifyContent='space-between'
					alignItems='center'
					style={{ padding: 16 }}
				>
					<Grid item xs={12}>
						<PrettoSlider
							min={0}
							max={100}
							value={played * 100}
							// valueLabelDisplay={elapsedTime}
							onChange={onSeek}
							onMouseDown={onSeekMouseDown}
							onChangeCommitted={onSeekMouseUp}
						/>
					</Grid>
					<Grid item>
						<Grid container direction='row' alignItems='center'>
							<IconButton
								onClick={onPlayPause}
								className={classes.bottomIcons}
								style={{ color: "#fff" }}
							>
								{playing ? (
									<PauseRounded fontSize='large' />
								) : (
									<PlayArrowRounded fontSize='large' />
								)}
							</IconButton>

							<Button
								onClick={onChangeDisplayFormat}
								variant='text'
								style={{ color: "#fff" }}
							>
								<Typography>
									{elapsedTime}/{totalDuration}
								</Typography>
							</Button>
						</Grid>
					</Grid>
					<Grid item>
						<Grid container direction='row' alignItems='center'>
							<Button
								onClick={handlePopover}
								variant='text'
								style={{ width: 100, color: "#fff", width: 50 }}
							>
								<Typography>{playbackRate}X</Typography>
							</Button>
							<Popover
								id={id}
								open={open}
								anchorEl={anchorEl}
								onClose={handleClose}
								anchorOrigin={{
									vertical: "top",
									horizontal: "center",
								}}
								transformOrigin={{
									vertical: "bottom",
									horizontal: "center",
								}}
							>
								<Grid container direction='column-reverse' alignItems='center'>
									{[0.5, 1, 1.5, 2].map(rate => (
										<Button
											onClick={() => onPlaybackRateChange(rate)}
											variant='text'
										>
											<Typography
												color={rate === playbackRate ? "secondary" : "default"}
											>
												{rate}
											</Typography>
										</Button>
									))}
								</Grid>
							</Popover>
							<IconButton
								onClick={onMute}
								className={classes.bottomIcons}
								style={{ color: "#fff" }}
							>
								{muted ? (
									<VolumeOffRounded fontSize='large' />
								) : (
									<VolumeUpRounded fontSize='large' />
								)}
							</IconButton>
							<Slider
								min={0}
								max={100}
								value={volume * 100}
								style={{ width: 100 }}
								onChange={onVolumeChange}
								onChangeCommitted={onVolumeSeekDown}
							/>
							<IconButton
								onClick={onToggleFullScreen}
								style={{ width: 100, color: "#fff", width: 50 }}
							>
								<FullscreenRounded fontSize='large' />
							</IconButton>
						</Grid>
					</Grid>
				</Grid>
			</div>
		);
	}
);

// export default PlaybackControls;
