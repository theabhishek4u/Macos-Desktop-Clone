'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FileSystemNode {
  type: 'file' | 'directory'
  name: string
  content?: string
  children?: Record<string, FileSystemNode>
  executable?: boolean
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
                'app.js': { type: 'file', name: 'app.js', content: 'const app = {\n  init() {\n    console.log("App initialized");\n  }\n};\n\napp.init();', executable: true },
              },
            },
            'README.md': { type: 'file', name: 'README.md', content: '# My Projects\n\nA collection of personal projects and experiments.\n\n## Getting Started\n\nClone the repo and start coding!' },
          },
        },
        'resume.pdf': { type: 'file', name: 'resume.pdf', content: '[Binary file: PDF document, 245KB]' },
        'todo.txt': { type: 'file', name: 'todo.txt', content: '[ ] Learn TypeScript\n[x] Set up macOS simulator\n[ ] Build terminal app\n[ ] Deploy to production' },
        '.bash_profile': { type: 'file', name: '.bash_profile', content: '# ~/.bash_profile\nexport PATH="$HOME/bin:/usr/local/bin:$PATH"\nexport EDITOR=vim\n\n# Aliases\nalias ll="ls -la"\nalias gs="git status"\nalias gp="git push"\n\n# Prompt customization\nexport PS1="\\u@\\h \\w % "' },
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
  '                    \'c.          <span style="color:#28c840">user</span>@<span style="color:#28c840">MacBook</span>',
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

// ─── Cowsay Helper ────────────────────────────────────────────────────────────

function cowsay(message: string): string[] {
  const maxLen = Math.min(message.length, 40)
  const lines: string[] = []
  const words = message.split(' ')
  let currentLine = ''
  const wrappedLines: string[] = []
  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxLen) {
      wrappedLines.push(currentLine)
      currentLine = word
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word
    }
  }
  if (currentLine) wrappedLines.push(currentLine)

  const lineLen = Math.max(...wrappedLines.map(l => l.length), 1)
  const border = ' ' + '_'.repeat(lineLen + 2)

  lines.push(border)
  if (wrappedLines.length === 1) {
    lines.push(`< ${wrappedLines[0].padEnd(lineLen)} >`)
  } else {
    wrappedLines.forEach((line, i) => {
      const left = i === 0 ? '/' : i === wrappedLines.length - 1 ? '\\' : '|'
      const right = i === 0 ? '\\' : i === wrappedLines.length - 1 ? '/' : '|'
      lines.push(`${left} ${line.padEnd(lineLen)} ${right}`)
    })
  }
  lines.push(' ' + '-'.repeat(lineLen + 2))
  lines.push('        \\   ^__^')
  lines.push('         \\  (oo)\\_______')
  lines.push('            (__)\\       )\\/\\')
  lines.push('                ||----w |')
  lines.push('                ||     ||')

  return lines
}

// ─── Fortunes ─────────────────────────────────────────────────────────────────

const FORTUNES = [
  'The best way to predict the future is to invent it. — Alan Kay',
  'Any sufficiently advanced technology is indistinguishable from magic. — Arthur C. Clarke',
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Simplicity is the soul of efficiency. — Austin Freeman',
  'Code is like humor. When you have to explain it, it\'s bad. — Cory House',
  'Fix the cause, not the symptom. — Steve Maguire',
  'Optimism is an occupational hazard of programming: feedback is the treatment. — Kent Beck',
  'The most important property of a program is whether it accomplishes the intention of its user. — C.A.R. Hoare',
  'Programs must be written for people to read, and only incidentally for machines to execute. — Harold Abelson',
  'The only way to learn a new programming language is by writing programs in it. — Dennis Ritchie',
  'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away. — Antoine de Saint-Exupery',
  'Java is to JavaScript what car is to carpet. — Chris Heilmann',
  'It\'s not a bug — it\'s an undocumented feature. — Anonymous',
  'In order to be irreplaceable, one must always be different. — Coco Chanel',
]

// ─── Matrix Helper ────────────────────────────────────────────────────────────

function generateMatrixLines(): string[] {
  const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789'
  const lines: string[] = []
  for (let r = 0; r < 4; r++) {
    let line = ''
    for (let c = 0; c < 60; c++) {
      line += chars[Math.floor(Math.random() * chars.length)]
    }
    lines.push(line)
  }
  return lines
}

// ─── Manual Pages ────────────────────────────────────────────────────────────

