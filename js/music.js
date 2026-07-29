(() => {
  const audio = document.getElementById("bgMusic");
  const soundButton = document.getElementById("soundButton");

  if (!audio || !soundButton) return;

  const playlist = [
    "./assets/music/music-01.wav",
    "./assets/music/music-02.wav",
    "./assets/music/music-03.wav",
    "./assets/music/music-04.wav",
    "./assets/music/music-05.wav"
  ];

  const STORAGE_KEY_PLAYING = "birthdayMusicPlaying";
  const STORAGE_KEY_TRACK = "birthdayMusicTrack";
  const STORAGE_KEY_TIME = "birthdayMusicTime";

  let currentTrack = Number(sessionStorage.getItem(STORAGE_KEY_TRACK) || 0);
  let isPlaying = sessionStorage.getItem(STORAGE_KEY_PLAYING) === "true";

  if (
    Number.isNaN(currentTrack) ||
    currentTrack < 0 ||
    currentTrack >= playlist.length
  ) {
    currentTrack = 0;
  }

  const setTrack = (index, savedTime = 0) => {
    currentTrack = index;
    audio.src = playlist[currentTrack];
    audio.load();

    audio.addEventListener(
      "loadedmetadata",
      () => {
        if (savedTime > 0 && savedTime < audio.duration) {
          audio.currentTime = savedTime;
        }
      },
      { once: true }
    );

    sessionStorage.setItem(STORAGE_KEY_TRACK, String(currentTrack));
  };

  const updateButton = () => {
    soundButton.classList.toggle("is-playing", isPlaying);
    soundButton.setAttribute("aria-pressed", String(isPlaying));
    soundButton.setAttribute(
      "aria-label",
      isPlaying ? "음악 끄기" : "음악 켜기"
    );

    const icon = soundButton.querySelector(".sound-icon");
    if (icon) {
      icon.textContent = isPlaying ? "🔊" : "🔇";
    }
  };

  const playMusic = async () => {
    try {
      await audio.play();
      isPlaying = true;
      sessionStorage.setItem(STORAGE_KEY_PLAYING, "true");
      updateButton();
    } catch (error) {
      /*
        모바일 브라우저는 사용자 동작 전 자동재생을 막을 수 있습니다.
        이 경우 스피커 버튼을 한 번 누르면 정상 재생됩니다.
      */
      isPlaying = false;
      sessionStorage.setItem(STORAGE_KEY_PLAYING, "false");
      updateButton();
    }
  };

  const pauseMusic = () => {
    audio.pause();
    isPlaying = false;
    sessionStorage.setItem(STORAGE_KEY_PLAYING, "false");
    sessionStorage.setItem(STORAGE_KEY_TIME, String(audio.currentTime || 0));
    updateButton();
  };

  const savedTime = Number(sessionStorage.getItem(STORAGE_KEY_TIME) || 0);
  setTrack(currentTrack, savedTime);
  updateButton();

  soundButton.addEventListener("click", (event) => {
    event.stopPropagation();

    if (audio.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });

  /*
    한 곡이 끝나면 다음 곡으로 이동합니다.
    5번째 곡이 끝나면 다시 1번째 곡으로 돌아갑니다.
  */
  audio.addEventListener("ended", () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    sessionStorage.setItem(STORAGE_KEY_TIME, "0");
    setTrack(nextTrack, 0);
    playMusic();
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.paused) {
      sessionStorage.setItem(STORAGE_KEY_TIME, String(audio.currentTime || 0));
    }
  });

  /*
    index.html에서 음악을 켠 상태로 cake.html에 이동했을 때
    재생 상태를 이어받습니다.
    단, 모바일 브라우저 정책에 따라 첫 진입 시 버튼 클릭이 필요할 수 있습니다.
  */
  if (isPlaying) {
    playMusic();
  }

  window.addEventListener("pagehide", () => {
    sessionStorage.setItem(STORAGE_KEY_TRACK, String(currentTrack));
    sessionStorage.setItem(STORAGE_KEY_TIME, String(audio.currentTime || 0));
    sessionStorage.setItem(
      STORAGE_KEY_PLAYING,
      String(!audio.paused && !audio.ended)
    );
  });
})();
