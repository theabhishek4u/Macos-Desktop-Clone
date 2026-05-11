'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FileSystemNode {
  type: 'file' | 'directory'
  name: string
  content?: string
  children?: Record<string, FileSystemNode>
}

interface OutputLine {
  text: string
  color?: string
  isHtml?: boolean
}

// ─── Default File System ─────────────────────────────────────────────────────

function createDefaultFileSystem(): Record<string, FileSystemNode> {
  return {
    'Desktop': {
      type: 'directory',
      name: 'Desktop',
      children: {
        'screenshot.png': { type: 'file', name: 'screenshot.png', content: '[Binary file: PNG image data, 1920x1080]' },
        'notes.txt': { type: 'file', name: 'notes.txt', content: 'Remember to update the project README.\nDeadline is next Friday.\n\n- Check API integration\n- Review PR #42\n- Deploy to staging' },
      },
    },
    'Documents': {
      type: 'directory',
      name: 'Documents',
      children: {
        'Projects': {
          type: 'directory',
          name: 'Projects',
          children: {
            'webapp': {
              type: 'directory',
              name: 'webapp',
              children: {
                'index.html': { type: 'file', name: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>' },
                'style.css': { type: 'file', name: 'style.css', content: 'body {\n  margin: 0;\n  font-family: -apple-system, sans-serif;\n  background: #f5f5f7;\n}' },
                'app.js': { type: 'file', name: 'app.js', content: 'const app = {\n  init() {\n    console.log("App initialized");\n  }\n};\n\napp.init();' },
              },
            },
            'README.md': { type: 'file', name: 'README.md', content: '# My Projects\n\nA collection of personal projects and experiments.\n\n## Getting Started\n\nClone the repo and start coding!' },
          },
        },
        'resume.pdf': { type: 'file', name: 'resume.pdf', content: '[Binary file: PDF document, 245KB]' },
        'todo.txt': { type: 'file', name: 'todo.txt', content: '[ ] Learn TypeScript\n[x] Set up macOS simulator\n[ ] Build terminal app\n[ ] Deploy to production' },
      },
    },
    'Downloads': {
      type: 'directory',
      name: 'Downloads',
      children: {
        'archive.zip': { type: 'file', name: 'archive.zip', content: '[Binary file: ZIP archive, 15.3MB]' },
        'installer.dmg': { type: 'file', name: 'installer.dmg', content: '[Binary file: DMG disk image, 124MB]' },
      },
    },
    'Pictures': {
      type: 'directory',
      name: 'Pictures',
      children: {
        'vacation.jpg': { type: 'file', name: 'vacation.jpg', content: '[Binary file: JPEG image, 3.2MB]' },
        'profile.png': { type: 'file', name: 'profile.png', content: '[Binary file: PNG image, 256KB]' },
      },
    },
    'Music': {
      type: 'directory',
      name: 'Music',
      children: {},
    },
    '.zshrc': {
      type: 'file',
      name: '.zshrc',
      content: '# ~/.zshrc\nexport PATH="$HOME/bin:$PATH"\nalias ll="ls -la"\nalias gs="git status"\n\n# Prompt\nPROMPT="%n@%m %1~ %# "\n\n# History\nHISTSIZE=10000\nSAVEHIST=10000',
    },
    '.gitconfig': {
      type: 'file',
      name: '.gitconfig',
      content: '[user]\n  name = User\n  email = user@macOS.local\n[core]\n  editor = vim\n[color]\n  ui = auto',
    },
  }
}

// ─── NEOFETCH ASCII ART ──────────────────────────────────────────────────────

const NEOFETCH_ART = [
  '                    \'c.          <span style="color:#28c840">user</span>@<span style="color:#28c840">macOS</span>',
  '                 ,xNMM.          ──────────────',
  '               .OMMMMo           <span style="color:#28c840">OS:</span> macOS 14.0 Sonoma',
  '               OMMM0,            <span style="color:#28c840">Host:</span> MacBook Pro',
  '     .;loddo:\' loolloddol;.     <span style="color:#28c840">Kernel:</span> Darwin 23.0.0',
  '   cKMMMMMMMMMMNWMMMMMMMMMM0:   <span style="color:#28c840">Uptime:</span> 3 days, 7 hours, 42 mins',
  '  .KMMMMMMMMMMMMMMMMMMMMMMMWd.  <span style="color:#28c840">Shell:</span> zsh 5.9',
  '  XMMMMMMMMMMMMMMMMMMMMMMMX.    <span style="color:#28c840">Resolution:</span> 2560x1600',
  ' ;MMMMMMMMMMMMMMMMMMMMMMMM:     <span style="color:#28c840">DE:</span> Aqua',
  ' :MMMMMMMMMMMMMMMMMMMMMMMM:     <span style="color:#28c840">WM:</span> Quartz Compositor',
  ' .MMMMMMMMMMMMMMMMMMMMMMMMX.    <span style="color:#28c840">Terminal:</span> macOS Terminal',
  '  kMMMMMMMMMMMMMMMMMMMMMMMMWd.  <span style="color:#28c840">CPU:</span> Apple M3 Pro',
  '  .XMMMMMMMMMMMMMMMMMMMMMMMMk   <span style="color:#28c840">GPU:</span> Apple M3 Pro 18-core',
  '   .XMMMMMMMMMMMMMMMMMMMMK.     <span style="color:#28c840">Memory:</span> 8192MiB / 18432MiB',
  '     kMMMMMMMMMMMMMMMMMMd        ',
  '      ;KMMMMMMMWXXWMMMMMk.      <span style="background:#ff5f57;color:#ff5f57">██</span><span style="background:#febc2e;color:#febc2e">██</span><span style="background:#28c840;color:#28c840">██</span><span style="background:#5ac8fa;color:#5ac8fa">██</span><span style="background:#af52de;color:#af52de">██</span><span style="background:#ff375f;color:#ff375f">██</span><span style="background:#ffffff;color:#ffffff">██</span>',
  '        .cooc,.    .,coo:.       ',
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function Terminal() {
  const [fileSystem, setFileSystem] = useState<Record<string, FileSystemNode>>(createDefaultFileSystem)
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [output, setOutput] = useState<OutputLine[]>([
    { text: 'Last login: ' + new Date().toString(), color: 'text-gray-400' },
    { text: '' },
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getPromptPath = useCallback(() => {
    if (currentPath.length === 0) return '~'
    return `~/${currentPath.join('/')}`
  }, [currentPath])

  const getPrompt = useCallback(() => {
    return `user@macOS ${getPromptPath()} % `
  }, [getPromptPath])

  const resolveNode = useCallback((pathParts: string[]): { node: Record<string, FileSystemNode> | null, path: string[] } => {
    let current = fileSystem
    const resolved: string[] = []

    for (const part of pathParts) {
      if (part === '..') {
        if (resolved.length > 0) resolved.pop()
        continue
      }
      if (part === '.' || part === '') continue

      const child = current[part]
      if (!child) return { node: null, path: resolved }
      if (child.type !== 'directory') return { node: null, path: resolved }
      resolved.push(part)
      current = child.children!
    }

    return { node: current, path: resolved }
  }, [fileSystem])

  const getCurrentDir = useCallback((): Record<string, FileSystemNode> => {
    const { node } = resolveNode(currentPath)
    return node ?? fileSystem
  }, [resolveNode, currentPath, fileSystem])

  // ─── Command Execution ──────────────────────────────────────────────────

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    const newOutput: OutputLine[] = []

    // Echo the command with prompt
    newOutput.push({ text: getPrompt() + trimmed, color: 'text-white' })

    if (trimmed === '') {
      setOutput(prev => [...prev, ...newOutput])
      return
    }

    const parts = trimmed.split(/\s+/)
    const command = parts[0]
    const args = parts.slice(1)

    switch (command) {
      case 'help': {
        newOutput.push({ text: 'Available commands:', color: 'text-yellow-400' })
        newOutput.push({ text: '' })
        const cmds = [
          ['help', 'Show this help message'],
          ['ls', 'List directory contents'],
          ['pwd', 'Print working directory'],
          ['cd <dir>', 'Change directory'],
          ['whoami', 'Display current user'],
          ['date', 'Display current date and time'],
          ['echo <text>', 'Display a line of text'],
          ['clear', 'Clear the terminal'],
          ['cat <file>', 'Display file contents'],
          ['mkdir <name>', 'Create a new directory'],
          ['touch <name>', 'Create a new file'],
          ['rm <name>', 'Remove a file or directory'],
          ['uname', 'Print system information'],
          ['uptime', 'Show system uptime'],
          ['neofetch', 'Display system info with ASCII art'],
        ]
        cmds.forEach(([name, desc]) => {
          newOutput.push({
            text: `  ${name.padEnd(14)}${desc}`,
            color: 'text-gray-300',
          })
        })
        break
      }

      case 'ls': {
        const currentDir = getCurrentDir()
        const entries = Object.values(currentDir)
        if (entries.length === 0) {
          // Empty directory, no output (like real ls)
        } else {
          // Sort: directories first, then files
          const dirs = entries.filter(e => e.type === 'directory').sort((a, b) => a.name.localeCompare(b.name))
          const files = entries.filter(e => e.type === 'file').sort((a, b) => a.name.localeCompare(b.name))

          // Check for -a or -la flags
          const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al')

          let allEntries = [...dirs, ...files]
          if (!showHidden) {
            allEntries = allEntries.filter(e => !e.name.startsWith('.'))
          }

          if (allEntries.length > 0) {
            const line = allEntries.map(e => {
              if (e.type === 'directory') {
                return `📁 ${e.name}/`
              }
              return `   ${e.name}`
            }).join('  ')
            newOutput.push({ text: line, color: 'text-gray-200' })
          }
        }
        break
      }

      case 'pwd': {
        const path = currentPath.length === 0 ? '/Users/user' : `/Users/user/${currentPath.join('/')}`
        newOutput.push({ text: path, color: 'text-gray-200' })
        break
      }

      case 'cd': {
        if (args.length === 0 || args[0] === '~') {
          setCurrentPath([])
          break
        }

        const target = args[0]

        if (target === '..') {
          setCurrentPath(prev => prev.slice(0, -1))
          break
        }

        if (target === '.') {
          break
        }

        // Handle absolute-like paths starting with ~/
        let pathParts: string[]
        if (target.startsWith('~/')) {
          pathParts = target.slice(2).split('/').filter(Boolean)
          // Resolve from root
          const { node, path } = resolveNode(pathParts)
          if (!node) {
            newOutput.push({ text: `cd: no such file or directory: ${target}`, color: 'text-red-400' })
          } else {
            setCurrentPath(path)
          }
          break
        }

        // Relative path
        const fullPath = [...currentPath, ...target.split('/')].filter(Boolean)
        const { node, path } = resolveNode(fullPath)

        if (!node) {
          newOutput.push({ text: `cd: no such file or directory: ${target}`, color: 'text-red-400' })
        } else {
          setCurrentPath(path)
        }
        break
      }

      case 'whoami': {
        newOutput.push({ text: 'user', color: 'text-gray-200' })
        break
      }

      case 'date': {
        newOutput.push({ text: new Date().toString(), color: 'text-gray-200' })
        break
      }

      case 'echo': {
        const text = args.join(' ')
        // Handle basic escape sequences
        newOutput.push({ text, color: 'text-gray-200' })
        break
      }

      case 'clear': {
        setOutput([])
        return
      }

      case 'cat': {
        if (args.length === 0) {
          newOutput.push({ text: 'cat: missing file operand', color: 'text-red-400' })
          break
        }

        const fileName = args[0]
        const currentDir = getCurrentDir()
        const file = currentDir[fileName]

        if (!file) {
          newOutput.push({ text: `cat: ${fileName}: No such file or directory`, color: 'text-red-400' })
        } else if (file.type === 'directory') {
          newOutput.push({ text: `cat: ${fileName}: Is a directory`, color: 'text-red-400' })
        } else {
          const content = file.content ?? ''
          content.split('\n').forEach(line => {
            newOutput.push({ text: line, color: 'text-gray-200' })
          })
        }
        break
      }

      case 'mkdir': {
        if (args.length === 0) {
          newOutput.push({ text: 'mkdir: missing operand', color: 'text-red-400' })
          break
        }

        const dirName = args[0]
        const currentDir = getCurrentDir()

        if (currentDir[dirName]) {
          newOutput.push({ text: `mkdir: ${dirName}: File exists`, color: 'text-red-400' })
        } else if (dirName.includes('/')) {
          newOutput.push({ text: `mkdir: ${dirName}: No such file or directory`, color: 'text-red-400' })
        } else {
          setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev)) as Record<string, FileSystemNode>
            let current: Record<string, FileSystemNode> = newFs
            for (const part of currentPath) {
              current = current[part].children!
            }
            current[dirName] = { type: 'directory', name: dirName, children: {} }
            return newFs
          })
          newOutput.push({ text: ``, color: 'text-gray-200' })
        }
        break
      }

      case 'touch': {
        if (args.length === 0) {
          newOutput.push({ text: 'touch: missing file operand', color: 'text-red-400' })
          break
        }

        const fileName = args[0]
        const currentDir = getCurrentDir()

        if (currentDir[fileName]) {
          // touch on existing file just updates timestamp - no output
          break
        }

        if (fileName.includes('/')) {
          newOutput.push({ text: `touch: ${fileName}: No such file or directory`, color: 'text-red-400' })
        } else {
          setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev)) as Record<string, FileSystemNode>
            let current: Record<string, FileSystemNode> = newFs
            for (const part of currentPath) {
              current = current[part].children!
            }
            current[fileName] = { type: 'file', name: fileName, content: '' }
            return newFs
          })
          // No output on success, like real touch
        }
        break
      }

      case 'rm': {
        if (args.length === 0) {
          newOutput.push({ text: 'rm: missing operand', color: 'text-red-400' })
          break
        }

        const fileName = args[0]
        const currentDir = getCurrentDir()
        const target = currentDir[fileName]

        if (!target) {
          newOutput.push({ text: `rm: ${fileName}: No such file or directory`, color: 'text-red-400' })
        } else if (target.type === 'directory' && !args.includes('-r') && !args.includes('-rf')) {
          newOutput.push({ text: `rm: ${fileName}: is a directory`, color: 'text-red-400' })
        } else {
          setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev)) as Record<string, FileSystemNode>
            let current: Record<string, FileSystemNode> = newFs
            for (const part of currentPath) {
              current = current[part].children!
            }
            delete current[fileName]
            return newFs
          })
          // No output on success, like real rm
        }
        break
      }

      case 'uname': {
        if (args.includes('-a')) {
          newOutput.push({ text: 'Darwin macOS.local 23.0.0 Darwin Kernel Version 23.0.0 RELEASE_ARM_T6030 arm64', color: 'text-gray-200' })
        } else {
          newOutput.push({ text: 'Darwin', color: 'text-gray-200' })
        }
        break
      }

      case 'uptime': {
        const days = Math.floor(Math.random() * 7) + 1
        const hours = Math.floor(Math.random() * 24)
        const mins = Math.floor(Math.random() * 60)
        const load1 = (Math.random() * 2).toFixed(2)
        const load5 = (Math.random() * 1.5).toFixed(2)
        const load15 = (Math.random() * 1).toFixed(2)
        newOutput.push({
          text: ` ${new Date().toLocaleTimeString()}  up ${days} day${days > 1 ? 's' : ''}, ${hours}:${mins.toString().padStart(2, '0')}, 2 users, load averages: ${load1} ${load5} ${load15}`,
          color: 'text-gray-200',
        })
        break
      }

      case 'neofetch': {
        NEOFETCH_ART.forEach(line => {
          newOutput.push({ text: line, isHtml: true })
        })
        break
      }

      default: {
        newOutput.push({ text: `zsh: command not found: ${command}`, color: 'text-red-400' })
        break
      }
    }

    setOutput(prev => [...prev, ...newOutput])
  }, [getPrompt, getCurrentDir, resolveNode, currentPath, fileSystem])

  // ─── Event Handlers ─────────────────────────────────────────────────────

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input
    executeCommand(cmd)

    if (cmd.trim()) {
      setCommandHistory(prev => [cmd, ...prev])
    }
    setInput('')
    setHistoryIndex(-1)
  }, [input, executeCommand])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      setInput(commandHistory[newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const newIndex = historyIndex - 1
      if (newIndex === -1) {
        setInput('')
      } else {
        setInput(commandHistory[newIndex])
      }
      setHistoryIndex(newIndex)
    }
  }, [commandHistory, historyIndex])

  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // ─── Auto-scroll ────────────────────────────────────────────────────────

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [output])

  // ─── Auto-focus on mount ────────────────────────────────────────────────

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col w-full h-full bg-[#1e1e1e] font-mono text-[13px] leading-[1.4] cursor-text select-text"
      onClick={handleTerminalClick}
    >
      {/* Title bar subtitle area */}
      <div className="flex items-center justify-center h-[26px] shrink-0 bg-[#3a3a3a] border-b border-white/5 px-3">
        <span className="text-[11px] text-white/50 font-mono tracking-wide">
          user@macOS — zsh — 80×24
        </span>
      </div>

      {/* Terminal output area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 pb-0 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.15) transparent',
        }}
      >
        <style>{`
          .terminal-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .terminal-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .terminal-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.15);
            border-radius: 3px;
          }
          .terminal-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.25);
          }
          @keyframes terminal-blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          .terminal-cursor {
            animation: terminal-blink 1s step-end infinite;
          }
        `}</style>

        {/* Output lines */}
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line.isHtml ? (
              <span
                className="text-gray-200"
                dangerouslySetInnerHTML={{ __html: line.text }}
              />
            ) : (
              <span className={line.color ?? 'text-gray-200'}>{line.text}</span>
            )}
          </div>
        ))}

        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center whitespace-pre">
          <span className="text-[#28c840] font-semibold shrink-0">{getPrompt()}</span>
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-gray-200 outline-none border-none p-0 m-0 font-mono text-[13px] caret-transparent"
              style={{ caretColor: 'transparent' }}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
            />
            {/* Custom cursor */}
            <span
              className="terminal-cursor absolute top-0 pointer-events-none text-gray-200"
              style={{
                left: `${input.length * 7.8}px`,
              }}
            >
              ▌
            </span>
          </div>
        </form>

        {/* Bottom padding for scroll */}
        <div className="h-3" />
      </div>
    </div>
  )
}
