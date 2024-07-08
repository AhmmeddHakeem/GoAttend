function updateTime() {
    const timeDisplay = document.getElementById('time-display');
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();