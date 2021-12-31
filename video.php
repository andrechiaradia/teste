<?php

header('Referrer-Policy: same-origin');

?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta http-equiv="X-UA-Compatible" content="ie=edge">
   <title>Talk Simulator</title>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="assets/styles.css">

   <script defer src="https://unpkg.com/alpinejs"></script>
   <script defer src="assets/script.js"></script>
</head>

<body x-data="{welcome: true, step: -2}" x-effect="() => {
   if(step === 1){
      welcome = false
      handleStart()
   }
   }">
   <main class="container">
      <div class="video-container embed-responsive-16by9">
         <div class="video">
            <video id="video"  class="video-js vjs-default-skin" controls
 preload="auto" width="640" height="264"></video>
         </div>
         <div class="welcome" x-show="welcome" x-transition>
            <header class="header-flex">
               <img class="logo" src="assets/English-Pass-logo.png" alt="English Pass">
               <span class="name">TALK SIMULATOR</span>
            </header>
            <div class="tutorial" x-show="step <= 0">
               <div class="tutorial-step step-one" x-show="step === -2" x-transition:enter>
                  <h2>Prepare seu microfone</h2>
                  <p>Você terá que responder as perguntas em voz alta ao longo de sua jornada.</p>
               </div>
               <div class="tutorial-step step-two" x-show="step === -1" x-cloak x-transition:enter>
                  <h2>A ou B?</h2>
                  <p>Algumas opções de respostas serão exibidas a cada pergunta. Escolha uma e fale em voz alta!</p>
               </div>
               <div class="tutorial-step step-three" x-show="step === 0" x-cloak x-transition:enter>
                  <h2>Excelente pronúncia!</h2>
                  <p>Avaliamos e pontuamos sua pronúncia de acordo com a resposta. Tudo pronto? Vamos lá!</p>
               </div>
            </div>
            <div class="nav" x-show="step <= 0">
               <div class="tickers">
                  <template x-for="eStep in [-2, -1, 0]">
                     <span class="ticker" x-bind:class="eStep === step && 'ticker-current'"></span>
                  </template>
               </div>
               <button class="btn" x-on:click="step++">
                  <template x-if="step === 0">
                     <span>Começar</span>
                  </template>
                  <template x-if="step < 0">
                     <img src="assets/arrow.svg" alt="Próximo">
                  </template>
               </button>
            </div>
         </div>
         <div class="overlay">
            <div class="answers-log">
               <strong>Resultados</strong>
               <ol class="answers-log-list"></ol>
            </div>
            <button class="try-again">Tentar novamente</button>
            <button class="play-again" x-click="step = 1">Reiniciar</button>
            <div class="results">
               <div class="results-number"></div>
               <div class="results-text"></div>
            </div>
         </div>
         <div class="mic-status show mic-status-inative" x-show="step > 0" x-cloak>
            <span class="mic-icon"></span>
            <span class="mic-status-text">Responda agora</span>
         </div>

         <div class="progress-bar"></div>
      </div>

      <div class="choices-container" x-cloak>
         <span class="choice"></span>
         <span class="choice"></span>
         <span class="choice"></span>
         <span class="choice"></span>
      </div>
   </main>
</body>
</html>
