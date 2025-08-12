import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import path from 'path';

export interface WorkerTask {
  id: string;
  type: 'log-analysis' | 'log-parsing' | 'log-storage';
  priority: 'low' | 'normal' | 'high';
  data: any;
  timestamp: number;
}

export interface WorkerResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
}

export interface WorkerStats {
  totalWorkers: number;
  activeWorkers: number;
  idleWorkers: number;
  totalTasksProcessed: number;
  averageProcessingTime: number;
  queueLength: number;
  errors: number;
}

export class WorkerPool extends EventEmitter {
  private workers: Worker[] = [];
  private taskQueue: WorkerTask[] = [];
  private activeWorkers = new Set<Worker>();
  private workerScript: string;
  private maxWorkers: number;
  private stats: WorkerStats;

  constructor(maxWorkers = 4, workerScript = 'logWorker.js') {
    super();
    this.maxWorkers = maxWorkers;
    this.workerScript = path.join(__dirname, '..', 'workers', workerScript);
    
    this.stats = {
      totalWorkers: 0,
      activeWorkers: 0,
      idleWorkers: 0,
      totalTasksProcessed: 0,
      averageProcessingTime: 0,
      queueLength: 0,
      errors: 0
    };

    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): Worker {
    const worker = new Worker(this.workerScript, {
      workerData: { workerId: this.workers.length }
    });

    worker.on('message', (result: WorkerResult) => {
      this.handleWorkerResult(worker, result);
    });

    worker.on('error', (error) => {
      console.error('❌ Erro no worker:', error);
      this.stats.errors++;
      this.replaceWorker(worker);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.warn('⚠️ Worker saiu com código:', code);
        this.replaceWorker(worker);
      }
    });

    this.workers.push(worker);
    this.stats.totalWorkers = this.workers.length;
    this.stats.idleWorkers = this.workers.length;
    
    return worker;
  }

  private replaceWorker(failedWorker: Worker): void {
    const index = this.workers.indexOf(failedWorker);
    if (index > -1) {
      this.workers.splice(index, 1);
      this.activeWorkers.delete(failedWorker);
      this.stats.totalWorkers = this.workers.length;
      this.stats.activeWorkers = this.activeWorkers.size;
      this.stats.idleWorkers = this.workers.length - this.activeWorkers.size;
      
      // Cria novo worker para substituir
      this.createWorker();
    }
  }

  private handleWorkerResult(worker: Worker, result: WorkerResult): void {
    this.activeWorkers.delete(worker);
    this.stats.activeWorkers = this.activeWorkers.size;
    this.stats.idleWorkers = this.workers.length - this.activeWorkers.size;
    
    // Atualiza estatísticas
    this.stats.totalTasksProcessed++;
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (this.stats.totalTasksProcessed - 1) + result.processingTime) / 
      this.stats.totalTasksProcessed;

    // Emite resultado
    this.emit('task-completed', result);
    
    // Processa próxima tarefa na fila
    this.processNextTask();
  }

  private processNextTask(): void {
    if (this.taskQueue.length === 0) return;
    
    const availableWorker = this.workers.find(w => !this.activeWorkers.has(w));
    if (!availableWorker) return;

    const task = this.taskQueue.shift()!;
    this.stats.queueLength = this.taskQueue.length;
    
    this.executeTask(availableWorker, task);
  }

  private executeTask(worker: Worker, task: WorkerTask): void {
    this.activeWorkers.add(worker);
    this.stats.activeWorkers = this.activeWorkers.size;
    this.stats.idleWorkers = this.workers.length - this.activeWorkers.size;
    
    worker.postMessage(task);
  }

  async submitTask(task: Omit<WorkerTask, 'id' | 'timestamp'>): Promise<string> {
    const fullTask: WorkerTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    // Adiciona à fila com prioridade
    this.insertTaskWithPriority(fullTask);
    this.stats.queueLength = this.taskQueue.length;
    
    // Tenta processar imediatamente se houver worker disponível
    this.processNextTask();
    
    return fullTask.id;
  }

  private insertTaskWithPriority(task: WorkerTask): void {
    const priorities = { high: 3, normal: 2, low: 1 };
    
    let insertIndex = this.taskQueue.length;
    
    for (let i = 0; i < this.taskQueue.length; i++) {
      const currentTask = this.taskQueue[i];
      if (currentTask && priorities[task.priority] > priorities[currentTask.priority]) {
        insertIndex = i;
        break;
      }
    }
    
    this.taskQueue.splice(insertIndex, 0, task);
  }

  async submitBatch(tasks: Omit<WorkerTask, 'id' | 'timestamp'>[]): Promise<string[]> {
    const taskIds: string[] = [];
    
    for (const task of tasks) {
      const taskId = await this.submitTask(task);
      taskIds.push(taskId);
    }
    
    return taskIds;
  }

  getStats(): WorkerStats {
    return { ...this.stats };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Desligando Worker Pool...');
    
    // Para de aceitar novas tarefas
    this.taskQueue = [];
    
    // Aguarda workers terminarem tarefas ativas
    const activeWorkers = Array.from(this.activeWorkers);
    if (activeWorkers.length > 0) {
      console.log(`⏳ Aguardando ${activeWorkers.length} workers terminarem...`);
      await Promise.all(activeWorkers.map(worker => 
        new Promise<void>((resolve) => {
          worker.once('message', () => resolve());
          // Timeout de segurança
          setTimeout(() => resolve(), 5000);
        })
      ));
    }
    
    // Termina todos os workers
    await Promise.all(this.workers.map(worker => worker.terminate()));
    
    console.log('✅ Worker Pool desligado');
  }

  // Métodos de conveniência para diferentes tipos de tarefas
  async analyzeLog(logData: any, priority: WorkerTask['priority'] = 'normal'): Promise<string> {
    return this.submitTask({
      type: 'log-analysis',
      data: logData,
      priority
    });
  }

  async parseLog(message: string, priority: WorkerTask['priority'] = 'normal'): Promise<string> {
    return this.submitTask({
      type: 'log-parsing',
      data: { message },
      priority
    });
  }

  async storeLog(logData: any, priority: WorkerTask['priority'] = 'normal'): Promise<string> {
    return this.submitTask({
      type: 'log-storage',
      data: logData,
      priority
    });
  }
}
