import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js'
import {
  getColorBackground,
  getColorElementList,
  getColorListElement,
  getInActiveColorList,
  getPlayAgainButton,
  getPlayButton,
} from './selectors.js'
import {
  createTimer,
  getRandomColorPairs,
  hidePlayAgainButton,
  setTimerText,
  showPlayAgainButton,
} from './utils.js'

let selections = []
let gameStatus = GAME_STATUS.PLAYING
let timer = createTimer({
  seconds: GAME_TIME,
  onChange: handleTimeChange,
  onFinish: handleTimeFinish,
})

function handleTimeChange(second) {
  const fullSecond = `0${second}`.slice(-2)
  setTimerText(fullSecond)
}

function handleTimeFinish() {
  gameStatus = GAME_STATUS.FINISHED

  setTimerText('Game Over😥')
  showPlayAgainButton()
}

function handleColorClick(liElement) {
  const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
  const isClicked = liElement.classList.contains('active')
  if (!liElement || isClicked || shouldBlockClick) return

  liElement.classList.add('active')

  selections.push(liElement)
  if (selections.length < 2) return

  // isMatch
  const firstColor = selections[0].dataset.color
  const secondColor = selections[1].dataset.color
  const isMatch = firstColor === secondColor

  if (isMatch) {
    const backgroundColor = getColorBackground()
    if (backgroundColor) backgroundColor.style.backgroundColor = firstColor

    const isWin = getInActiveColorList().length === 0
    if (isWin) {
      // set timer text
      setTimerText('You win🎉')
      // show play again button
      showPlayAgainButton()
      timer.clear()
    }

    selections = []
    return
  }

  // in case not match
  // remove class for 2 li element
  gameStatus = GAME_STATUS.BLOCKING

  setTimeout(() => {
    selections[0].classList.remove('active')
    selections[1].classList.remove('active')

    selections = []

    if (gameStatus !== GAME_STATUS.FINISHED) {
      gameStatus = GAME_STATUS.PLAYING
    }
  }, 500)
}

function initColors() {
  // random 8 pair of colors
  const colorList = getRandomColorPairs(PAIRS_COUNT)
  // bind to li > div.overlay
  const liList = getColorElementList()
  liList.forEach((liElement, index) => {
    liElement.dataset.color = colorList[index]

    const overlayElement = liElement.querySelector('.overlay')
    if (overlayElement) overlayElement.style.backgroundColor = colorList[index]
  })
}

function attachEventForColorList() {
  const ulElement = getColorListElement()
  if (!ulElement) return

  ulElement.addEventListener('click', (event) => {
    if (event.target.tagName !== 'LI') return

    handleColorClick(event.target)
  })
}

function resetGame() {
  // reset global variables
  selections = []
  gameStatus = GAME_STATUS.PLAYING
  // reset dom
  // -clear class from li Element
  const liList = getColorElementList()
  for (const liElement of liList) {
    liElement.classList.remove('active')
  }
  // -reset timer text
  setTimerText('')
  // -hide play again button
  hidePlayAgainButton()
  // reset backgroundColor
  const backgroundColor = getColorBackground()
  if (backgroundColor) backgroundColor.style.backgroundColor = 'goldenrod'
  // -re-generate colors
  initColors()
  // start timer
  timer.start()
}

function attachEventForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (!playAgainButton) return

  playAgainButton.addEventListener('click', resetGame)
}

function attachEventForPlayButton() {
  const playButton = getPlayButton()
  if (!playButton) return

  playButton.addEventListener('click', startTimer)
}

function hidePlayButton() {
  const playAgainButton = getPlayButton()
  if (playAgainButton) playAgainButton.style.display = 'none'
}

function startTimer() {
  hidePlayButton()
  timer.start()
}

;(() => {
  initColors()
  attachEventForColorList()
  attachEventForPlayButton()
  attachEventForPlayAgainButton()
})()
