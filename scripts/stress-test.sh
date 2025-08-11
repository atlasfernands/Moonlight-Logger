#!/bin/bash

# 🌙 Moonlight Logger - Stress Test Script
# Executa testes de carga para validar robustez e performance

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações padrão
DEFAULT_TOTAL_LOGS=10000
DEFAULT_BATCH_SIZE=100
DEFAULT_DELAY=100
DEFAULT_PATTERN="steady"
DEFAULT_MALFORMED="true"

# Função para mostrar ajuda
show_help() {
    echo -e "${CYAN}🌙 Moonlight Logger - Stress Test${NC}"
    echo ""
    echo "Uso: $0 [OPÇÕES]"
    echo ""
    echo "Opções:"
    echo "  -t, --total LOGS     Total de logs para gerar (padrão: $DEFAULT_TOTAL_LOGS)"
    echo "  -b, --batch SIZE     Tamanho do batch (padrão: $DEFAULT_BATCH_SIZE)"
    echo "  -d, --delay MS       Delay entre batches em ms (padrão: $DEFAULT_DELAY)"
    echo "  -p, --pattern TYPE   Padrão de tráfego (padrão: $DEFAULT_PATTERN)"
    echo "  -m, --malformed      Incluir logs malformados (padrão: $DEFAULT_MALFORMED)"
    echo "  -h, --help           Mostra esta ajuda"
    echo ""
    echo "Padrões de Tráfego:"
    echo "  steady               Tráfego constante e previsível"
    echo "  spike                Picos de tráfego seguidos de reduções"
    echo "  wave                 Ondas de tráfego com intensidade variável"
    echo "  chaos                Tráfego caótico e imprevisível"
    echo ""
    echo "Exemplos:"
    echo "  $0                                    # Teste padrão"
    echo "  $0 -t 50000 -b 500                   # 50k logs, batch de 500"
    echo "  $0 -p spike -t 20000                 # Picos de tráfego, 20k logs"
    echo "  $0 -p chaos -t 100000 -b 1000       # Caos total, 100k logs"
    echo ""
}

# Função para validar argumentos
validate_args() {
    if [[ $TOTAL_LOGS -lt 100 ]]; then
        echo -e "${RED}❌ Erro: Total de logs deve ser >= 100${NC}"
        exit 1
    fi
    
    if [[ $BATCH_SIZE -lt 10 ]]; then
        echo -e "${RED}❌ Erro: Tamanho do batch deve ser >= 10${NC}"
        exit 1
    fi
    
    if [[ $DELAY -lt 10 ]]; then
        echo -e "${RED}❌ Erro: Delay deve ser >= 10ms${NC}"
        exit 1
    fi
    
    case $PATTERN in
        "steady"|"spike"|"wave"|"chaos")
            ;;
        *)
            echo -e "${RED}❌ Erro: Padrão inválido: $PATTERN${NC}"
            echo "Padrões válidos: steady, spike, wave, chaos"
            exit 1
            ;;
    esac
}

# Função para mostrar configuração
show_config() {
    echo -e "${BLUE}📊 Configuração do Stress Test:${NC}"
    echo "  Total de Logs: ${GREEN}$TOTAL_LOGS${NC}"
    echo "  Tamanho do Batch: ${GREEN}$BATCH_SIZE${NC}"
    echo "  Delay entre Batches: ${GREEN}${DELAY}ms${NC}"
    echo "  Padrão de Tráfego: ${GREEN}$PATTERN${NC}"
    echo "  Logs Malformados: ${GREEN}$MALFORMED${NC}"
    echo ""
}

# Função para executar stress test
run_stress_test() {
    echo -e "${YELLOW}🚀 Iniciando Stress Test...${NC}"
    echo ""
    
    # Verifica se o backend está rodando
    if ! curl -s http://localhost:4000/health > /dev/null; then
        echo -e "${RED}❌ Erro: Backend não está rodando em http://localhost:4000${NC}"
        echo "Execute o backend primeiro: npm run dev"
        exit 1
    fi
    
    # Executa o stress test
    cd backend
    npx ts-node src/logger/stressTest.ts \
        --total $TOTAL_LOGS \
        --batch $BATCH_SIZE \
        --delay $DELAY \
        --pattern $PATTERN \
        --malformed $MALFORMED
    
    echo ""
    echo -e "${GREEN}✅ Stress Test Concluído!${NC}"
}

