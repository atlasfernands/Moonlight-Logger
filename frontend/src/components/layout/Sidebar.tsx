import { Activity, BarChart3, ListFilter, Table } from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-16 flex-col items-center py-4 border-r border-moon-border bg-black/40">
      <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded hover:bg-white/5" title="Logs">
        <Table className="h-5 w-5 text-neutral-300" />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded hover:bg-white/5" title="Filtros">
        <ListFilter className="h-5 w-5 text-neutral-300" />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded hover:bg-white/5" title="Gráficos">
        <BarChart3 className="h-5 w-5 text-neutral-300" />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded hover:bg-white/5" title="Atividade">
        <Activity className="h-5 w-5 text-neutral-300" />
      </motion.button>
    </aside>
  );
}

