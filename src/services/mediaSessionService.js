// Base64 de um arquivo de áudio WAV de 1 segundo de puro silêncio
const SILENT_AUDIO_BASE64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
let audioNode = null;

export const mediaSessionService = {
  // Inicializa e começa a tocar o áudio silencioso para manter o PWA rodando em segundo plano
  startBackgroundMode() {
    try {
      if (!audioNode) {
        audioNode = new Audio(SILENT_AUDIO_BASE64);
        audioNode.loop = true;
      }
      
      // Toca o áudio silencioso
      audioNode.play().catch(err => {
        console.warn('Reprodução automática de áudio bloqueada pelo navegador. Aguardando interação do usuário.', err);
        
        // Se falhar devido ao bloqueio de reprodução automática (autoplay policy),
        // tenta reproduzir no primeiro clique/toque do usuário na tela.
        const playOnInteraction = () => {
          if (audioNode) {
            audioNode.play()
              .then(() => {
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
              })
              .catch(e => console.error('Falha ao tentar tocar áudio após interação do usuário:', e));
          }
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
      });
    } catch (error) {
      console.error('Erro ao configurar o áudio silencioso:', error);
    }
  },

  // Pausa o áudio e reseta a sessão de mídia
  stopBackgroundMode() {
    try {
      if (audioNode) {
        audioNode.pause();
        audioNode.currentTime = 0;
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    } catch (error) {
      console.error('Erro ao parar o áudio de background:', error);
    }
  },

  // Atualiza as informações exibidas na tela de bloqueio e na central de notificações
  updateLockScreen(exerciseName, setInfo, formattedTime) {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: exerciseName || 'Treino em Andamento',
          artist: `Série: ${setInfo} | Tempo: ${formattedTime}`,
          album: 'Gym Track',
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
        
        // Define o estado de reprodução como tocando para habilitar o widget na tela bloqueada
        navigator.mediaSession.playbackState = 'playing';
      } catch (error) {
        console.error('Erro ao atualizar a Media Session da tela de bloqueio:', error);
      }
    }
  },

  // Associa os botões físicos do celular/tela de bloqueio às funções do Vue
  setupControls({ onNextTrack, onPreviousTrack }) {
    if ('mediaSession' in navigator) {
      try {
        if (onNextTrack) {
          navigator.mediaSession.setActionHandler('nexttrack', onNextTrack);
        }
        if (onPreviousTrack) {
          navigator.mediaSession.setActionHandler('previoustrack', onPreviousTrack);
        }
        
        // Adiciona play e pause padrão para evitar que o widget suma caso o usuário clique neles
        navigator.mediaSession.setActionHandler('play', () => {
          if (audioNode) audioNode.play().catch(() => {});
          navigator.mediaSession.playbackState = 'playing';
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioNode) audioNode.pause();
          navigator.mediaSession.playbackState = 'paused';
        });
      } catch (error) {
        console.error('Erro ao configurar os controles físicos de mídia:', error);
      }
    }
  }
};