const MAN_PAGES: Record<string, string[]> = {
  'ls': [
    'LS(1)                     User Commands                    LS(1)',
    '',
    'NAME',
    '       ls - list directory contents',
    '',
    'SYNOPSIS',
    '       ls [OPTION]... [FILE]...',
    '',
    'DESCRIPTION',
    '       List information about the FILEs (the current directory by default).',
    '       Sort entries alphabetically.',
    '',
    '       -a     do not ignore entries starting with .',
    '       -l     use a long listing format',
    '       -la    long listing with hidden files',
    '',
    'SEE ALSO',
    '       dir(1), vdir(1)',
  ],
  'cd': [
    'CD(1)                     User Commands                    CD(1)',
    '',
    'NAME',
    '       cd - change the working directory',
    '',
    'SYNOPSIS',
    '       cd [dir]',
    '',
    'DESCRIPTION',
    '       Change the current directory to dir. The default dir is HOME.',
    '       cd .. moves to the parent directory.',
    '       cd ~ returns to home directory.',
  ],
  'pwd': [
    'PWD(1)                    User Commands                   PWD(1)',
    '',
    'NAME',
    '       pwd - print name of current/working directory',
    '',
    'SYNOPSIS',
    '       pwd',
    '',
    'DESCRIPTION',
    '       Print the full filename of the current working directory.',
  ],
  'cat': [
    'CAT(1)                    User Commands                   CAT(1)',
    '',
    'NAME',
    '       cat - concatenate files and print on the standard output',
    '',
    'SYNOPSIS',
    '       cat [FILE]...',
    '',
    'DESCRIPTION',
    '       Concatenate FILE(s) to standard output.',
    '       With no FILE, read standard input.',
  ],
  'echo': [
    'ECHO(1)                   User Commands                  ECHO(1)',
    '',
    'NAME',
    '       echo - display a line of text',
    '',
    'SYNOPSIS',
    '       echo [STRING]...',
    '',
    'DESCRIPTION',
    '       Display the STRING(s) to standard output.',
  ],
  'mkdir': [
    'MKDIR(1)                  User Commands                MKDIR(1)',
    '',
    'NAME',
    '       mkdir - make directories',
    '',
    'SYNOPSIS',
    '       mkdir [OPTION]... DIRECTORY...',
    '',
    'DESCRIPTION',
    '       Create the DIRECTORY(ies), if they do not already exist.',
  ],
  'rm': [
    'RM(1)                     User Commands                    RM(1)',
    '',
    'NAME',
    '       rm - remove files or directories',
    '',
    'SYNOPSIS',
    '       rm [OPTION]... [FILE]...',
    '',
    'DESCRIPTION',
    '       Remove (unlink) the FILE(s).',
    '       -r, -rf   remove directories and their contents recursively',
  ],
  'grep': [
    'GREP(1)                   User Commands                  GREP(1)',
    '',
    'NAME',
    '       grep - print lines matching a pattern',
    '',
    'SYNOPSIS',
    '       grep [PATTERN] [FILE]...',
    '',
    'DESCRIPTION',
    '       Search for PATTERN in each FILE.',
    '       Print lines that contain matches.',
  ],
  'cp': [
    'CP(1)                     User Commands                    CP(1)',
    '',
    'NAME',
    '       cp - copy files and directories',
    '',
    'SYNOPSIS',
    '       cp [SOURCE] [DEST]',
    '',
    'DESCRIPTION',
    '       Copy SOURCE to DEST.',
  ],
  'mv': [
    'MV(1)                     User Commands                    MV(1)',
    '',
    'NAME',
    '       mv - move (rename) files',
    '',
    'SYNOPSIS',
    '       mv [SOURCE] [DEST]',
    '',
    'DESCRIPTION',
    '       Move SOURCE to DEST. Can also be used to rename files.',
  ],
  'man': [
    'MAN(1)                    Manual pager utils               MAN(1)',
    '',
    'NAME',
    '       man - an interface to the system reference manuals',
    '',
    'SYNOPSIS',
    '       man [SECTION] COMMAND',
    '',
    'DESCRIPTION',
    '       Display the manual page for the given COMMAND.',
  ],
  'ping': [
    'PING(8)              System Manager\'s Manual            PING(8)',
    '',
    'NAME',
    '       ping - send ICMP ECHO_REQUEST to network hosts',
    '',
    'SYNOPSIS',
    '       ping [HOST]...',
    '',
    'DESCRIPTION',
    '       Send ICMP echo request packets to HOST and listen for replies.',
  ],
  'curl': [
    'CURL(1)                   User Commands                  CURL(1)',
    '',
    'NAME',
    '       curl - transfer a URL',
    '',
    'SYNOPSIS',
    '       curl [URL]...',
    '',
    'DESCRIPTION',
    '       Fetch data from or send data to a URL.',
  ],
  'df': [
    'DF(1)                     User Commands                    DF(1)',
    '',
    'NAME',
    '       df - report file system disk space usage',
    '',
    'SYNOPSIS',
    '       df [-h] [FILE]...',
    '',
    'DESCRIPTION',
    '       Show information about the file system on which each FILE resides.',
    '       -h   print sizes in human-readable format',
  ],
  'which': [
    'WHICH(1)                  User Commands                WHICH(1)',
    '',
    'NAME',
    '       which - locate a command',
    '',
    'SYNOPSIS',
    '       which [COMMAND]...',
    '',
    'DESCRIPTION',
    '       Show the full path of (shell) commands.',
  ],
  'env': [
    'ENV(1)                    User Commands                   ENV(1)',
    '',
    'NAME',
    '       env - run a program in a modified environment',
    '',
    'SYNOPSIS',
    '       env',
    '',
    'DESCRIPTION',
    '       Display the current environment variables.',
  ],
  'history': [
    'HISTORY(1)                 User Commands                HISTORY(1)',
    '',
    'NAME',
    '       history - display command history',
    '',
    'SYNOPSIS',
    '       history',
    '',
    'DESCRIPTION',
    '       Display the list of previously entered commands.',
  ],
  'touch': [
    'TOUCH(1)                  User Commands                TOUCH(1)',
    '',
    'NAME',
    '       touch - change file timestamps',
    '',
    'SYNOPSIS',
    '       touch [FILE]...',
    '',
    'DESCRIPTION',
    '       Create empty FILE(s) if they do not exist.',
  ],
  'whoami': [
    'WHOAMI(1)                 User Commands                WHOAMI(1)',
    '',
    'NAME',
    '       whoami - print effective userid',
    '',
    'SYNOPSIS',
    '       whoami',
    '',
    'DESCRIPTION',
    '       Print the user name associated with the current effective user ID.',
  ],
  'uname': [
    'UNAME(1)                  User Commands                UNAME(1)',
    '',
    'NAME',
    '       uname - print system information',
    '',
    'SYNOPSIS',
    '       uname [-a]',
    '',
    'DESCRIPTION',
    '       Print certain system information.',
    '       -a   print all information',
  ],
  'date': [
    'DATE(1)                   User Commands                  DATE(1)',
    '',
    'NAME',
    '       date - print or set the system date and time',
    '',
    'SYNOPSIS',
    '       date',
    '',
    'DESCRIPTION',
    '       Display the current date and time.',
  ],
  'ps': [
    'PS(1)                     User Commands                    PS(1)',
    '',
    'NAME',
    '       ps - report a snapshot of current processes',
    '',
    'SYNOPSIS',
    '       ps [aux]',
    '',
    'DESCRIPTION',
    '       Display information about active processes.',
    '       aux   show all processes with details',
  ],
  'top': [
    'TOP(1)                    User Commands                   TOP(1)',
    '',
    'NAME',
    '       top - display Linux processes',
    '',
    'SYNOPSIS',
    '       top',
    '',
    'DESCRIPTION',
    '       Display dynamic real-time view of running system.',
  ],
  'export': [
    'EXPORT(1)                  Shell Builtins               EXPORT(1)',
    '',
    'NAME',
    '       export - set environment variable',
    '',
    'SYNOPSIS',
    '       export VAR=value',
    '',
    'DESCRIPTION',
    '       Set an environment variable for the current session.',
  ],
}

