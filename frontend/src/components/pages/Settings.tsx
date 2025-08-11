import { Card } from '../ui/Card';
import { Settings as SettingsIcon, Database, Server, Bell, Shield } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-moon-primary" />
        <h1 className="text-2xl font-semibold text-neutral-100">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do Sistema */}
        <Card title="Sistema">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Server className="h-5 w-5 text-moon-primary" />
              <span className="text-neutral-300 font-medium">Configurações Gerais</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Modo Escuro</span>
              <div className="w-12 h-6 bg-moon-primary/20 rounded-full relative">
                <div className="w-5 h-5 bg-moon-primary rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Atualizações em Tempo Real</span>
              <div className="w-12 h-6 bg-moon-primary/20 rounded-full relative">
                <div className="w-5 h-5 bg-moon-primary rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Notificações Push</span>
              <div className="w-12 h-6 bg-neutral-600 rounded-full relative">
                <div className="w-5 h-5 bg-neutral-400 rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Configurações de Banco */}
        <Card title="Banco de Dados">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-5 w-5 text-moon-primary" />
              <span className="text-neutral-300 font-medium">Status das Conexões</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">MongoDB</span>
              <span className="text-emerald-400 text-sm">Conectado</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Redis</span>
              <span className="text-emerald-400 text-sm">Conectado</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Limpeza Automática</span>
              <span className="text-neutral-400 text-sm">30 dias</span>
            </div>
          </div>
        </Card>

        {/* Configurações de IA */}
        <Card title="Inteligência Artificial">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="h-5 w-5 text-moon-primary" />
              <span className="text-neutral-300 font-medium">Análise Automática</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Provider</span>
              <span className="text-moon-primary text-sm">Heurístico</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Análise Automática</span>
              <div className="w-12 h-6 bg-moon-primary/20 rounded-full relative">
                <div className="w-5 h-5 bg-moon-primary rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Sugestões</span>
              <div className="w-12 h-6 bg-moon-primary/20 rounded-full relative">
                <div className="w-5 h-5 bg-moon-primary rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Configurações de Segurança */}
        <Card title="Segurança">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-5 w-5 text-moon-primary" />
              <span className="text-neutral-300 font-medium">Configurações de Segurança</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">INGEST_TOKEN</span>
              <span className="text-neutral-400 text-sm">Configurado</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Rate Limiting</span>
              <span className="text-emerald-400 text-sm">100/15min</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Logs de Acesso</span>
              <div className="w-12 h-6 bg-moon-primary/20 rounded-full relative">
                <div className="w-5 h-5 bg-moon-primary rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
