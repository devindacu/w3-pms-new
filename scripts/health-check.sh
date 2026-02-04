#!/bin/bash

# W3 Hotel PMS - Health Check and Monitoring Script
# Purpose: Automated health checks for production monitoring
# Usage: ./health-check.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:5000}"
HEALTH_ENDPOINT="$API_URL/health"
MAX_RESPONSE_TIME=3000  # milliseconds
LOG_FILE="${LOG_FILE:-/var/log/w3-pms-health.log}"

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
    log "SUCCESS: $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    log "WARNING: $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    log "ERROR: $1"
}

# Health checks
check_server_running() {
    log "Checking if server is running..."
    
    if curl -f -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
        success "Server is running"
        return 0
    else
        error "Server is not responding"
        return 1
    fi
}

check_response_time() {
    log "Checking response time..."
    
    start_time=$(date +%s%3N)
    if curl -f -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
        end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        if [ $response_time -lt $MAX_RESPONSE_TIME ]; then
            success "Response time: ${response_time}ms (threshold: ${MAX_RESPONSE_TIME}ms)"
            return 0
        else
            warning "Response time: ${response_time}ms (exceeds threshold: ${MAX_RESPONSE_TIME}ms)"
            return 1
        fi
    else
        error "Failed to measure response time"
        return 1
    fi
}

check_database_connection() {
    log "Checking database connection..."
    
    # Attempt to query the API which should connect to database
    if curl -f -s "$API_URL/api/guests" > /dev/null 2>&1; then
        success "Database connection is working"
        return 0
    else
        error "Database connection failed"
        return 1
    fi
}

check_disk_space() {
    log "Checking disk space..."
    
    usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        success "Disk usage: ${usage}% (healthy)"
        return 0
    elif [ "$usage" -lt 90 ]; then
        warning "Disk usage: ${usage}% (getting high)"
        return 1
    else
        error "Disk usage: ${usage}% (critical)"
        return 1
    fi
}

check_memory_usage() {
    log "Checking memory usage..."
    
    if command -v free > /dev/null 2>&1; then
        total=$(free -m | awk 'NR==2 {print $2}')
        used=$(free -m | awk 'NR==2 {print $3}')
        usage=$((used * 100 / total))
        
        if [ "$usage" -lt 80 ]; then
            success "Memory usage: ${usage}% (healthy)"
            return 0
        elif [ "$usage" -lt 90 ]; then
            warning "Memory usage: ${usage}% (getting high)"
            return 1
        else
            error "Memory usage: ${usage}% (critical)"
            return 1
        fi
    else
        warning "Cannot check memory usage (free command not available)"
        return 1
    fi
}

check_cpu_usage() {
    log "Checking CPU usage..."
    
    if command -v top > /dev/null 2>&1; then
        cpu_idle=$(top -bn1 | grep "Cpu(s)" | awk '{print $8}' | sed 's/%id,//')
        cpu_usage=$(echo "100 - $cpu_idle" | bc)
        
        if (( $(echo "$cpu_usage < 80" | bc -l) )); then
            success "CPU usage: ${cpu_usage}% (healthy)"
            return 0
        elif (( $(echo "$cpu_usage < 90" | bc -l) )); then
            warning "CPU usage: ${cpu_usage}% (getting high)"
            return 1
        else
            error "CPU usage: ${cpu_usage}% (critical)"
            return 1
        fi
    else
        warning "Cannot check CPU usage (top command not available)"
        return 1
    fi
}

check_error_logs() {
    log "Checking for recent errors in logs..."
    
    if [ -f "$LOG_FILE" ]; then
        error_count=$(grep -c "ERROR" "$LOG_FILE" 2>/dev/null || echo "0")
        
        if [ "$error_count" -eq 0 ]; then
            success "No errors found in logs"
            return 0
        elif [ "$error_count" -lt 10 ]; then
            warning "Found $error_count errors in logs"
            return 1
        else
            error "Found $error_count errors in logs (high)"
            return 1
        fi
    else
        warning "Log file not found: $LOG_FILE"
        return 1
    fi
}

# Send alert (email, SMS, Slack, etc.)
send_alert() {
    local message=$1
    local severity=$2
    
    log "ALERT [$severity]: $message"
    
    # Email alert (configure sendmail or similar)
    # echo "$message" | mail -s "W3 PMS Alert [$severity]" admin@example.com
    
    # Slack alert (configure webhook)
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$message\"}" \
    #   YOUR_SLACK_WEBHOOK_URL
    
    # For now, just log
    echo "Alert would be sent: $message"
}

# Main health check
main() {
    echo "========================================="
    echo "W3 Hotel PMS Health Check"
    echo "Time: $(date)"
    echo "========================================="
    echo ""
    
    local failures=0
    
    # Run all checks
    check_server_running || failures=$((failures + 1))
    check_response_time || failures=$((failures + 1))
    check_database_connection || failures=$((failures + 1))
    check_disk_space || failures=$((failures + 1))
    check_memory_usage || failures=$((failures + 1))
    check_cpu_usage || failures=$((failures + 1))
    check_error_logs || failures=$((failures + 1))
    
    echo ""
    echo "========================================="
    
    if [ $failures -eq 0 ]; then
        success "All health checks passed"
        echo "Status: HEALTHY"
        return 0
    elif [ $failures -lt 3 ]; then
        warning "$failures checks failed"
        echo "Status: DEGRADED"
        send_alert "System is degraded: $failures checks failed" "WARNING"
        return 1
    else
        error "$failures checks failed"
        echo "Status: UNHEALTHY"
        send_alert "System is unhealthy: $failures checks failed" "CRITICAL"
        return 2
    fi
}

# Run health check
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
