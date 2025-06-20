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
  const [playlist, setPlaylist] = useState<string[]>([]);
  const playerRef = useRef<HTMLDivElement>(null);

  // Your custom playlist
  const defaultPlaylist = [
    'RG_-0pOMrhU', // Your video 1
    'L8nxwoNlP-A', // Your video 2
    '7qnWHsF4zXY', // Your video 3
    'S0NzaPZQjn0', // Your video 4
    'cwEc5zcIH-0', // Your video 5
    '3gQVDcQ-Rm0', // Your video 6
    '6me17gGZYRg'  // Your video 7
  ];

  // Load playlist from file or use default
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const response = await fetch('/playlist.txt');
        if (response.ok) {
          const text = await response.text();
          const videoIds = text.trim().split('\n').filter(id => id.trim());
          setPlaylist(videoIds.length > 0 ? videoIds : defaultPlaylist);
        } else {
          setPlaylist(defaultPlaylist);
        }
      } catch (error) {
        console.log('Using default playlist');
        setPlaylist(defaultPlaylist);
      }
    };

    loadPlaylist();
  }, []);

  useEffect(() => {
    const initializePlayer = () => {
      if (window.YT && playerRef.current && playlist.length > 0) {
        const ytPlayer = new window.YT.Player(playerRef.current, {
          height: '180',
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
              
              // Auto-play next video when current one ends
              if (event.data === window.YT.PlayerState.ENDED) {
                nextTrack();
              }
            }
          }
        });
      }
    };

    if (window.YT && playlist.length > 0) {
      initializePlayer();
    } else if (playlist.length > 0) {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }
  }, [playlist]);

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
    if (player && playlist.length > 0) {
      const newIndex = currentVideoIndex > 0 ? currentVideoIndex - 1 : playlist.length - 1;
      setCurrentVideoIndex(newIndex);
      player.loadVideoById(playlist[newIndex]);
    }
  };

  const nextTrack = () => {
    if (player && playlist.length > 0) {
      const newIndex = currentVideoIndex < playlist.length - 1 ? currentVideoIndex + 1 : 0;
      setCurrentVideoIndex(newIndex);
      player.loadVideoById(playlist[newIndex]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg">
          <Music className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Music</h2>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {currentVideoIndex + 1}/{playlist.length}
        </div>
      </div>

      {/* Video container - compact */}
      <div className="bg-gray-100 rounded-xl overflow-hidden mb-3 flex-1">
        <div ref={playerRef} className="w-full h-full min-h-[180px]"></div>
      </div>

      {/* Current track info - compact */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1">Now Playing</p>
        <p className="text-sm font-medium text-gray-800 truncate leading-tight">{currentTitle}</p>
      </div>

      {/* Controls - compact */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={previousTrack}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          disabled={playlist.length === 0}
        >
          <SkipBack className="w-4 h-4 text-gray-700" />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-2.5 bg-gradient-to-r from-rose-400 to-orange-400 hover:from-rose-500 hover:to-orange-500 rounded-lg transition-all duration-200 shadow-md"
          disabled={playlist.length === 0}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>
        
        <button
          onClick={nextTrack}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          disabled={playlist.length === 0}
        >
          <SkipForward className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        💡 Edit playlist.txt to add/remove songs
      </div>
    </div>
  );
};

export default YouTubePlayerComponent;