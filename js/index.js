(() => {
  const coverPage = document.getElementById("coverPage");
  const soundButton = document.getElementById("soundButton");

  if (!coverPage) return;

  let isMoving = false;

  const goToCakePage = () => {
    if (isMoving) return;
    isMoving = true;

    document.body.classList.add("page-leaving");

    window.setTimeout(() => {
      window.location.href = "./cake.html";
    }, 180);
  };

  /*
    화면 아무 곳이나 클릭하면 cake.html로 이동
    단, 음악 버튼을 누른 경우에는 이동하지 않습니다.
  */
  coverPage.addEventListener("click", goToCakePage);

  soundButton?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  /*
    키보드 접근성:
    Enter 또는 Space 키를 눌러도 다음 페이지로 이동
  */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      if (document.activeElement === soundButton) return;
      goToCakePage();
    }
  });
})();
