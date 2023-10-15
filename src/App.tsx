import { useEffect, useRef, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import useSound from 'use-sound'

import { ModeToggle } from './components/mode-toggle'
import { Button } from './components/ui/button'

import { Github, Volume2, VolumeX } from 'lucide-react'

import { Helmet, HelmetProvider } from 'react-helmet-async'

const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 500
const INITIAL_SNAKE = [[480, 480]]
const INITIAL_FOOD = [ (Math.floor(Math.random() * 23) + 1 ) * 20, (Math.floor(Math.random() * 23) + 1 ) * 20]

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)

  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState<number[]>(INITIAL_FOOD) // [ x, y ]
  const [movement, setMovement] = useState<number[]>([ 0, 0 ]) // [ x, y ]

  const [score, setScore] = useState<number>(0)
  const [bestScore, setBestScore] = useState<number>(localStorage.getItem('bestScore') ? Number(localStorage.getItem('bestScore')) : 0)

  const [gameOver, setGameOver] = useState<boolean>(false)

  const [darkMode, setDarkMode] = useState<boolean>(true)

  const [soundMute, setSoundMute] = useState<boolean>(localStorage.getItem('soundMute') ? localStorage.getItem('soundMute') === "true" : false)
  const [eatSound] = useSound('./eat.mp3', { volume: 3.5 })
  const [loseSound] = useSound('./lost.mp3', { volume: 0.25 })

  function runGame() {
    if (document.documentElement.classList.contains('dark') && darkMode == false) {
      setDarkMode(true) 
    } 
    
    if (document.documentElement.classList.contains('light') && darkMode == true) { 
      setDarkMode(false)
    }

    if (movement[0] == 0 && movement[1] == 0) return
    if (gameOver) return

    const newSnake = [ ...snake ]
    const newHead = [ snake[0][0] + movement[0] * 20 , snake[0][1] + movement[1] * 20 ]

    newSnake.unshift(newHead)

    if (newHead[0] == food[0] && newHead[1] == food[1]) {
      if (soundMute == false) {
          eatSound()
      }
      const newScore = score + 1
      setFood([ (Math.floor(Math.random() * 23) + 1 ) * 20, (Math.floor(Math.random() * 23) + 1 ) * 20 ])

      if (newScore > bestScore) {
        setBestScore(newScore)
        console.log(bestScore)
      }

      setScore(newScore)
    } else {
      newSnake.pop()
    }

    if (newHead[0] < 0 || newHead[0] > CANVAS_WIDTH - 20 || newHead[1] < 0 || newHead[1] > CANVAS_HEIGHT - 20 ) {
      setGameOver(true)
      if (soundMute == false) {
          loseSound()
        }
      localStorage.setItem('bestScore', bestScore.toString())
    }

    newSnake.forEach((segment, index) => {
      if (index === 0) return
      if (newHead[0] === segment[0] && newHead[1] === segment[1]) {
        setGameOver(true)
        if (soundMute == false) {
          loseSound()
        }
        localStorage.setItem('bestScore', bestScore.toString())
      }
    })

    setSnake(newSnake)
  }

  function startGame() {
    setGameOver(false)
    setMovement([ 0, 0 ])
    setScore(0)
    setSnake(INITIAL_SNAKE)
    setFood([ (Math.floor(Math.random() * 23) + 1 ) * 20, (Math.floor(Math.random() * 23) + 1 ) * 20 ])
  }

  function changeMovement(input: KeyboardEvent) {
    switch (input.key) {
      case 'ArrowUp': {
        movement[1] === 0 ? setMovement([ 0, -1 ]) : null
        break
      }
      case 'ArrowDown': {
        movement[1] === 0 ? setMovement([ 0, 1 ]) : null
        break
      }
      case 'ArrowLeft': {
        movement[0] === 0 ? setMovement([ -1, 0 ]) : null
        break
      }
      case 'ArrowRight': {
        movement[0] === 0 ? setMovement([ 1, 0 ]) : null
        break
      }
      case 'Enter': {
        if (gameOver == true) {
          startGame()
        }
        break
      }
      // case '/': {
      //   const increment = movement[0] !== 0 ? [ 20, 0 ] : [ 0, 20 ]
      //   setSnake([ ...snake, [ snake[snake.length - 1][0] + increment[0], snake[snake.length - 1][1] + increment[1]]])
      //   break
      // }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', changeMovement)

    return () => window.removeEventListener('keydown', changeMovement)
  })

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')

    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (gameOver) {
      return
    }

    if (food) {
      ctx.fillStyle = 'red'
      ctx.fillRect(food[0], food[1], 20, 20)
    }

    if (darkMode == true) {
      ctx.fillStyle = 'white'
    } else {
      ctx.fillStyle = 'black'
    }
    
    snake.forEach(([ x, y ]) => ctx.fillRect(x, y, 20, 20))
  } , [ snake, gameOver, food, darkMode ])

  useInterval(() => {
    runGame()
  }, 150)

  return (
    <HelmetProvider>
      <Helmet>
        <title>Snake | edrf12</title>
      </Helmet>
      <div className='dark:bg-zinc-950 bg-zinc-100 flexbox'>  
        <div className="border-b flex h-[8vh] w-screen items-center justify-center px-4">
          <div className='h-10 w-[8rem]' />
          <p className='text-xl font-medium  font-mono mx-auto'>
            Snake Game
          </p>
          <div className='flex gap-1'>
            <Button variant='outline' size='icon' onClick={() => window.open('https://github.com/edrf12/snake')}>
              <Github className='h-[1.2rem] w-[1.2rem] scale-100 transition-all' />
            </Button>
            <ModeToggle />
            <Button variant="outline" size="icon" onClick={() => {
              if (soundMute == true) {
                setSoundMute(false)
                localStorage.setItem('soundMute', 'false')
              } else {
                setSoundMute(true)
                localStorage.setItem('soundMute', 'true')
              }
            }}>
              <Volume2 className={`h-[1.2rem] w-[1.2rem] transition-all ${soundMute? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`}/>
              <VolumeX className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${soundMute? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col h-[92vh] items-center justify-center px-4">
          <div className='relative mx-auto'>
            <canvas className='border rounded-lg p-1' ref={canvas} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
            <p className={`${gameOver? null : 'invisible'} first-letter:z-10 relative -top-[32vh] text-center text-xl text-red-600 font-medium font-mono`}>
              Game Over <br />
              Press ENTER to restart
            </p>
          </div>
          <div>
            <p className='text-sm text-center font-medium font-mono border rounded-lg p-4'>
              Score: {score} <br />
              Best: {bestScore}
            </p>
          </div>
        </div>
      </div>
    </HelmetProvider>
  )
}

export default App
