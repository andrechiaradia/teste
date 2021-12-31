const micStatus = document.querySelector('.mic-status')
const progressBar = document.querySelector('.progress-bar')
const results = document.querySelector('.results')
const resultNumber = document.querySelector('.results-number')
const resultText = document.querySelector('.results-text')
const buttonsContainer = document.querySelector('.choices-container')
const buttons = document.querySelectorAll('.choice')
const tryAgain = document.querySelector('.try-again')
const playAgain = document.querySelector('.play-again')
const overlay = document.querySelector('.overlay')

const answersLog = document.querySelector('.answers-log')
const answersList = document.querySelector('.answers-log-list')

const speechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = speechRecognition ? new speechRecognition() : false
const secondsToAnswer = 7

const globalStatus = {
    recording: false,
    loadingVideo: true,
    final: 'no',
    errorsLog: 0,
}
let mediaRecorder
let eventTree
let currentEvent
let player = document.getElementById('video')

progressBar.style.animationDuration = secondsToAnswer + 's'

function updateStatus(icon, text) {
    console.log(text)
    return
}

const parentSearch = new URLSearchParams(parent.location.search)
const talk = parentSearch.get('talk') ? parentSearch.get('talk') : false

if (talk === false) {} else {
    try {
        fetch(`source/${talk}.json`, {
                mode: 'same-origin',
            })
            .then((res) => res.json())
            .then((data) => {
                updateStatus('download_done', 'JSON encontrado.')
                updateStatus('download_done', 'Carregando primeiro vídeo...')
                currentEvent = data
                eventTree = data
                player.src = currentEvent.src
                player.loop = true
                player.onload = videoLoaded
                player.onplay = videoPlayed
                player.ontimeupdate = showAnswers
            })
            .catch((error) => {
                console.error(error)
                updateStatus('warning', 'Erro: JSON não encontrado')
            })
    } catch (error) {
        console.error(error)
        updateStatus('warning', 'Erro: JSON não encontrado')
    }
}

function handleStart() {
    openMic().then((status) => {
        if (status === 'granted') {
            player.play()
            updateButtons()
            updateStatus('record_voice_over', 'Aguardando pergunta no vídeo...')
        }
    })
    return true
}

function videoLoaded(video) {

    updateStatus('play_circle_filled', 'Vídeo ID ' + video.id + ' carregado')
}

function videoPlayed() {

    globalStatus.loadingVideo = false
}

function showResults(error = false) {
    overlay.classList.add('show')
    micStatus.classList.remove('show')
    buttonsContainer.classList.add('inative')
    results.classList.add('show')

    if (!error) {
        return
    }

    tryAgain.classList.add('show')
    results.classList.add('error-result')
}

function hideResults() {

    overlay.classList.remove('show')
    micStatus.classList.add('show')
    buttonsContainer.classList.remove('inative')

    results.classList.remove('show')
    tryAgain.classList.remove('show')

    setTimeout(() => {
        results.classList.remove('error-result')
    }, 601)
}

function openMic() {
    return navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: false,
        })
        .then(() => {
            return 'granted'
        })
        .catch((error) => {
            console.error(error)
            return 'denied'

        })
}

function updateButtons() {
    currentEvent.children.forEach((child, i) => {
        buttons[i].innerHTML = child.text
    })
}

function updateEvent(oldEvent, nextOption) {
    if (oldEvent.children[nextOption].tree)
        currentEvent = eventTree[oldEvent.children[nextOption].tree]
    else currentEvent = oldEvent.children[nextOption]

    return oldEvent
}

function logAnswer(speechOption) {
    const errors =
        globalStatus.errorsLog > 0 ?
        globalStatus.errorsLog === 1 ?
        `(${globalStatus.errorsLog} tentativa)` :
        `(${globalStatus.errorsLog} tentativas)` :
        ''

    globalStatus.errorsLog = 0

    buttons.forEach((button, index) => {
        if (index === speechOption.index) {
            answersList.innerHTML += `<li>${button.textContent} - ${speechOption.percent}% preciso ${errors}</li>`
        }
    })
}

function handleOptionChoice(nextOption) {
    globalStatus.loadingVideo = true
    const oldEvent = updateEvent(currentEvent, nextOption)

    player.pause()
    console.log(player.paused)
    if (player.paused) {

        player.src = currentEvent.src

        player.load()
        console.log(player.src)
        setTimeout(() => {
            player.play()
        }, 3000)

        if (currentEvent.children && 0 === currentEvent.children.length)
            globalStatus.final = 'ended'

        if ('no' === globalStatus.final && currentEvent.children.length > 1)
            updateStatus(
                'record_voice_over',
                'Aguardando pergunta no vídeo...'
            )

    }


    if (oldEvent.children.length > 1) {
        buttons.forEach((button, index) => {
            if (index === nextOption) {
                button.classList.add('choice-correct')
            }
        })
    }

    setTimeout(() => {
        hideResults()

        buttons.forEach((button) => {
            button.style.opacity = 0
            button.classList.remove('choice-correct')
        })

        if (currentEvent.children.length > 1) {
            setTimeout(() => {
                updateButtons()
            }, 1000)
        }
    }, 2000)
}

function handleVideoEnding(e) {
    console.log(player.currentTime)
    if (globalStatus.loadingVideo) {
        return
    }

    if ('stopped' === globalStatus.final) {
        return
    }

    if ('ended' === globalStatus.final) {
        player.loop = false
        globalStatus.final = 'stopped'
        overlay.classList.add('show')
        micStatus.classList.remove('show')
        playAgain.classList.add('show')
        answersLog.classList.add('show')
        playAgain.addEventListener('click', restartGame, { once: true })

        updateStatus('stop', 'Fim da simulação')

    } else {
        if (typeof currentEvent.children === 'undefined') {
            return
        }

        if (currentEvent.children.length === 1) {
            handleOptionChoice(0)
            return
        } else if (
            currentEvent.children.length > 1 &&
            currentEvent.silentTime
        ) {
            console.log("before: " + player.currentTime)
            player.currentTime = currentEvent.silentTime
            console.log("after: " + player.currentTime)
            return
        }
    }
    return

}

