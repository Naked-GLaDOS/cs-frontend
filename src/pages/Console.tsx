import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

interface LogLine {
  text: string
  type: 'info' | 'error' | 'warn'
}

export function Console() {
  const [logs, setLogs] = useState<LogLine[]>([])
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(true)
  const consoleRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api<{ logs: string }>('/logs?tail=200')
      const lines = data.logs.split('\n').filter(Boolean)
      setLogs(lines.map(line => ({
        text: line,
        type: line.includes('Error') || line.includes('error') ? 'error' : line.includes('Warning') || line.includes('WARN') ? 'warn' : 'info',
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  const sendCommand = async () => {
    if (!command.trim()) return
    try {
      const data = await api<{ command: string; result: string }>('/console', {
        method: 'POST',
        body: JSON.stringify({ command }),
      })
      setLogs(prev => [
        ...prev,
        { text: `> ${command}`, type: 'info' },
        { text: data.result, type: 'info' },
      ])
      setCommand('')
    } catch (err: unknown) {
      setLogs(prev => [
        ...prev,
        { text: `> ${command}`, type: 'info' },
        { text: `Error: ${err instanceof Error ? err.message : 'Command failed'}`, type: 'error' },
      ])
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendCommand()
  }

  if (loading) return <p>Loading console...</p>

  return (
    <div>
      <div className="page-header">
        <h2>RCON Console</h2>
        <p>Send commands directly to the CS2 server</p>
      </div>

      <div className="console-container">
        <div className="console-output" ref={consoleRef}>
          {logs.map((line, i) => (
            <div key={i} className={`log-line ${line.type === 'error' ? 'log-error' : line.type === 'warn' ? 'log-warn' : ''}`}>
              {line.text}
            </div>
          ))}
        </div>
        <div className="console-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter command..."
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendCommand}>Send</button>
        </div>
      </div>
    </div>
  )
}
