import { supabase } from '@/plugins/supabase';

const QUEUE_KEY = 'gymtrack_sync_queue';

export const syncService = {
  getQueue() {
    const queueStr = localStorage.getItem(QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  },

  setQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  addToQueue(actionType, payload) {
    const queue = this.getQueue();
    queue.push({
      id: crypto.randomUUID(), // Identificador único da tarefa na fila
      type: actionType,
      payload,
      timestamp: Date.now()
    });
    this.setQueue(queue);
    console.log(`[Sync Queue] Added ${actionType} to queue.`);
  },

  removeFromQueue(taskId) {
    let queue = this.getQueue();
    queue = queue.filter(task => task.id !== taskId);
    this.setQueue(queue);
  },

  async processQueue() {
    if (!navigator.onLine) {
      console.log('[Sync Queue] Offline, skipped processing.');
      return;
    }

    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[Sync Queue] Processing ${queue.length} tasks...`);

    for (const task of queue) {
      try {
        await this.executeTask(task);
        // Se a tarefa teve sucesso (não lançou erro de rede), removemos da fila
        this.removeFromQueue(task.id);
        console.log(`[Sync Queue] Task ${task.type} processed successfully.`);
      } catch (error) {
        console.error(`[Sync Queue] Failed to process task ${task.type}:`, error);
        
        // Se for erro da API do Supabase (ex: coluna não encontrada, PGRST204), não adianta tentar de novo.
        // Removemos da fila para não travar os próximos envios.
        // Se não tiver error.code, assumimos que é erro de rede (offline) e mantemos na fila.
        if (error && error.code) {
          console.warn(`[Sync Queue] Discarding unrecoverable task ${task.id} due to API error: ${error.code}`);
          this.removeFromQueue(task.id);
          continue; // Pula para a próxima tarefa
        }

        break; // Interrompe a execução para manter a ordem se falhou por internet (erro de rede)
      }
    }
  },

  async executeTask(task) {
    const { type, payload } = task;

    switch (type) {
      case 'ADD_ROUTINE': {
        const { exercises, ...routineData } = payload;
        
        // 1. Inserir a rotina com o ID gerado no frontend
        const { error: routineError } = await supabase
          .from('routines')
          .insert([routineData]);
        
        if (routineError) throw routineError;

        // 2. Inserir exercícios
        if (exercises && exercises.length > 0) {
          const exercisesToInsert = exercises.map(ex => ({
            ...ex,
            routine_id: routineData.id // Relacionamento com o ID gerado localmente
          }));

          const { error: exercisesError } = await supabase
            .from('exercises')
            .insert(exercisesToInsert);

          if (exercisesError) throw exercisesError;
        }
        break;
      }
      
      case 'UPDATE_ROUTINE': {
        const { exercises, ...routineData } = payload;

        // 1. Atualizar a rotina
        const { error: routineError } = await supabase
          .from('routines')
          .update(routineData)
          .eq('id', routineData.id);
        
        if (routineError) throw routineError;

        // 2. Apagar exercícios antigos
        const { error: deleteError } = await supabase
          .from('exercises')
          .delete()
          .eq('routine_id', routineData.id);

        if (deleteError) throw deleteError;

        // 3. Inserir novos exercícios
        if (exercises && exercises.length > 0) {
          const exercisesToInsert = exercises.map(ex => ({
            ...ex,
            routine_id: routineData.id
          }));

          const { error: exercisesError } = await supabase
            .from('exercises')
            .insert(exercisesToInsert);

          if (exercisesError) throw exercisesError;
        }
        break;
      }
      
      case 'DELETE_ROUTINE': {
        const { error } = await supabase
          .from('routines')
          .delete()
          .eq('id', payload.id);

        if (error) throw error;
        break;
      }

      case 'ADD_SESSION': {
        const { error } = await supabase.from('sessions').insert([payload]);
        if (error) throw error;
        break;
      }

      case 'LOG_WEIGHT': {
        const { error } = await supabase.from('weight_logs').insert([payload]);
        if (error) throw error;
        break;
      }

      case 'LOG_BF': {
        const { error } = await supabase.from('bf_logs').insert([payload]);
        if (error) throw error;
        break;
      }

      case 'LOG_MEASUREMENT': {
        const { error } = await supabase.from('measurements').insert([payload]);
        if (error) throw error;
        break;
      }

      case 'UPDATE_GOALS': {
        const { data } = await supabase.from('user_goals').select('user_id').eq('user_id', payload.user_id).single();
        if (!data) {
          const { error } = await supabase.from('user_goals').insert([payload]);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('user_goals').update(payload).eq('user_id', payload.user_id);
          if (error) throw error;
        }
        break;
      }

      case 'UPDATE_GAMIFICATION': {
        const { data } = await supabase.from('user_gamification').select('user_id').eq('user_id', payload.user_id).single();
        if (!data) {
          const { error } = await supabase.from('user_gamification').insert([payload]);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('user_gamification').update(payload).eq('user_id', payload.user_id);
          if (error) throw error;
        }
        break;
      }

      default:
        console.warn(`[Sync Queue] Unknown task type: ${type}`);
        // Removendo silenciosamente tarefas desconhecidas para não travar a fila
        break;
    }
  }
};