function showAnswers(e) {
    console.log(player.currentTime)
    if (player.currentTime > player.duration - 0.5) { handleVideoEnding(e) }
    if (typeof currentEvent.silentTime === 'undefined') {
        return
    }

    if (player.currentTime < currentEvent.silentTime) {
        return
    }

    if (typeof currentEvent.children === 'undefined') {
        return
    }

    if (currentEvent.children.length <= 1) {
        return
    }

    if (globalStatus.recording) {
        return
    }

    if (globalStatus.loadingVideo) {
        return
    }

    if (buttons[0].style.opacity === '1') {
        return
    }

    buttons.forEach((button, index) => {
        if (currentEvent.children[index]) {
            button.style.opacity = 1
        }
    })

    startRecording()
}

async function restartGame() {
    currentEvent = eventTree
    player.src = currentEvent.src
    player.load()
    player.loop = true
    overlay.classList.remove('show')
    micStatus.classList.add('show')
    playAgain.classList.remove('show')
    answersLog.classList.remove('show')
    setTimeout(() => {
        answersList.textContent = ''
    }, 601)
    globalStatus.recording = false
    globalStatus.loadingVideo = true
    globalStatus.final = 'no'
    globalStatus.answersIndex = 0
    globalStatus.errorsLog = 0
    handleStart()
}

function startRecording() {
    hideResults()
    micStatus.classList.remove('mic-status-inative')

    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: false,
        })
        .then(handleSuccess)
        .catch((e) => {
            updateStatus(
                'warning',
                'Erro getUserMedia: ' + e.name + ':' + e.message
            )
        })
}

function detectAnswer(file) {
    const formData = new FormData()
    formData.append(
        'text',
        currentEvent.children.map((child) => child.text).join('\n')
    )
    formData.append('user_audio_file', file)
    for (var key of formData.entries()) {
        console.log(key[0] + ', ' + key[1]);
    }
    return fetch('sendRequest.php', {
            method: 'POST',
            mode: 'same-origin',
            body: formData,
        })
        .then((res) => res.json())
        .then((data) => {
            if ('success' === data.status && data.text_score.quality_score >= 71) {
                for (let i = 0; i < currentEvent.children.length; i++) {
                    if (data.text_score.text === currentEvent.children[i].text) {
                        return {
                            index: i,
                            percent: data.text_score.quality_score,
                        }
                    }
                }
            }

            return {
                index: -1,
                percent: data.text_score.quality_score ?
                    data.text_score.quality_score : 0,
            }
        })
        .catch((error) => {
            console.error(error)
            updateStatus('warning', 'Houve um erro na requisição')
            return {
                index: -1,
                percent: 0,
            }
        })
}

function setTimeToAnswer() {
    if (globalStatus.recording) {
        return
    }

    globalStatus.recording = true
    progressBar.classList.add('in-progress')

    setTimeout(() => {
        mediaRecorder.stop()
        progressBar.classList.remove('in-progress')
    }, 1000 * secondsToAnswer)
}

function handleSuccess(stream) {
    try {
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 64000,
        })
    } catch (ignore) {
        try {
            mediaRecorder = new MediaRecorder(stream)
        } catch (error) {
            updateStatus('warning', 'Erro: ' + error.message)
            throw error
        }
    }

    let recordedChunks = []

    mediaRecorder.start()
    mediaRecorder.onstart = function() {
        updateStatus('mic', 'Gravando áudio...')

        if (typeof recognition === 'object') {
            recognition.lang = 'en-US'
            recognition.start()

            recognition.onerror = function() {
                setTimeToAnswer()
            }

            recognition.onsoundstart = function() {
                globalStatus.recording = true
                updateStatus('mic', 'Estamos te ouvindo...')
            }

            recognition.onspeechend = function() {
                if (globalStatus.recording) {
                    mediaRecorder.stop()
                }
            }
        } else {
            setTimeToAnswer()
        }
    }

    mediaRecorder.ondataavailable = function(e) {
        if (e.data) {
            recordedChunks.push(e.data)
        }
    }

    mediaRecorder.onstop = function() {
        if (!globalStatus.recording) {
            return
        }

        if (!recordedChunks.length) {
            return
        }

        if (typeof recognition === 'object') {
            recognition.stop()
        }

        globalStatus.recording = false
        micStatus.classList.add('mic-status-inative')

        updateStatus('file_upload', 'Enviando seu áudio para análise...')

        detectAnswer(new Blob(recordedChunks)).then((speechOption) => {
            updateStatus(
                'download_done',
                `Resultado recebido: ${speechOption.percent}%`
            )

            resultNumber.textContent = speechOption.percent
            if (speechOption.percent >= 91) {
                resultText.textContent = 'Excelente pronúncia!'
            } else if (speechOption.percent >= 81) {
                resultText.textContent = 'Muito boa pronúncia!'
            } else if (speechOption.percent >= 71) {
                resultText.textContent = 'Boa pronúncia!'
            } else {
                resultText.textContent = 'Que pena. Vamos tentar novamente?'
            }

            if (-1 === speechOption.index) {
                showResults(true)
                globalStatus.errorsLog++
                    tryAgain.addEventListener('click', startRecording, { once: true })
            } else {
                showResults()
                logAnswer(speechOption)
                handleOptionChoice(speechOption.index)
            }
        })
    }
}