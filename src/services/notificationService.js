/**
 * Service to manage local browser notifications for workout reminders.
 * Checks if the user hasn't worked out in 24 hours and sends a creative reminder.
 */

const NOTIFICATION_MESSAGES = {
  workout: [
    {
      title: 'Monstro! 🦾',
      body: 'Já se passaram 24h desde o seu último treino. A ferrugem não dorme, vamos pro play?'
    },
    {
      title: 'Alerta de Inatividade! 🚨',
      body: 'O ferro está te esperando. 24h sem treinar é muito tempo, bora gastar energia!'
    },
    {
      title: 'Cadê o foco? 🎯',
      body: 'O treino de ontem foi bom, mas o de hoje vai ser lendário. Hora do show!'
    },
    {
      title: 'Toc toc... 🚪',
      body: 'Suas metas de treino estão te chamando. Já deu 24h desde o último pump!'
    },
    {
      title: 'Não desista agora! 💪',
      body: 'Seu corpo agradece o estímulo diário. Bora queimar calorias e ganhar XP!'
    },
    {
      title: 'Sem desculpas! 👊',
      body: 'Mais de 24h sem treinar. O sofá é confortável, mas não constrói massa muscular!'
    },
    {
      title: 'Chama que vem! 🔥',
      body: 'Hora de manter a constância. Pegue sua garrafinha e vamos esmagar as metas de hoje!'
    },
    {
      title: 'Disciplina > Motivação! 🧠',
      body: 'Nem todo dia há motivação, mas a disciplina te leva ao treino hoje. Vamos!'
    },
    {
      title: 'Hora de agir! ⚡',
      body: 'A preguiça diz "amanhã", mas os resultados dizem "hoje". Te vejo na academia!'
    }
  ],
  diet: [
    {
      title: 'Abasteça a máquina! 🍳',
      body: 'Para reconstruir essas fibras musculares, não esqueça do seu aporte de proteínas e calorias de hoje!'
    },
    {
      title: 'Meta de hoje: Beber água! 💧',
      body: 'Hidratação é fundamental para força e hipertrofia. Beba água e registre na tela de Dieta!'
    },
    {
      title: 'Foco na dieta! 🍎',
      body: 'Alimentação limpa acelera seus resultados. Registrou suas refeições de hoje?'
    },
    {
      title: 'Combustível de qualidade! 🍗',
      body: 'Cada refeição limpa te deixa mais perto das suas metas. Registre seus macros!'
    }
  ],
  rest: [
    {
      title: 'Descanso também é treino! 😴',
      body: 'Dê descanso aos seus músculos para que eles possam se recuperar e crescer hoje.'
    },
    {
      title: 'Recupere as energias! 🛌',
      body: 'Dormir bem e descansar é fundamental para o ganho de força e massa muscular.'
    },
    {
      title: 'O descanso faz parte do plano! 💤',
      body: 'Evite o overtraining. Hoje é dia de recuperar as energias para o próximo pump!'
    }
  ]
};

export const notificationService = {
  /**
   * Check if notifications are enabled by the user in settings.
   * @returns {boolean}
   */
  isEnabled() {
    return localStorage.getItem('gym_notifications_enabled') === 'true';
  },

  /**
   * Request permission from the browser to show notifications.
   * @returns {Promise<boolean>}
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações de desktop.');
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * Show a local desktop or PWA push notification.
   * @param {string} title 
   * @param {string} body 
   */
  sendNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Try using PWA service worker first for background capability
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: 'gym-workout-reminder',
          renotify: true
        });
      }).catch((err) => {
        console.error('Erro ao exibir via Service Worker, usando fallback:', err);
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          tag: 'gym-workout-reminder'
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        tag: 'gym-workout-reminder'
      });
    }
  },

  /**
   * Dispara uma notificação de teste contendo uma mensagem aleatória de qualquer categoria.
   */
  sendTestNotification() {
    const allMessages = [
      ...NOTIFICATION_MESSAGES.workout,
      ...NOTIFICATION_MESSAGES.diet,
      ...NOTIFICATION_MESSAGES.rest
    ];
    const randomMsg = allMessages[Math.floor(Math.random() * allMessages.length)];
    this.sendNotification(
      `[Teste] ${randomMsg.title}`,
      randomMsg.body
    );
  },

  /**
   * Checks the workout history to see if it's been more than 24 hours since the last session.
   * If yes, and we haven't notified recently, it fires a random notification.
   * @param {Array} sessions 
   */
  checkAndTriggerReminder(sessions) {
    if (!this.isEnabled()) return;
    if (!sessions || sessions.length === 0) return;

    // 1. Evitar notificações fora do horário social (22h - 08h)
    const currentHour = new Date().getHours();
    if (currentHour < 8 || currentHour >= 22) {
      console.log('[Notification Service] Notificações silenciadas no horário de silêncio (22h - 8h).');
      return;
    }

    // Get the most recent session
    // Sessions in store are sorted by date ascending (oldest first, newest last)
    const lastSession = sessions[sessions.length - 1];
    if (!lastSession || !lastSession.date) return;

    const lastSessionDate = new Date(lastSession.date);
    const timeSinceLastWorkout = Date.now() - lastSessionDate.getTime();
    const hoursSinceLastWorkout = timeSinceLastWorkout / (1000 * 60 * 60);

    // If more than 24 hours has passed since the last workout
    if (hoursSinceLastWorkout >= 24) {
      const lastNotified = localStorage.getItem('gym_last_notified_timestamp');
      const timeSinceLastNotification = lastNotified ? Date.now() - Number(lastNotified) : Infinity;
      const hoursSinceLastNotification = timeSinceLastNotification / (1000 * 60 * 60);

      // Only notify if it's been at least 12 hours since our last notification (prevent spam)
      if (hoursSinceLastNotification >= 12) {
        // Escolher aleatoriamente entre categorias (60% treino, 25% dieta, 15% descanso)
        const rand = Math.random();
        let messagePool = NOTIFICATION_MESSAGES.workout;
        
        if (rand < 0.25) {
          messagePool = NOTIFICATION_MESSAGES.diet;
        } else if (rand >= 0.25 && rand < 0.40) {
          messagePool = NOTIFICATION_MESSAGES.rest;
        }

        const randomMsg = messagePool[Math.floor(Math.random() * messagePool.length)];
        
        this.sendNotification(randomMsg.title, randomMsg.body);
        
        // Save the timestamp of when we notified the user
        localStorage.setItem('gym_last_notified_timestamp', Date.now().toString());
      }
    }
  }
};
