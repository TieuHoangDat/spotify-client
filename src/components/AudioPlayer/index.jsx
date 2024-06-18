import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentSong } from "../../redux/audioPlayer";
import Like from "../Like";
import { IconButton } from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import styles from "./styles.module.scss";

const AudioPlayer = () => {
	const [trackProgress, setTrackProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1); // Thêm trạng thái cho âm lượng
	const { currentSong } = useSelector((state) => state.audioPlayer);
	const dispatch = useDispatch();

	const audioRef = useRef();
	const intervalRef = useRef();

	const startTimer = () => {
		clearInterval(intervalRef.current);

		intervalRef.current = setInterval(() => {
			if (audioRef && audioRef.current.ended) {
				dispatch(setCurrentSong({ ...currentSong, action: "pause" }));
			} else if (audioRef) {
				setTrackProgress(audioRef.current.currentTime);
				audioRef.current.duration && setDuration(audioRef.current.duration);
			} else {
				setTrackProgress(0);
			}
		}, [1000]);
	};

	const currentPercentage = duration
		? `${(trackProgress / duration) * 100}%`
		: "0%";
	const trackStyling = `
    -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))
  `;

	useEffect(() => {
		if (currentSong.action === "play") {
			audioRef.current.play();
		} else {
			audioRef.current.pause();
		}
	}, [currentSong]);

	useEffect(() => {
		currentSong.action === "play" && startTimer();
	});

	const onScrub = (value) => {
		clearInterval(intervalRef.current);
		audioRef.current.currentTime = value;
		setTrackProgress(audioRef.current.currentTime);
	};

	const handleActions = () => {
		currentSong.action === "play"
			? dispatch(setCurrentSong({ ...currentSong, action: "pause" }))
			: dispatch(setCurrentSong({ ...currentSong, action: "play" }));
	};

	const handleVolumeChange = (value) => {
		setVolume(value);
		audioRef.current.volume = value; // Cập nhật âm lượng cho audio
	};

	// const url = currentSong.song.song;
	// const song1 = require(`../../music/${url}.mp3`);

	return (
		<div className={styles.audio_player}>
			<div className={styles.left}>
				<img src={currentSong.song.img} alt="song_img" />
				<div className={styles.song_info}>
					<p className={styles.song_name}>{currentSong.song.name}</p>
					<p className={styles.song_artist}>{currentSong.song.artist}</p>
				</div>
			</div>
			<div className={styles.center}>
				<div className={styles.audio_controls}>
					<IconButton className={styles.prev}>
						<SkipPreviousIcon />
					</IconButton>
					<IconButton className={styles.play} onClick={handleActions}>
						{currentSong.action === "play" ? <PauseIcon /> : <PlayArrowIcon />}
					</IconButton>
					<IconButton className={styles.next}>
						<SkipNextIcon />
					</IconButton>
				</div>				
				<div className={styles.progress_container}>
					<p>{Math.floor(trackProgress / 60)}:{trackProgress % 60 < 10 ? '0' : ''}{Math.floor(trackProgress % 60)}</p>
					<input
						type="range"
						value={trackProgress}
						step="1"
						min="0"
						onChange={(e) => onScrub(e.target.value)}
						max={duration ? duration : 0}
						className={styles.progress}
						style={{ background: trackStyling }}
					/>
					<audio src={currentSong.song.song} ref={audioRef}></audio>
					<p>{Math.floor(duration / 60)}:{duration % 60 < 10 ? '0' : ''}{Math.floor(duration % 60)}</p>
				</div>
			</div>
			<div className={styles.right}>	
				<div className={styles.volume_controls}>
					<IconButton className={styles.volumeDown} onClick={() => handleVolumeChange(Math.max(0, volume - 0.1))}>
						<VolumeDownIcon />
					</IconButton>
					<input 
						type="range"
						value={volume}
						step="0.05"
						min="0"
						max="1"
						onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
						className={styles.volume_slider}
					/>
					<IconButton className={styles.volumeUp} onClick={() => handleVolumeChange(Math.min(1, volume + 0.1))}>
						<VolumeUpIcon />
					</IconButton>
				</div>		
				<Like songId={currentSong.song._id} />
			</div>
			
		</div>
	);
};

export default AudioPlayer;