// ─── Default Environment Variables ───────────────────────────────────────────

function createDefaultEnv(): Record<string, string> {
  return {
    HOME: '/Users/user',
    USER: 'user',
    SHELL: '/bin/zsh',
    PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    LANG: 'en_US.UTF-8',
    TERM: 'xterm-256color',
    EDITOR: 'vim',
    PWD: '/Users/user',
    LOGNAME: 'user',
    HOSTNAME: 'MacBook.local',
    TERM_PROGRAM: 'macOS_Terminal',
    TERM_PROGRAM_VERSION: '447',
    __CFBundleIdentifier: 'com.apple.Terminal',
  }
}

// ─── All Available Commands (for help and tab completion) ────────────────────

const ALL_COMMANDS: [string, string][] = [
  ['help', 'Show this help message'],
  ['ls', 'List directory contents'],
  ['ls -la', 'List with details (permissions, size, date)'],
  ['pwd', 'Print working directory'],
  ['cd <dir>', 'Change directory'],
  ['whoami', 'Display current user'],
  ['hostname', 'Display system hostname'],
  ['uname', 'Print system information'],
  ['date', 'Display current date and time'],
  ['echo <text>', 'Display a line of text'],
  ['clear', 'Clear the terminal'],
  ['cat <file>', 'Display file contents'],
  ['mkdir <name>', 'Create a new directory'],
  ['touch <name>', 'Create a new file'],
  ['rm <name>', 'Remove a file or directory'],
  ['cp <src> <dst>', 'Copy a file'],
  ['mv <src> <dst>', 'Move or rename a file'],
  ['grep <pat> <file>', 'Search for pattern in file'],
  ['man <cmd>', 'Show manual page for command'],
  ['which <cmd>', 'Show path to command'],
  ['env', 'Show environment variables'],
  ['export VAR=val', 'Set environment variable'],
  ['history', 'Show command history'],
  ['curl <url>', 'Fetch URL content (simulated)'],
  ['ping <host>', 'Ping a host (simulated)'],
  ['df -h', 'Show disk space usage'],
  ['ps aux', 'Show process list'],
  ['top', 'Show system usage summary'],
  ['uptime', 'Show system uptime'],
  ['neofetch', 'Display system info with ASCII art'],
  ['cowsay <msg>', 'ASCII cow saying a message'],
  ['fortune', 'Display a random fortune/quote'],
  ['matrix', 'Display a Matrix-style animation'],
]

const COMMAND_NAMES = ALL_COMMANDS.map(([name]) => name.split(' ')[0])

