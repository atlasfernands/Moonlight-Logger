import { Card } from '../ui/Card';
import { Info, Code, Database, Zap, Shield, Github, Moon } from 'lucide-react';

export function About() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Info className="h-6 w-6 text-moon-primary" />
        <h1 className="text-2xl font-semibold text-neutral-100">Sobre o Projeto</h1>
      </div>

      {/* Visão Geral */}
      <Card title="Visão">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <Moon className="h-5 w-5 text-moon-primary" />
            <span className="text-neutral-300 font-medium">Moonlight Logger</span>
          </div>
          <p className="text-neutral-300 leading-relaxed">
            Um sistema inteligente de logging para aplicações Node.js, com análise automática e painel web dark mode — 
            em tempo real via Socket.IO. Inspirado na vibe "Filho da Lua", oferece clareza para debugging com 
            registro, entendimento e ação sobre logs rapidamente.
          </p>
        </div>
      </Card>

      {/* Stack Tecnológica */}
      <Card title="Stack Tecnológica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Code className="h-5 w-5 text-moon-primary" />
              <span className="text-neutral-300 font-medium">Backend</span>
            </div>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• Node.js 18+</li>
              <li>• TypeScript</li>
              <li>• Express.js</li>
              <li>• MongoDB (Mongoose)</li>
              <li>• Redis (BullMQ)</li>
              <li>• Socket.IO</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-moon-primary" />
              <span className="text-neutral-300 font-medium">Frontend</span>
            </div>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• React 18+</li>
              <li>• Vite</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS 3.2.7</li>
              <li>• Recharts</li>
              <li>• Framer Motion</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Funcionalidades */}
      <Card title="Funcionalidades Principais">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-medium">✅ Implementado</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• Filtros básicos (nível, tag, busca, limite)</li>
              <li>• Gráficos estatísticos (volume por nível/tempo)</li>
              <li>• Ingestão de logs com análise automática</li>
              <li>• Tempo real via Socket.IO</li>
              <li>• Paginação e busca avançada</li>
              <li>• Análise heurística de logs</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-medium">🚧 Em Desenvolvimento</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• Preferências do usuário (tema/filtros)</li>
              <li>• ML com TensorFlow.js (padrões avançados)</li>
              <li>• Integração com OpenAI/Ollama</li>
              <li>• Notificações push</li>
              <li>• Exportação de relatórios</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* API e Integração */}
      <Card title="API e Integração">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <Database className="h-5 w-5 text-moon-primary" />
            <span className="text-neutral-300 font-medium">Endpoints Principais</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="text-neutral-200 font-medium mb-2">Logs Básicos</h5>
              <ul className="space-y-1 text-neutral-300">
                <li>• POST /api/logs — cria log</li>
                <li>• GET /api/logs — lista logs</li>
              </ul>
            </div>
            <div>
              <h5 className="text-neutral-200 font-medium mb-2">Ingestão (Recomendado)</h5>
              <ul className="space-y-1 text-neutral-300">
                <li>• POST /api/ingest/raw — análise automática</li>
                <li>• GET /api/ingest/health — status</li>
              </ul>
            </div>
          </div>
          <div className="bg-moon-primary/10 border border-moon-primary/20 rounded-lg p-3">
            <p className="text-moon-primary text-sm">
              <strong>Vantagens da ingestão:</strong> Parse automático de arquivo:linha:coluna, 
              análise heurística imediata, processamento assíncrono para IA, rate-limit: 100 requests/15min por IP.
            </p>
          </div>
        </div>
      </Card>

      {/* Análise Inteligente */}
      <Card title="Análise Inteligente">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-5 w-5 text-moon-primary" />
            <span className="text-neutral-300 font-medium">Capacidades de IA</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-moon-primary/10 rounded-lg border border-moon-primary/20">
              <h5 className="text-moon-primary font-medium mb-2">Heurística</h5>
              <p className="text-neutral-300 text-sm">Análise baseada em padrões de texto</p>
            </div>
            <div className="text-center p-3 bg-moon-primary/10 rounded-lg border border-moon-primary/20">
              <h5 className="text-moon-primary font-medium mb-2">Tags Automáticas</h5>
              <p className="text-neutral-300 text-sm">Categorização por tipo de erro</p>
            </div>
            <div className="text-center p-3 bg-moon-primary/10 rounded-lg border border-moon-primary/20">
              <h5 className="text-moon-primary font-medium mb-2">Sugestões</h5>
              <p className="text-neutral-300 text-sm">Dicas para resolver problemas</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Links e Contribuição */}
      <Card title="Links e Contribuição">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <Github className="h-5 w-5 text-moon-primary" />
            <span className="text-neutral-300 font-medium">Open Source</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://github.com/atlasfernands/Moonlight-Logger" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              <Github className="h-4 w-4" />
              Ver no GitHub
            </a>
            <a 
              href="https://github.com/atlasfernands/Moonlight-Logger/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2 justify-center"
            >
              Reportar Bug
            </a>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-neutral-300 text-sm">
              <strong>Licença MIT</strong> — Contribuições são bem-vindas! Faça um fork, 
              crie uma branch para sua feature e abra um Pull Request.
            </p>
          </div>
        </div>
      </Card>

      {/* Versão e Status */}
      <div className="text-center text-neutral-400 text-sm">
        <p>Moonlight Logger v1.0.0 • Desenvolvido com ❤️ por Atlas Fernands</p>
        <p className="mt-1">"Filho da Lua" dos códigos • Node.js 18+ • TypeScript 5.9+</p>
      </div>
    </div>
  );
}
