/*
  index.html ↔ cake.html 이동 시 같은 곡의 위치/음소거 상태를 이어가기 위한 코드입니다.
  기존 music.js 안에서 audio src를 지정한 다음 아래 로직을 합쳐 사용하세요.
  HTML 페이지가 바뀌는 구조라 아주 짧은 재로딩 간격은 생길 수 있지만,
  곡은 이전 재생 위치부터 자동으로 이어집니다.
*/

const MUSIC_STATE_KEY = "birthdayMusicState";
const bgMusic = document.getElementById("bgMusic");

const restoreMusicState = () => {
  if (!bgMusic) return;

  try {
    const saved = JSON.parse(sessionStorage.getItem(MUSIC_STATE_KEY) || "null");
    if (!saved) return;

    bgMusic.muted = Boolean(saved.muted);
    bgMusic.volume = typeof saved.volume === "number" ? saved.volume : 1;

    const applyTime = () => {
      if (Number.isFinite(saved.currentTime)) {
        bgMusic.currentTime = Math.max(0, saved.currentTime);
      }

      if (saved.playing) {
        bgMusic.play().catch(() => {
          // 브라우저 자동재생 제한 시 기존 사운드 버튼을 누르면 이어서 재생됩니다.
        });
      }
    };

    if (bgMusic.readyState >= 1) applyTime();
    else bgMusic.addEventListener("loadedmetadata", applyTime, { once: true });
  } catch (error) {
    console.warn("음악 상태를 불러오지 못했습니다.", error);
  }
};

const saveMusicState = () => {
  if (!bgMusic) return;

  sessionStorage.setItem(MUSIC_STATE_KEY, JSON.stringify({
    currentTime: bgMusic.currentTime || 0,
    playing: !bgMusic.paused,
    muted: bgMusic.muted,
    volume: bgMusic.volume
  }));
};

restoreMusicState();
window.addEventListener("pagehide", saveMusicState);
window.addEventListener("beforeunload", saveMusicState);
