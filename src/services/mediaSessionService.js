let audioNode = null;

export const mediaSessionService = {
  // Inicializa e começa a tocar o áudio silencioso para manter o PWA rodando em segundo plano
  startBackgroundMode() {
    try {
      console.log('[MediaSession] Solicitando inicialização do modo de background...');
      if (!audioNode) {
        audioNode = new Audio('/silence.wav');
        audioNode.loop = true;
      }
      
      // Toca o áudio silencioso
      audioNode.play()
        .then(() => {
          console.log('[MediaSession] Áudio silencioso iniciado com sucesso.');
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch(err => {
          console.warn('[MediaSession] Reprodução automática bloqueada. Aguardando interação do usuário...', err.message);
          
          // Se falhar devido ao bloqueio de autoplay,
          // tenta reproduzir no primeiro clique ou toque do usuário na tela.
          const playOnInteraction = () => {
            if (audioNode) {
              audioNode.play()
                .then(() => {
                  console.log('[MediaSession] Áudio silencioso iniciado via clique do usuário.');
                  if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                  }
                  document.removeEventListener('click', playOnInteraction);
                  document.removeEventListener('touchstart', playOnInteraction);
                })
                .catch(e => console.error('[MediaSession] Falha ao tocar áudio após clique:', e.message));
            }
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        });
    } catch (error) {
      console.error('[MediaSession] Erro ao configurar o áudio:', error);
    }
  },

  // Pausa o áudio e reseta a sessão de mídia
  stopBackgroundMode() {
    try {
      console.log('[MediaSession] Parando modo de background...');
      if (audioNode) {
        audioNode.pause();
        audioNode.currentTime = 0;
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    } catch (error) {
      console.error('[MediaSession] Erro ao parar modo de background:', error);
    }
  },

  // Atualiza as informações exibidas na tela de bloqueio e na central de notificações
  updateLockScreen(exerciseName, setInfo, formattedTime) {
    if ('mediaSession' in navigator) {
      try {
        console.log(`[MediaSession] Atualizando widget: ${exerciseName} | Série: ${setInfo} | Tempo: ${formattedTime}`);
        navigator.mediaSession.metadata = new MediaMetadata({
          title: exerciseName || 'Treino em Andamento',
          artist: `Série: ${setInfo} | Tempo: ${formattedTime}`,
          album: 'Gym Track',
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch (error) {
        console.error('[MediaSession] Erro ao atualizar metadados:', error);
      }
    } else {
      console.warn('[MediaSession] API não suportada pelo navegador atual.');
    }
  },

  // Associa os botões físicos do celular/tela de bloqueio às funções do Vue
  setupControls({ onNextTrack, onPreviousTrack }) {
    if ('mediaSession' in navigator) {
      try {
        console.log('[MediaSession] Configurando gatilhos de botões físicos...');
        if (onNextTrack) {
          navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log('[MediaSession] Botão de avançar pressionado fisicamente.');
            onNextTrack();
          });
        }
        if (onPreviousTrack) {
          navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log('[MediaSession] Botão de retroceder pressionado fisicamente.');
            onPreviousTrack();
          });
        }
        
        navigator.mediaSession.setActionHandler('play', () => {
          console.log('[MediaSession] Botão Play pressionado no widget.');
          if (audioNode) audioNode.play().catch(() => {});
          navigator.mediaSession.playbackState = 'playing';
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log('[MediaSession] Botão Pause pressionado no widget.');
          if (audioNode) audioNode.pause();
          navigator.mediaSession.playbackState = 'paused';
        });
      } catch (error) {
        console.error('[MediaSession] Erro ao configurar eventos físicos:', error);
      }
    }
  }
};
