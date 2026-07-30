(() => {
  "use strict";

  const REQUIRED_TAPS = 28;
  const body = document.body;
  const lockedContent = document.getElementById("lockedContent");
  const cakeTapButton = document.getElementById("cakeTapButton");
  const birthdayCake = document.getElementById("birthdayCake");
  const tapCount = document.getElementById("tapCount");
  const tapBurst = document.getElementById("tapBurst");
  const unlockGuide = document.getElementById("unlockGuide");
  const topButton = document.getElementById("topButton");

  let currentTaps = 0;
  let isUnlocked = false;
  let letterFinished = false;

  // 새로고침 시 항상 초기화되도록 저장소를 사용하지 않습니다.
  const resetPage = () => {
    currentTaps = 0;
    isUnlocked = false;
    letterFinished = false;
    body.classList.add("is-locked");
    body.classList.remove("is-unlocked");
    lockedContent?.setAttribute("aria-hidden", "true");
    cakeTapButton?.classList.remove("is-complete");
    if (tapCount) tapCount.textContent = "0";
    if (unlockGuide) unlockGuide.textContent = "세봉의 생일 축하한다봉";
    window.scrollTo(0, 0);
  };

  const pulseCake = () => {
    if (!birthdayCake) return;
    birthdayCake.classList.remove("is-tapped");
    void birthdayCake.offsetWidth;
    birthdayCake.classList.add("is-tapped");

    tapBurst?.classList.remove("is-active");
    if (tapBurst) {
      void tapBurst.offsetWidth;
      tapBurst.classList.add("is-active");
    }
  };

  const unlockPage = () => {
    if (isUnlocked) return;
    isUnlocked = true;
    cakeTapButton?.classList.add("is-complete");
    body.classList.remove("is-locked");
    body.classList.add("is-unlocked");
    lockedContent?.setAttribute("aria-hidden", "false");
    if (unlockGuide) unlockGuide.textContent = "아래로 내려가시오 ↓";

    window.setTimeout(() => {
      document.getElementById("section2")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 850);
  };

  cakeTapButton?.addEventListener("click", () => {
    if (isUnlocked) return;
    currentTaps += 1;
    if (tapCount) tapCount.textContent = String(currentTaps);
    pulseCake();

    if (currentTaps >= REQUIRED_TAPS) unlockPage();
  });

  // 섹션 2: 반드시 위에서부터 차례대로 한 장씩 공개
  const filmSlots = Array.from(document.querySelectorAll(".film-slot"));
  filmSlots.forEach((slot, index) => {
    slot.addEventListener("click", () => {
      if (slot.classList.contains("is-filled") || slot.disabled) return;

      const image = slot.querySelector("img");
      const source = slot.dataset.photo;
      if (image && source) image.src = source;
      slot.classList.add("is-filled");
      slot.disabled = true;

      const nextSlot = filmSlots[index + 1];
      if (nextSlot) nextSlot.disabled = false;
    });
  });

  // 섹션 3: 화면 진입 시 한 번만 손글씨 애니메이션 실행
  const letterSection = document.getElementById("section3");
  const letterLines = Array.from(document.querySelectorAll(".handwrite-line"));
  const letterProgress = document.getElementById("letterProgress");

  const finishLetter = () => {
    if (!letterSection || letterFinished) return;
    letterFinished = true;
    letterSection.classList.remove("is-writing");
    letterSection.classList.add("is-complete");
    if (letterProgress) letterProgress.textContent = "아직 더 있어! ↓";
  };

  const startLetter = () => {
    if (!letterSection || letterFinished || letterSection.classList.contains("is-writing")) return;
    letterSection.classList.add("is-writing");

    letterLines.forEach((line, index) => {
      line.style.animationDelay = `${index * 0.72}s`;
    });

    const totalDuration = Math.max(1600, (letterLines.length - 1) * 720 + 1250);
    window.setTimeout(finishLetter, totalDuration);
  };

  if (letterSection && "IntersectionObserver" in window) {
    const letterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          startLetter();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );
    letterObserver.observe(letterSection);
  } else {
    startLetter();
  }

  // 편지가 끝날 때까지 섹션4 방향으로 넘어가지 못하게 제어
  let lastScrollY = 0;
  window.addEventListener("scroll", () => {
    const currentY = window.scrollY;
    const scrollingDown = currentY > lastScrollY;
    lastScrollY = currentY;

    if (!isUnlocked || letterFinished || !letterSection || !scrollingDown) return;

    const nextSection = document.getElementById("section4");
    if (!nextSection) return;
    const nextTop = nextSection.offsetTop;

    if (currentY + window.innerHeight * 0.72 >= nextTop) {
      window.scrollTo({ top: letterSection.offsetTop, behavior: "smooth" });
    }
  }, { passive: true });

  // 쿠폰 다운로드 팝업
  const modal = document.getElementById("downloadModal");
  const downloadPreview = document.getElementById("downloadPreview");
  const downloadAction = document.getElementById("downloadAction");
  const downloadClose = document.getElementById("downloadClose");

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    body.style.overflow = "";
  };

  document.querySelectorAll(".coupon-image-button").forEach((button) => {
    button.addEventListener("click", () => {
      const source = button.dataset.download;
      const name = button.dataset.name || "birthday-coupon.png";
      if (!source || !modal || !downloadPreview || !downloadAction) return;

      downloadPreview.src = source;
      downloadAction.href = source;
      downloadAction.download = name;
      modal.hidden = false;
      body.style.overflow = "hidden";
    });
  });

  downloadClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  // TOP 버튼
  const toggleTopButton = () => {
    if (!topButton) return;
    topButton.classList.toggle("is-visible", window.scrollY > 520 && isUnlocked);
  };

  window.addEventListener("scroll", toggleTopButton, { passive: true });
  topButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // bfcache 복원은 현재 상태 유지, 실제 새로고침은 초기화
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) resetPage();
  });
})();
