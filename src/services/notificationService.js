let backgroundAudio = null;

export const notificationService = {
  // Inicializa e inicia a reprodução do áudio silencioso em segundo plano
  startBackgroundAudio() {
    try {
      if (!backgroundAudio) {
        backgroundAudio = new Audio('/silence.wav');
        backgroundAudio.loop = true;
      }
      
      if (backgroundAudio.paused) {
        console.log('[NotificationService] Iniciando áudio silencioso em background...');
        backgroundAudio.play().catch(error => {
          console.warn('[NotificationService] Reprodução automática de áudio bloqueada ou falhou:', error);
        });
      }
    } catch (error) {
      console.error('[NotificationService] Erro ao iniciar áudio silencioso:', error);
    }
  },

  // Pausa a execução do áudio silencioso
  stopBackgroundAudio() {
    try {
      if (backgroundAudio && !backgroundAudio.paused) {
        console.log('[NotificationService] Parando áudio silencioso de background...');
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
      }
    } catch (error) {
      console.error('[NotificationService] Erro ao parar áudio silencioso:', error);
    }
  },

  // Solicita permissão ao usuário para disparar notificações
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('[NotificationService] Este navegador não suporta notificações locais.');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    try {
      const permission = await Notification.requestPermission();
      console.log(`[NotificationService] Permissão de notificação: ${permission}`);
      return permission === 'granted';
    } catch (error) {
      console.error('[NotificationService] Erro ao solicitar permissão:', error);
      return false;
    }
  },

  // Dispara ou atualiza a notificação persistente do treino
  async showWorkoutNotification(routineName, exerciseName, setInfo, formattedTime) {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.warn('[NotificationService] Sem permissão para enviar notificações.');
        return;
      }

      // Obtém o registro do Service Worker ativo do PWA
      const registration = await navigator.serviceWorker.ready;
      
      const title = `🏋️‍♂️ Gym Track: ${routineName || 'Treino'}`;
      const options = {
        body: `Duração: ${formattedTime || '00:00'}\nExercício: ${exerciseName || 'Iniciando...'}\nSérie: ${setInfo || '-'}`,
        tag: 'active-workout-session', // Garante que a notificação anterior seja substituída
        icon: '/pwa-192x192.png',
        badge: '/favicon.ico',
        silent: true,        // Garante que não faça som/vibração a cada série marcada
        renotify: false,      // Evita disparar alertas repetidos ao atualizar o card
        requireInteraction: true // Mantém a notificação visível na tela até ser fechada por código ou ação do usuário
      };

      console.log(`[NotificationService] Atualizando notificação [Tempo: ${formattedTime || '00:00'} | Exercício: ${exerciseName} (${setInfo})]`);
      await registration.showNotification(title, options);
    } catch (error) {
      console.error('[NotificationService] Erro ao exibir notificação local:', error);
    }
  },

  // Fecha e remove a notificação ativa do treino
  async closeNotification() {
    try {
      console.log('[NotificationService] Fechando notificação de treino ativo...');
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications({ tag: 'active-workout-session' });
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('[NotificationService] Erro ao fechar a notificação:', error);
    }
  }
};