# Função para executar teste rápido
run_quick_test() {
    echo -e "${CYAN}⚡ Executando Teste Rápido...${NC}"
    echo ""
    
    run_stress_test
}

# Função para executar teste de produção
run_production_test() {
    echo -e "${PURPLE}🏭 Executando Teste de Produção...${NC}"
    echo ""
    
    # Configurações para produção
    TOTAL_LOGS=100000
    BATCH_SIZE=1000
    DELAY=50
    PATTERN="wave"
    MALFORMED="true"
    
    show_config
    run_stress_test
}

# Função para executar teste de caos
run_chaos_test() {
    echo -e "${RED}💥 Executando Teste de Caos...${NC}"
    echo ""
    
    # Configurações para caos
    TOTAL_LOGS=50000
    BATCH_SIZE=500
    DELAY=25
    PATTERN="chaos"
    MALFORMED="true"
    
    show_config
    run_stress_test
}

# Função para executar teste de picos
run_spike_test() {
    echo -e "${YELLOW}📈 Executando Teste de Picos...${NC}"
    echo ""
    
    # Configurações para picos
    TOTAL_LOGS=30000
    BATCH_SIZE=200
    DELAY=100
    PATTERN="spike"
    MALFORMED="false"
    
    show_config
    run_stress_test
}

# Função para executar suite completa de testes
run_full_suite() {
    echo -e "${BLUE}🧪 Executando Suite Completa de Testes...${NC}"
    echo ""
    
    echo -e "${CYAN}1️⃣ Teste Rápido (10k logs)${NC}"
    TOTAL_LOGS=10000
    BATCH_SIZE=100
    DELAY=100
    PATTERN="steady"
    MALFORMED="false"
    run_stress_test
    
    echo ""
    echo -e "${YELLOW}2️⃣ Teste de Picos (30k logs)${NC}"
    TOTAL_LOGS=30000
    BATCH_SIZE=200
    DELAY=100
    PATTERN="spike"
    MALFORMED="false"
    run_stress_test
    
    echo ""
    echo -e "${PURPLE}3️⃣ Teste de Ondas (50k logs)${NC}"
    TOTAL_LOGS=50000
    BATCH_SIZE=500
    DELAY=50
    PATTERN="wave"
    MALFORMED="true"
    run_stress_test
    
    echo ""
    echo -e "${RED}4️⃣ Teste de Caos (100k logs)${NC}"
    TOTAL_LOGS=100000
    BATCH_SIZE=1000
    DELAY=25
    PATTERN="chaos"
    MALFORMED="true"
    run_stress_test
    
    echo ""
    echo -e "${GREEN}🎉 Suite Completa Concluída!${NC}"
}

# Parse argumentos da linha de comando
TOTAL_LOGS=$DEFAULT_TOTAL_LOGS
BATCH_SIZE=$DEFAULT_BATCH_SIZE
DELAY=$DEFAULT_DELAY
PATTERN=$DEFAULT_PATTERN
MALFORMED=$DEFAULT_MALFORMED

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--total)
            TOTAL_LOGS="$2"
            shift 2
            ;;
        -b|--batch)
            BATCH_SIZE="$2"
            shift 2
            ;;
        -d|--delay)
            DELAY="$2"
            shift 2
            ;;
        -p|--pattern)
            PATTERN="$2"
            shift 2
            ;;
        -m|--malformed)
            MALFORMED="$2"
            shift 2
            ;;
        --quick)
            run_quick_test
            exit 0
            ;;
        --production)
            run_production_test
            exit 0
            ;;
        --chaos)
            run_chaos_test
            exit 0
            ;;
        --spike)
            run_spike_test
            exit 0
            ;;
        --full-suite)
            run_full_suite
            exit 0
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção desconhecida: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Valida argumentos
validate_args

# Mostra configuração
show_config

# Executa stress test
run_stress_test
