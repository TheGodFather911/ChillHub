import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  getVideoData: () => { title: string };
  loadVideoById: (videoId: string) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlayerComponent: React.FC = () => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('No video loaded');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);

  // Sample playlist of chill/lofi music
  const playlist = [
    'jfKfPfyJRdk', // Lofi hip hop mix
    'DWcJFNfaw9c', // Chillhop mix
    '5qap5aO4i9A', // Jazz lofi
    'rUxyKA_-grg', // Study beats
    'MCkNXd1PyGU'  // Chill mix
  ];

  useEffect(() => {
    const initializePlayer = () => {
      if (window.YT && playerRef.current) {
        const ytPlayer = new window.YT.Player(playerRef.current, {
          height: '240',
          width: '100%',
          videoId: playlist[0],
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
              setCurrentTitle(event.target.getVideoData().title);
            },
            onStateChange: (event: any) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              if (event.target.getVideoData) {
                setCurrentTitle(event.target.getVideoData().title);
              }
            }
          }
        });
      }
    };

    if (window.YT) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }
  }, []);

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const previousTrack = () => {
    if (player) {
      const newIndex = currentVideoIndex > 0 ? currentVideoIndex - 1 : playlist.length - 1;
      setCurrentVideoIndex(newIndex);
      player.loadVideoById(playlist[newIndex]);
    }
  };

  const nextTrack = () => {
    if (player) {
      const newIndex = currentVideoIndex < playlist.length - 1 ? currentVideoIndex + 1 : 0;
      setCurrentVideoIndex(newIndex);
      player.loadVideoById(playlist[newIndex]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl">
          <Music className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Music Player</h2>
      </div>

      {/* Video container */}
      <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4 flex-1">
        <div ref={playerRef} className="w-full h-full min-h-[240px]"></div>
      </div>

      {/* Current track info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Now Playing</p>
        <p className="font-medium text-gray-800 truncate">{currentTitle}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={previousTrack}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
        >
          <SkipBack className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-4 bg-gradient-to-r from-rose-400 to-orange-400 hover:from-rose-500 hover:to-orange-500 rounded-full transition-all duration-200 shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </button>
        
        <button
          onClick={nextTrack}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
        >
          <SkipForward className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default YouTubePlayerComponent;