const COMMAND_PATHS: Record<string, string> = {
  ls: '/bin/ls',
  cd: '/bin/cd',
  pwd: '/bin/pwd',
  cat: '/bin/cat',
  mkdir: '/bin/mkdir',
  touch: '/usr/bin/touch',
  rm: '/bin/rm',
  cp: '/bin/cp',
  mv: '/bin/mv',
  grep: '/usr/bin/grep',
  man: '/usr/bin/man',
  which: '/usr/bin/which',
  echo: '/bin/echo',
  date: '/bin/date',
  whoami: '/usr/bin/whoami',
  uname: '/usr/bin/uname',
  env: '/usr/bin/env',
  export: '/usr/bin/env',  // shell builtin
  history: '/usr/bin/history',
  curl: '/usr/bin/curl',
  ping: '/sbin/ping',
  df: '/bin/df',
  ps: '/bin/ps',
  top: '/usr/bin/top',
  uptime: '/usr/bin/uptime',
  hostname: '/bin/hostname',
  clear: '/usr/bin/clear',
  neofetch: '/usr/local/bin/neofetch',
  cowsay: '/usr/local/bin/cowsay',
  fortune: '/usr/local/bin/fortune',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Terminal() {
  const [fileSystem, setFileSystem] = useState<Record<string, FileSystemNode>>(createDefaultFileSystem)
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [output, setOutput] = useState<OutputLine[]>([
    { text: 'Last login: ' + new Date().toString(), color: 'text-white/40' },
    { text: '' },
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [tabSuggestions, setTabSuggestions] = useState<string[]>([])
  const [envVars, setEnvVars] = useState<Record<string, string>>(createDefaultEnv)
  const [savedInput, setSavedInput] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getPromptPath = useCallback(() => {
    if (currentPath.length === 0) return '~'
    return `~/${currentPath.join('/')}`
  }, [currentPath])

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

  // ─── Get file content from any path ──────────────────────────────────────

  const getFileContent = useCallback((fileName: string): { content: string | null, error: string | null } => {
    // Handle absolute-ish paths
    if (fileName.startsWith('~/')) {
      const pathParts = fileName.slice(2).split('/').filter(Boolean)
      const fileNamePart = pathParts.pop()
      if (!fileNamePart) return { content: null, error: `cat: ${fileName}: No such file or directory` }

      let current = fileSystem
      for (const part of pathParts) {
        const child = current[part]
        if (!child || child.type !== 'directory') return { content: null, error: `cat: ${fileName}: No such file or directory` }
        current = child.children!
      }

      const file = current[fileNamePart]
      if (!file) return { content: null, error: `cat: ${fileName}: No such file or directory` }
      if (file.type === 'directory') return { content: null, error: `cat: ${fileName}: Is a directory` }
      return { content: file.content ?? '', error: null }
    }

    // Current directory
    const currentDir = getCurrentDir()
    const file = currentDir[fileName]
    if (!file) return { content: null, error: `cat: ${fileName}: No such file or directory` }
    if (file.type === 'directory') return { content: null, error: `cat: ${fileName}: Is a directory` }
    return { content: file.content ?? '', error: null }
  }, [fileSystem, getCurrentDir])

  // ─── Command Execution (single command, no pipes) ──────────────────────

  const executeSingleCommand = useCallback((trimmed: string, newOutput: OutputLine[]) => {
    if (trimmed === '') return

    // Parse command with quote handling for echo
    const parts: string[] = []
    let current = ''
    let inQuote = false
    let quoteChar = ''

    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i]
      if (inQuote) {
        if (ch === quoteChar) {
          inQuote = false
        } else {
          current += ch
        }
      } else if (ch === '"' || ch === "'") {
        inQuote = true
        quoteChar = ch
      } else if (ch === ' ') {
        if (current) {
          parts.push(current)
          current = ''
        }
      } else {
        current += ch
      }
    }
    if (current) parts.push(current)

    const command = parts[0]
    const args = parts.slice(1)

    switch (command) {
      case 'help': {
        newOutput.push({ text: 'Available commands:', color: 'text-yellow-400' })
        newOutput.push({ text: '' })
        ALL_COMMANDS.forEach(([name, desc]) => {
          newOutput.push({
            text: `  ${name.padEnd(16)}${desc}`,
            color: 'text-white/70',
          })
        })
        break
      }

      case 'ls': {
        const currentDir = getCurrentDir()
        const entries = Object.values(currentDir)
        const showLong = args.includes('-la') || args.includes('-l') || args.includes('-al')
        const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al')

        if (entries.length === 0 && !showHidden) {
          // Empty directory, no output (like real ls)
        } else {
          const dirs = entries.filter(e => e.type === 'directory').sort((a, b) => a.name.localeCompare(b.name))
          const files = entries.filter(e => e.type === 'file').sort((a, b) => a.name.localeCompare(b.name))

          let allEntries = [...dirs, ...files]
          if (!showHidden) {
            allEntries = allEntries.filter(e => !e.name.startsWith('.'))
          }

          if (showLong) {
            // Detailed listing like ls -la
            newOutput.push({ text: `total ${allEntries.length * 8}`, color: 'text-white/50' })
            // Add . and .. entries
            if (showHidden) {
              const now = new Date()
              const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')
              newOutput.push({ text: `drwxr-xr-x  ${currentPath.length + 2}   user  staff   64  ${dateStr} .`, color: 'text-[#5ac8fa]' })
              newOutput.push({ text: `drwxr-xr-x  ${currentPath.length + 1}   user  staff   64  ${dateStr} ..`, color: 'text-[#5ac8fa]' })
            }
            allEntries.forEach(e => {
              const now = new Date()
              const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')
              if (e.type === 'directory') {
                const childCount = (e.children ? Object.keys(e.children).length : 0) + 2
                newOutput.push({ text: `drwxr-xr-x  ${childCount}   user  staff   64  ${dateStr} <span style="color:#5ac8fa;font-weight:500">${e.name}/</span>`, isHtml: true })
              } else {
                const size = e.content ? e.content.length : Math.floor(Math.random() * 10000) + 100
                const perms = '-rw-r--r--'
                const nameColor = e.executable ? '#28c840' : 'inherit'
                const nameSuffix = e.executable ? '*' : ''
                if (e.executable) {
                  newOutput.push({ text: `${perms}  1   user  staff  ${size.toString().padStart(5)}  ${dateStr} <span style="color:#28c840;font-weight:500">${e.name}${nameSuffix}</span>`, isHtml: true })
                } else {
                  newOutput.push({ text: `${perms}  1   user  staff  ${size.toString().padStart(5)}  ${dateStr} ${e.name}`, color: 'text-white/80' })
                }
              }
            })
          } else {
            // Simple listing with color
            if (allEntries.length > 0) {
              const line = allEntries.map(e => {
                if (e.type === 'directory') {
                  return `<span style="color:#5ac8fa;font-weight:500">${e.name}/</span>`
                }
                if (e.executable) {
                  return `<span style="color:#28c840;font-weight:500">${e.name}*</span>`
                }
                return e.name
              }).join('  ')
              newOutput.push({ text: line, isHtml: true })
            }
          }
        }
        break
      }

      case 'pwd': {
        const path = currentPath.length === 0 ? '/Users/user' : `/Users/user/${currentPath.join('/')}`
        newOutput.push({ text: path, color: 'text-white/80' })
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

        let pathParts: string[]
        if (target.startsWith('~/')) {
          pathParts = target.slice(2).split('/').filter(Boolean)
          const { node, path } = resolveNode(pathParts)
          if (!node) {
            newOutput.push({ text: `cd: no such file or directory: ${target}`, color: 'text-red-400' })
          } else {
            setCurrentPath(path)
          }
          break
        }

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
        newOutput.push({ text: 'user', color: 'text-white/80' })
        break
      }

      case 'hostname': {
        newOutput.push({ text: 'MacBook.local', color: 'text-white/80' })
        break
      }

      case 'uname': {
        if (args.includes('-a')) {
          newOutput.push({ text: 'Darwin MacBook 23.5.0 Darwin Kernel Version 23.5.0: Tue May  7 21:53:37 PDT 2024; root:xnu-10063.141.2~2/RELEASE_ARM_T6031 arm64', color: 'text-white/80' })
        } else {
          newOutput.push({ text: 'Darwin', color: 'text-white/80' })
        }
        break
      }

      case 'date': {
        newOutput.push({ text: new Date().toString(), color: 'text-white/80' })
        break
      }

      case 'echo': {
        const text = args.join(' ')
        // Handle $VAR expansion
        const expanded = text.replace(/\$(\w+)/g, (_, varName) => envVars[varName] || '')
        newOutput.push({ text: expanded, color: 'text-white/80' })
        break
      }

      case 'clear': {
        // Handled specially - clears output
        break
      }

      case 'cat': {
        if (args.length === 0) {
          newOutput.push({ text: 'cat: missing file operand', color: 'text-red-400' })
          break
        }

        const fileName = args[0]
        const { content, error } = getFileContent(fileName)
        if (error) {
          newOutput.push({ text: error, color: 'text-red-400' })
        } else if (content !== null) {
          content.split('\n').forEach(line => {
            newOutput.push({ text: line, color: 'text-white/80' })
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
        }
        break
      }

      case 'cp': {
        if (args.length < 2) {
          newOutput.push({ text: 'cp: missing file operand', color: 'text-red-400' })
          break
        }

        const srcName = args[0]
        const dstName = args[1]
        const currentDir = getCurrentDir()
        const srcFile = currentDir[srcName]

        if (!srcFile) {
          newOutput.push({ text: `cp: ${srcName}: No such file or directory`, color: 'text-red-400' })
        } else if (srcFile.type === 'directory') {
          newOutput.push({ text: `cp: ${srcName}: is a directory`, color: 'text-red-400' })
        } else {
          setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev)) as Record<string, FileSystemNode>
            let current: Record<string, FileSystemNode> = newFs
            for (const part of currentPath) {
              current = current[part].children!
            }
            current[dstName] = { type: 'file', name: dstName, content: srcFile.content ?? '' }
            return newFs
          })
          newOutput.push({ text: `copied ${srcName} to ${dstName}`, color: 'text-white/80' })
        }
        break
      }

      case 'mv': {
        if (args.length < 2) {
          newOutput.push({ text: 'mv: missing file operand', color: 'text-red-400' })
          break
        }

        const srcName = args[0]
        const dstName = args[1]
        const currentDir = getCurrentDir()
        const srcFile = currentDir[srcName]

        if (!srcFile) {
          newOutput.push({ text: `mv: ${srcName}: No such file or directory`, color: 'text-red-400' })
        } else {
          setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev)) as Record<string, FileSystemNode>
            let current: Record<string, FileSystemNode> = newFs
            for (const part of currentPath) {
              current = current[part].children!
            }
            current[dstName] = { ...srcFile, name: dstName }
            delete current[srcName]
            return newFs
          })
          newOutput.push({ text: `moved ${srcName} to ${dstName}`, color: 'text-white/80' })
        }
        break
      }

      case 'grep': {
        if (args.length < 2) {
          newOutput.push({ text: 'usage: grep PATTERN FILE', color: 'text-red-400' })
          break
        }

        const pattern = args[0]
        const fileName = args[1]
        const { content, error } = getFileContent(fileName)

        if (error) {
          newOutput.push({ text: error, color: 'text-red-400' })
        } else if (content !== null) {
          const matchingLines = content.split('\n').filter(line =>
            line.toLowerCase().includes(pattern.toLowerCase())
          )
          if (matchingLines.length === 0) {
            // No output (like real grep)
          } else {
            matchingLines.forEach(line => {
              // Highlight the matched portion
              const regex = new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
              const highlighted = line.replace(regex, '<span style="color:#ff375f;font-weight:600">$1</span>')
              newOutput.push({ text: highlighted, isHtml: true })
            })
          }
        }
        break
      }

      case 'man': {
        if (args.length === 0) {
          newOutput.push({ text: 'What manual page do you want?', color: 'text-white/80' })
          break
        }

        const cmdName = args[0]
        const manPage = MAN_PAGES[cmdName]
        if (manPage) {
          manPage.forEach(line => {
            if (line === '') {
              newOutput.push({ text: '', color: 'text-white/80' })
            } else if (line.startsWith('NAME') || line.startsWith('SYNOPSIS') || line.startsWith('DESCRIPTION') || line.startsWith('SEE ALSO')) {
              newOutput.push({ text: `    ${line}`, color: 'text-[#5ac8fa] font-bold' })
            } else if (line.includes('(1)') || line.includes('(8)')) {
              newOutput.push({ text: line, color: 'text-white/60' })
            } else {
              newOutput.push({ text: `    ${line}`, color: 'text-white/80' })
            }
          })
        } else {
          newOutput.push({ text: `No manual entry for ${cmdName}`, color: 'text-red-400' })
        }
        break
      }

      case 'which': {
        if (args.length === 0) {
          newOutput.push({ text: 'which: missing argument', color: 'text-red-400' })
          break
        }
        const cmdName = args[0]
        const cmdPath = COMMAND_PATHS[cmdName]
        if (cmdPath) {
          newOutput.push({ text: cmdPath, color: 'text-white/80' })
        } else {
          newOutput.push({ text: `${cmdName} not found`, color: 'text-red-400' })
        }
        break
      }

      case 'env': {
        Object.entries(envVars).sort(([a], [b]) => a.localeCompare(b)).forEach(([key, val]) => {
          newOutput.push({ text: `${key}=${val}`, color: 'text-white/80' })
        })
        break
      }

      case 'export': {
        const exportArg = args.join(' ')
        const eqIndex = exportArg.indexOf('=')
        if (eqIndex === -1) {
          // Just show the variable
          const varName = exportArg.trim()
          if (envVars[varName]) {
            newOutput.push({ text: `${varName}="${envVars[varName]}"`, color: 'text-white/80' })
          }
        } else {
          const varName = exportArg.slice(0, eqIndex).trim()
          const varValue = exportArg.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
          if (varName) {
            setEnvVars(prev => ({ ...prev, [varName]: varValue }))
          }
        }
        break
      }

      case 'history': {
        if (commandHistory.length === 0) {
          newOutput.push({ text: '  (empty)', color: 'text-white/40' })
        } else {
          const startIdx = Math.max(0, commandHistory.length - 50)
          for (let i = commandHistory.length - 1; i >= startIdx; i--) {
            const num = (commandHistory.length - i).toString().padStart(4, ' ')
            newOutput.push({ text: `  ${num}  ${commandHistory[i]}`, color: 'text-white/80' })
          }
        }
        break
      }

      case 'curl': {
        if (args.length === 0) {
          newOutput.push({ text: 'curl: try \'curl --help\' for more information', color: 'text-red-400' })
          break
        }
        const url = args[0]
        newOutput.push({ text: `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`, color: 'text-white/40' })
        newOutput.push({ text: `                                 Dload  Upload   Total   Spent    Left  Speed`, color: 'text-white/40' })
        newOutput.push({ text: `100   256  100   256    0     0  12500      0 --:--:-- --:--:-- --:--:-- 12500`, color: 'text-white/40' })
        newOutput.push({ text: '' })

        // Simulated response based on URL
        if (url.includes('example.com')) {
          newOutput.push({ text: '<!doctype html>', color: 'text-white/80' })
          newOutput.push({ text: '<html>', color: 'text-white/80' })
          newOutput.push({ text: '<head><title>Example Domain</title></head>', color: 'text-white/80' })
          newOutput.push({ text: '<body><p>This domain is for use in illustrative examples.</p></body>', color: 'text-white/80' })
          newOutput.push({ text: '</html>', color: 'text-white/80' })
        } else if (url.includes('api.') || url.includes('json')) {
          newOutput.push({ text: '{"status":"ok","data":{"message":"Hello from the simulated API"}}', color: 'text-white/80' })
        } else {
          newOutput.push({ text: `<!DOCTYPE html>`, color: 'text-white/80' })
          newOutput.push({ text: `<html><head><title>${url}</title></head>`, color: 'text-white/80' })
          newOutput.push({ text: `<body><h1>Welcome to ${url}</h1></body></html>`, color: 'text-white/80' })
        }
        break
      }

      case 'ping': {
        if (args.length === 0) {
          newOutput.push({ text: 'ping: usage error: Destination address required', color: 'text-red-400' })
          break
        }
        const host = args[0]
        newOutput.push({ text: `PING ${host} (${host.includes('.') ? host : '127.0.0.1'}): 56 data bytes`, color: 'text-white/80' })
        for (let i = 0; i < 3; i++) {
          const time = (Math.random() * 30 + 5).toFixed(3)
          newOutput.push({ text: `64 bytes from ${host.includes('.') ? host : '127.0.0.1'}: icmp_seq=${i} ttl=64 time=${time} ms`, color: 'text-white/80' })
        }
        newOutput.push({ text: '', color: 'text-white/80' })
        newOutput.push({ text: `--- ${host} ping statistics ---`, color: 'text-white/80' })
        newOutput.push({ text: `3 packets transmitted, 3 packets received, 0.0% packet loss`, color: 'text-white/80' })
        break
      }

      case 'df': {
        if (args.includes('-h')) {
          newOutput.push({ text: 'Filesystem      Size   Used  Avail Capacity  Mounted on', color: 'text-white/50' })
          newOutput.push({ text: '/dev/disk1s1    460Gi  234Gi  221Gi    52%    /', color: 'text-white/80' })
          newOutput.push({ text: '/dev/disk1s2    460Gi   12Gi  221Gi     5%    /System/Volumes/Data', color: 'text-white/80' })
          newOutput.push({ text: '/dev/disk1s3    460Gi  2.0Gi  221Gi     1%    /System/Volumes/VM', color: 'text-white/80' })
          newOutput.push({ text: 'tmpfs           1.0Gi   50Mi  974Mi     5%    /tmp', color: 'text-white/80' })
        } else {
          newOutput.push({ text: 'Filesystem     1K-blocks      Used  Available Capacity  Mounted on', color: 'text-white/50' })
          newOutput.push({ text: '/dev/disk1s1  482344960 245234688 231654912    52%    /', color: 'text-white/80' })
          newOutput.push({ text: '/dev/disk1s2  482344960  12582912 231654912     5%    /System/Volumes/Data', color: 'text-white/80' })
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
          color: 'text-white/80',
        })
        break
      }

      case 'ps': {
        if (args.includes('aux') || args.includes('-aux')) {
          newOutput.push({ text: 'USER               PID  %CPU  %MEM      VSZ    RSS   TT  STAT STARTED     TIME COMMAND', color: 'text-white/50' })
          newOutput.push({ text: 'user             84201   2.3   1.8  4587232  147456  ??  S     9:30AM   0:12.34 /Applications/Safari.app/Contents/MacOS/Safari', color: 'text-white/80' })
          newOutput.push({ text: 'user             65539   1.7   0.9  4101896   73728  ??  S     9:28AM   0:08.21 /Applications/Notes.app/Contents/MacOS/Notes', color: 'text-white/80' })
          newOutput.push({ text: 'user             37291   0.4   0.5  3276848   40960  ??  S     9:25AM   0:02.10 /System/Library/CoreServices/Finder.app', color: 'text-white/80' })
          newOutput.push({ text: 'user               412   0.1   0.3  2949120   24576  ??  Ss    9:00AM   0:01.45 /usr/sbin/syslogd', color: 'text-white/80' })
          newOutput.push({ text: 'user               198   0.0   0.1  2588672   12288  ??  Ss    9:00AM   0:00.32 /usr/libexec/launchd', color: 'text-white/80' })
          newOutput.push({ text: 'user             91337   3.1   2.1  5012344  172032  ??  S     9:32AM   0:15.67 /Applications/Terminal.app/Contents/MacOS/Terminal', color: 'text-white/80' })
          newOutput.push({ text: 'user             78421   1.2   0.7  3891234   57344  ??  S     9:29AM   0:06.89 /Applications/Music.app/Contents/MacOS/Music', color: 'text-white/80' })
        } else {
          newOutput.push({ text: '  PID TTY          TIME CMD', color: 'text-white/50' })
          newOutput.push({ text: ' 84201 ttys000    0:00.12 -zsh', color: 'text-white/80' })
        }
        break
      }

      case 'top': {
        newOutput.push({ text: 'Processes: 287 total, 3 running, 284 stuck, 1423 threads', color: 'text-white/80' })
        newOutput.push({ text: 'Load Avg: 1.82, 1.65, 1.43', color: 'text-white/80' })
        newOutput.push({ text: 'CPU usage: 12.3% user, 5.7% sys, 82.0% idle', color: 'text-white/80' })
        newOutput.push({ text: 'PhysMem: 8192M used, 10240M free', color: 'text-white/80' })
        newOutput.push({ text: 'Networks: packets in 284721, packets out 192837', color: 'text-white/80' })
        newOutput.push({ text: '', color: 'text-white/80' })
        newOutput.push({ text: 'PID    COMMAND          %CPU  %MEM', color: 'text-white/50' })
        newOutput.push({ text: '84201  Safari            2.3   1.8', color: 'text-white/80' })
        newOutput.push({ text: '91337  Terminal          3.1   2.1', color: 'text-white/80' })
        newOutput.push({ text: '65539  Notes             1.7   0.9', color: 'text-white/80' })
        newOutput.push({ text: '78421  Music             1.2   0.7', color: 'text-white/80' })
        newOutput.push({ text: '37291  Finder            0.4   0.5', color: 'text-white/80' })
        newOutput.push({ text: '', color: 'text-white/80' })
        newOutput.push({ text: 'type q to exit (simulated)', color: 'text-yellow-400' })
        break
      }

      case 'neofetch': {
        NEOFETCH_ART.forEach(line => {
          newOutput.push({ text: line, isHtml: true })
        })
        break
      }

      case 'cowsay': {
        const message = args.length > 0 ? args.join(' ') : 'Moo!'
        const cowLines = cowsay(message)
        cowLines.forEach(line => {
          newOutput.push({ text: line, color: 'text-white/80' })
        })
        break
      }

      case 'fortune': {
        const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
        newOutput.push({ text: fortune, color: 'text-yellow-300' })
        break
      }

      case 'matrix': {
        const matrixLines = generateMatrixLines()
        matrixLines.forEach(line => {
          newOutput.push({ text: line, color: 'text-green-400' })
        })
        newOutput.push({ text: '', color: 'text-white/80' })
        newOutput.push({ text: 'Wake up, Neo...', color: 'text-green-500' })
        break
      }

      default: {
        newOutput.push({ text: `zsh: command not found: ${command}`, color: 'text-red-400' })
        break
      }
    }
  }, [getPromptPath, getCurrentDir, resolveNode, currentPath, fileSystem, envVars, commandHistory, getFileContent])

  // ─── Command Execution (with pipe support) ───────────────────────────────

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    const newOutput: OutputLine[] = []

    // Build the prompt with colored parts - macOS style: user@MacBook ~ %
    const promptHtml = `<span style="color:#28c840;font-weight:500">user@MacBook</span> <span style="color:#5ac8fa;font-weight:400">${getPromptPath()}</span> <span style="color:white;font-weight:400">%</span> `

    // Echo the command with prompt (green for the command text)
    newOutput.push({ text: promptHtml + `<span style="color:#28c840">${trimmed}</span>`, isHtml: true })

    if (trimmed === '') {
      setOutput(prev => [...prev, ...newOutput])
      return
    }

    // Handle 'clear' specially
    if (trimmed === 'clear') {
      setOutput([])
      return
    }

    // Check for pipe support
    if (trimmed.includes('|')) {
      const pipeSegments = trimmed.split('|').map(s => s.trim())
      let pipeTextOutput: string[] = [] // Plain text output passed between pipe segments
      let finalDisplayOutput: OutputLine[] = [] // Formatted output for display

      for (let segIdx = 0; segIdx < pipeSegments.length; segIdx++) {
        const segment = pipeSegments[segIdx]
        const segOutput: OutputLine[] = []

        if (segIdx === 0) {
          // First command: execute normally, capture its output
          executeSingleCommand(segment, segOutput)
        } else {
          // Subsequent pipe commands: operate on previous output text
          const parts = segment.split(/\s+/)
          const command = parts[0]
          const args = parts.slice(1)

          if (command === 'grep' && args.length >= 1) {
            const pattern = args[0]
            const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(escaped, 'gi')
            const matchingLines = pipeTextOutput.filter(line => regex.test(line))
            matchingLines.forEach(line => {
              const matchRegex = new RegExp(`(${escaped})`, 'gi')
              const highlighted = line.replace(matchRegex, '<span style="color:#ff375f;font-weight:600">$1</span>')
              segOutput.push({ text: highlighted, isHtml: true })
            })
          } else if (command === 'wc') {
            const lineCount = pipeTextOutput.length
            const wordCount = pipeTextOutput.reduce((acc, line) => acc + line.split(/\s+/).filter(Boolean).length, 0)
            const charCount = pipeTextOutput.reduce((acc, line) => acc + line.length, 0)
            segOutput.push({ text: `  ${lineCount}   ${wordCount}  ${charCount}`, color: 'text-white/80' })
          } else if (command === 'sort') {
            [...pipeTextOutput].sort().forEach(line => {
              segOutput.push({ text: line, color: 'text-white/80' })
            })
          } else if (command === 'head') {
            const n = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1] || '10') : 10
            pipeTextOutput.slice(0, n).forEach(line => {
              segOutput.push({ text: line, color: 'text-white/80' })
            })
          } else if (command === 'tail') {
            const n = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1] || '10') : 10
            pipeTextOutput.slice(-n).forEach(line => {
              segOutput.push({ text: line, color: 'text-white/80' })
            })
          } else if (command === 'uniq') {
            let prev = ''
            pipeTextOutput.forEach(line => {
              if (line !== prev) {
                segOutput.push({ text: line, color: 'text-white/80' })
                prev = line
              }
            })
          } else if (command === 'cat') {
            pipeTextOutput.forEach(line => {
              segOutput.push({ text: line, color: 'text-white/80' })
            })
          } else {
            segOutput.push({ text: `zsh: command not found: ${command}`, color: 'text-red-400' })
          }
        }

        // Extract plain text for next pipe segment (strip HTML tags)
        pipeTextOutput = segOutput.map(line =>
          line.isHtml ? line.text.replace(/<[^>]*>/g, '') : line.text
        )
        // Keep the formatted output of the last segment for display
        finalDisplayOutput = segOutput
      }

      // Add only the final pipe output to display
      newOutput.push(...finalDisplayOutput)
    } else {
      executeSingleCommand(trimmed, newOutput)
    }

    setOutput(prev => [...prev, ...newOutput])
  }, [getPromptPath, executeSingleCommand])

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
    setTabSuggestions([])
    setSavedInput('')
  }, [input, executeCommand])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      // Tab completion
      const trimmed = input.trim()
      const parts = trimmed.split(/\s+/)
      const isFirstWord = parts.length <= 1

      if (isFirstWord) {
        // Complete command name
        const partial = parts[0] || ''
        const matches = COMMAND_NAMES.filter(cmd => cmd.startsWith(partial))
        if (matches.length === 1) {
          setInput(matches[0] + ' ')
          setTabSuggestions([])
        } else if (matches.length > 1) {
          setTabSuggestions(matches)
        } else {
          setTabSuggestions([])
        }
      } else {
        // Complete file/directory name
        const partial = parts[parts.length - 1] || ''
        const currentDir = getCurrentDir()
        const entries = Object.keys(currentDir)
        const matches = entries.filter(name => name.startsWith(partial))
        if (matches.length === 1) {
          const completed = matches[0]
          const isDir = currentDir[completed]?.type === 'directory'
          const newParts = [...parts.slice(0, -1), completed + (isDir ? '/' : '')]
          setInput(newParts.join(' '))
          setTabSuggestions([])
        } else if (matches.length > 1) {
          setTabSuggestions(matches)
        } else {
          setTabSuggestions([])
        }
      }
      return
    }

    // Clear tab suggestions on any other key
    if (tabSuggestions.length > 0) {
      setTabSuggestions([])
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      // Save current input if starting to navigate history
      if (historyIndex === -1) {
        setSavedInput(input)
      }
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      setInput(commandHistory[newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const newIndex = historyIndex - 1
      if (newIndex === -1) {
        setInput(savedInput)
      } else {
        setInput(commandHistory[newIndex])
      }
      setHistoryIndex(newIndex)
    }
  }, [commandHistory, historyIndex, input, getCurrentDir, tabSuggestions, savedInput])

  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // ─── Auto-scroll ────────────────────────────────────────────────────────

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [output, tabSuggestions])

  // ─── Auto-focus on mount ────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────────

  const promptPath = getPromptPath()

  return (
    <div
      className="flex flex-col w-full h-full bg-[#1e1e1e]/95 text-[13px] leading-[1.5] cursor-text select-text"
      onClick={handleTerminalClick}
      style={{ fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace" }}
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
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .terminal-cursor {
          animation: terminal-blink 1s step-end infinite;
        }
      `}</style>

      {/* Title bar subtitle area */}
      <div className="flex items-center justify-center h-[26px] shrink-0 bg-[#3a3a3a]/90 border-b border-white/5 px-3">
        <span className="text-[11px] text-white/40 tracking-wide" style={{ fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace" }}>
          user@MacBook — zsh — 80×24
        </span>
      </div>

      {/* Terminal output area */}
      <div
        ref={scrollRef}
        className="terminal-scroll flex-1 overflow-y-auto p-3 pb-0 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.15) transparent',
        }}
      >
        {/* Output lines */}
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all min-h-[20px]">
            {line.isHtml ? (
              <span
                className="text-white/80"
                dangerouslySetInnerHTML={{ __html: line.text }}
              />
            ) : (
              <span className={line.color ?? 'text-white/80'}>{line.text}</span>
            )}
          </div>
        ))}

        {/* Tab suggestions */}
        {tabSuggestions.length > 0 && (
          <div className="whitespace-pre-wrap break-all min-h-[20px]">
            <span className="text-[#5ac8fa]/60">{tabSuggestions.join('  ')}</span>
          </div>
        )}

        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center whitespace-pre min-h-[20px]">
          <span className="text-[#28c840] font-medium shrink-0">user@MacBook</span>
          <span className="text-white/30 shrink-0"> </span>
          <span className="text-[#5ac8fa] shrink-0">{promptPath}</span>
          <span className="text-white/50 shrink-0"> % </span>
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-white/90 outline-none border-none p-0 m-0 text-[13px] caret-transparent"
              style={{
                caretColor: 'transparent',
                fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace",
              }}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
            />
            {/* Custom blinking cursor - thin vertical line */}
            <span
              className="terminal-cursor absolute top-[1px] pointer-events-none"
              style={{
                left: `${input.length * 7.8}px`,
                width: '1.5px',
                height: '15px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '0.5px',
                display: 'inline-block',
              }}
            />
          </div>
        </form>

        {/* Bottom padding for scroll */}
        <div className="h-4" />
      </div>
    </div>
  )
}
