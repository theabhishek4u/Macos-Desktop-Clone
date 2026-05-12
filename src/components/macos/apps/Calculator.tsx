'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

type Operation = '+' | '−' | '×' | '÷' | 'xʸ' | null;

interface CalcState {
  display: string;
  previousValue: number | null;
  operation: Operation;
  waitingForOperand: boolean;
  justEvaluated: boolean;
  expression: string;
  openParens: number;
}

const initialState: CalcState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  justEvaluated: false,
  expression: '',
  openParens: 0,
};

function formatDisplay(value: string): string {
  if (value === 'Error') return 'Error';
  if (value === 'Infinity' || value === '-Infinity') return 'Error';

  const num = parseFloat(value);
  if (isNaN(num)) return '0';

  // If the user is typing a decimal number (e.g., "3." or "3.0"), preserve it
  if (value.includes('.')) {
    const [intPart, decPart] = value.split('.');
    const formattedInt = parseInt(intPart, 10).toLocaleString('en-US');
    return `${formattedInt}.${decPart}`;
  }

  // For whole numbers, format with commas
  return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function getDisplayFontSize(display: string, isScientific: boolean): string {
  const formatted = formatDisplay(display);
  const len = formatted.length;
  if (isScientific) {
    if (len > 14) return 'text-xl';
    if (len > 11) return 'text-2xl';
    if (len > 8) return 'text-3xl';
    return 'text-4xl';
  }
  if (len > 12) return 'text-3xl';
  if (len > 9) return 'text-4xl';
  return 'text-5xl';
}

function performCalculation(left: number, operation: Operation, right: number): number {
  switch (operation) {
    case '+':
      return left + right;
    case '−':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      if (right === 0) return NaN; // Division by zero
      return left / right;
    case 'xʸ':
      return Math.pow(left, right);
    default:
      return right;
  }
}

function operationSymbol(op: Operation): string {
  if (op === 'xʸ') return '^';
  return op ?? '';
}

export default function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isScientific, setIsScientific] = useState(false);
  const [memory, setMemory] = useState(0);
  const activeKeyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = useCallback(() => {
    setState({ ...initialState });
  }, []);

  const inputDigit = useCallback((digit: string) => {
    setState((prev) => {
      if (prev.display === 'Error') {
        return {
          ...initialState,
          display: digit,
          waitingForOperand: false,
          justEvaluated: false,
        };
      }

      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: digit,
          waitingForOperand: false,
          justEvaluated: false,
        };
      }

      if (prev.justEvaluated) {
        return {
          ...prev,
          display: digit,
          previousValue: null,
          operation: null,
          expression: '',
          waitingForOperand: false,
          justEvaluated: false,
        };
      }

      // Limit display length
      if (prev.display.replace(/[^0-9]/g, '').length >= 15) return prev;

      const newDisplay = prev.display === '0' ? digit : prev.display + digit;
      return { ...prev, display: newDisplay };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.display === 'Error') {
        return { ...initialState, display: '0.', waitingForOperand: false, justEvaluated: false };
      }

      if (prev.waitingForOperand) {
        return { ...prev, display: '0.', waitingForOperand: false, justEvaluated: false };
      }

      if (prev.justEvaluated) {
        return {
          ...prev,
          display: '0.',
          previousValue: null,
          operation: null,
          expression: '',
          waitingForOperand: false,
          justEvaluated: false,
        };
      }

      if (prev.display.includes('.')) return prev;

      return { ...prev, display: prev.display + '.' };
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState((prev) => {
      if (prev.display === 'Error' || prev.display === '0') return prev;

      const currentValue = parseFloat(prev.display);
      const newValue = -currentValue;

      const newDisplay = newValue.toString();

      if (prev.justEvaluated) {
        return {
          ...prev,
          display: newDisplay,
          expression: '',
          justEvaluated: false,
        };
      }

      return { ...prev, display: newDisplay };
    });
  }, []);

  const inputPercent = useCallback(() => {
    setState((prev) => {
      if (prev.display === 'Error') return prev;

      const currentValue = parseFloat(prev.display);
      let newValue: number;

      if (prev.operation && prev.previousValue !== null) {
        newValue = prev.previousValue * (currentValue / 100);
      } else {
        newValue = currentValue / 100;
      }

      const newDisplay = newValue.toString();

      return {
        ...prev,
        display: newDisplay,
        justEvaluated: prev.justEvaluated ? true : prev.justEvaluated,
      };
    });
  }, []);

  const handleOperation = useCallback((nextOp: Operation) => {
    setState((prev) => {
      if (prev.display === 'Error' && prev.previousValue === null) {
        return prev;
      }

      const currentValue = parseFloat(prev.display);

      if (prev.previousValue !== null && prev.operation && !prev.waitingForOperand) {
        const result = performCalculation(prev.previousValue, prev.operation, currentValue);
        if (isNaN(result)) {
          return {
            ...initialState,
            display: 'Error',
            expression: '',
          };
        }
        const resultStr = parseFloat(result.toFixed(10)).toString();
        return {
          ...prev,
          display: resultStr,
          previousValue: result,
          operation: nextOp,
          expression: `${formatDisplay(resultStr)} ${operationSymbol(nextOp)}`,
          waitingForOperand: true,
          justEvaluated: false,
        };
      }

      return {
        ...prev,
        previousValue: currentValue,
        operation: nextOp,
        expression: `${formatDisplay(prev.display)} ${operationSymbol(nextOp)}`,
        waitingForOperand: true,
        justEvaluated: false,
      };
    });
  }, []);

  const evaluate = useCallback(() => {
    setState((prev) => {
      if (prev.display === 'Error') return prev;

      if (prev.previousValue === null || !prev.operation) {
        return { ...prev, justEvaluated: true };
      }

      const currentValue = parseFloat(prev.display);
      const result = performCalculation(prev.previousValue, prev.operation, currentValue);

      if (isNaN(result)) {
        return {
          ...initialState,
          display: 'Error',
          expression: `${formatDisplay(prev.previousValue.toString())} ${operationSymbol(prev.operation)} ${formatDisplay(prev.display)} =`,
          justEvaluated: true,
        };
      }

      const resultStr = parseFloat(result.toFixed(10)).toString();
      const fullExpression = `${formatDisplay(prev.previousValue.toString())} ${operationSymbol(prev.operation)} ${formatDisplay(prev.display)} =`;

      return {
        display: resultStr,
        previousValue: null,
        operation: null,
        expression: fullExpression,
        waitingForOperand: false,
        justEvaluated: true,
        openParens: 0,
      };
    });
  }, []);

  const clearEntry = useCallback(() => {
    setState((prev) => {
      if (prev.display === 'Error') {
        return { ...initialState };
      }
      if (prev.justEvaluated) {
        return { ...initialState };
      }
      return { ...prev, display: '0' };
    });
  }, []);

  // ─── Scientific Functions ─────────────────────────────────────────────

  const applyScientific = useCallback((fn: string) => {
    setState((prev) => {
      if (prev.display === 'Error') return prev;
      const val = parseFloat(prev.display);
      let result: number;

      switch (fn) {
        case 'sin':
          result = Math.sin(val);
          break;
        case 'cos':
          result = Math.cos(val);
          break;
        case 'tan':
          result = Math.tan(val);
          break;
        case 'log':
          result = Math.log10(val);
          break;
        case 'ln':
          result = Math.log(val);
          break;
        case '√':
          result = Math.sqrt(val);
          break;
        case 'x²':
          result = val * val;
          break;
        default:
          return prev;
      }

      if (isNaN(result) || !isFinite(result)) {
        return { ...prev, display: 'Error' };
      }

      const resultStr = parseFloat(result.toFixed(10)).toString();
      return {
        ...prev,
        display: resultStr,
        justEvaluated: false,
      };
    });
  }, []);

  const insertConstant = useCallback((constant: 'π' | 'e') => {
    const val = constant === 'π' ? Math.PI : Math.E;
    setState((prev) => {
      const valStr = parseFloat(val.toFixed(10)).toString();
      if (prev.waitingForOperand || prev.justEvaluated) {
        return {
          ...prev,
          display: valStr,
          waitingForOperand: false,
          justEvaluated: false,
          ...(prev.justEvaluated ? { previousValue: null, operation: null, expression: '' } : {}),
        };
      }
      if (prev.display === '0') {
        return { ...prev, display: valStr };
      }
      return { ...prev, display: prev.display + valStr };
    });
  }, []);

  const openParen = useCallback(() => {
    setState((prev) => ({
      ...prev,
      openParens: prev.openParens + 1,
      waitingForOperand: true,
      justEvaluated: false,
    }));
  }, []);

  const closeParen = useCallback(() => {
    setState((prev) => {
      if (prev.openParens <= 0) return prev;
      return {
        ...prev,
        openParens: prev.openParens - 1,
        waitingForOperand: false,
        justEvaluated: false,
      };
    });
  }, []);

  // ─── Memory Functions ─────────────────────────────────────────────

  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const memoryRecall = useCallback(() => {
    setState((prev) => ({
      ...prev,
      display: memory.toString(),
      waitingForOperand: false,
      justEvaluated: false,
    }));
  }, [memory]);

  const memoryAdd = useCallback(() => {
    setState((prev) => {
      const val = parseFloat(prev.display);
      if (!isNaN(val)) {
        setMemory(m => m + val);
      }
      return prev;
    });
  }, []);

  const memorySubtract = useCallback(() => {
    setState((prev) => {
      const val = parseFloat(prev.display);
      if (!isNaN(val)) {
        setMemory(m => m - val);
      }
      return prev;
    });
  }, []);

  // ─── Keyboard Support ─────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key >= '0' && e.key <= '9') ||
        e.key === '.' ||
        e.key === '+' ||
        e.key === '-' ||
        e.key === '*' ||
        e.key === '/' ||
        e.key === 'Enter' ||
        e.key === '=' ||
        e.key === 'Escape' ||
        e.key === '%' ||
        e.key === 'Backspace'
      ) {
        e.preventDefault();
      }

      const keyMap: Record<string, string> = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '.': '.', '+': '+', '-': '−', '*': '×', '/': '÷',
        'Enter': '=', '=': '=', 'Escape': 'AC', '%': '%',
        'Backspace': 'C',
      };

      const mappedKey = keyMap[e.key];
      if (mappedKey) {
        setActiveKey(mappedKey);
        if (activeKeyTimerRef.current) clearTimeout(activeKeyTimerRef.current);
        activeKeyTimerRef.current = setTimeout(() => setActiveKey(null), 120);
      }

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        handleOperation('+');
      } else if (e.key === '-') {
        handleOperation('−');
      } else if (e.key === '*') {
        handleOperation('×');
      } else if (e.key === '/') {
        handleOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        evaluate();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === '%') {
        inputPercent();
      } else if (e.key === 'Backspace') {
        clearEntry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (activeKeyTimerRef.current) clearTimeout(activeKeyTimerRef.current);
    };
  }, [inputDigit, inputDecimal, handleOperation, evaluate, clearAll, inputPercent, clearEntry]);

  const isClearButtonC = state.display !== '0' && !state.waitingForOperand && state.display !== 'Error';
  const activeOperator = state.waitingForOperand ? state.operation : null;

  // ─── Button Definitions ─────────────────────────────────────────────

  type ButtonDef = {
    label: string;
    action: () => void;
    type: 'number' | 'operator' | 'function' | 'scientific' | 'memory';
    wide?: boolean;
    key: string;
  };

  const scientificRows: ButtonDef[][] = [
    [
      { label: 'sin', action: () => applyScientific('sin'), type: 'scientific', key: 'sin' },
      { label: 'cos', action: () => applyScientific('cos'), type: 'scientific', key: 'cos' },
      { label: 'tan', action: () => applyScientific('tan'), type: 'scientific', key: 'tan' },
      { label: 'π', action: () => insertConstant('π'), type: 'scientific', key: 'π' },
    ],
    [
      { label: 'log', action: () => applyScientific('log'), type: 'scientific', key: 'log' },
      { label: 'ln', action: () => applyScientific('ln'), type: 'scientific', key: 'ln' },
      { label: '√', action: () => applyScientific('√'), type: 'scientific', key: '√' },
      { label: 'x²', action: () => applyScientific('x²'), type: 'scientific', key: 'x²' },
    ],
    [
      { label: '(', action: openParen, type: 'scientific', key: '(' },
      { label: ')', action: closeParen, type: 'scientific', key: ')' },
      { label: 'e', action: () => insertConstant('e'), type: 'scientific', key: 'e' },
      { label: 'xʸ', action: () => handleOperation('xʸ'), type: 'operator', key: 'xʸ' },
    ],
  ];

  const memoryRow: ButtonDef[] = [
    { label: 'MC', action: memoryClear, type: 'memory', key: 'MC' },
    { label: 'MR', action: memoryRecall, type: 'memory', key: 'MR' },
    { label: 'M+', action: memoryAdd, type: 'memory', key: 'M+' },
    { label: 'M-', action: memorySubtract, type: 'memory', key: 'M-' },
  ];

  const buttons: ButtonDef[][] = [
    [
      { label: isClearButtonC ? 'C' : 'AC', action: isClearButtonC ? clearEntry : clearAll, type: 'function', key: 'AC' },
      { label: '+/−', action: toggleSign, type: 'function', key: '+/-' },
      { label: '%', action: inputPercent, type: 'function', key: '%' },
      { label: '÷', action: () => handleOperation('÷'), type: 'operator', key: '÷' },
    ],
    [
      { label: '7', action: () => inputDigit('7'), type: 'number', key: '7' },
      { label: '8', action: () => inputDigit('8'), type: 'number', key: '8' },
      { label: '9', action: () => inputDigit('9'), type: 'number', key: '9' },
      { label: '×', action: () => handleOperation('×'), type: 'operator', key: '×' },
    ],
    [
      { label: '4', action: () => inputDigit('4'), type: 'number', key: '4' },
      { label: '5', action: () => inputDigit('5'), type: 'number', key: '5' },
      { label: '6', action: () => inputDigit('6'), type: 'number', key: '6' },
      { label: '−', action: () => handleOperation('−'), type: 'operator', key: '−' },
    ],
    [
      { label: '1', action: () => inputDigit('1'), type: 'number', key: '1' },
      { label: '2', action: () => inputDigit('2'), type: 'number', key: '2' },
      { label: '3', action: () => inputDigit('3'), type: 'number', key: '3' },
      { label: '+', action: () => handleOperation('+'), type: 'operator', key: '+' },
    ],
    [
      { label: '0', action: () => inputDigit('0'), type: 'number', wide: true, key: '0' },
      { label: '.', action: inputDecimal, type: 'number', key: '.' },
      { label: '=', action: evaluate, type: 'operator', key: '=' },
    ],
  ];

  const getButtonClasses = (btn: ButtonDef, isActive: boolean): string => {
    const btnSize = isScientific ? 'h-[44px]' : 'h-[56px]';
    const wideSize = isScientific ? 'h-[44px] col-span-2' : 'h-[56px] col-span-2';
    const roundSize = isScientific ? 'h-[44px] w-[44px]' : 'h-[56px] w-[56px]';

    const base =
      'relative flex items-center justify-center rounded-full font-normal select-none cursor-pointer transition-all duration-100 active:scale-[0.94] active:brightness-75 focus:outline-none focus:ring-0 focus:ring-offset-0';
    const size = btn.wide ? wideSize : roundSize;
    const pressed = isActive ? 'scale-[0.94] brightness-75' : '';

    if (btn.type === 'memory') {
      const memSize = isScientific ? 'h-[28px] text-[9px]' : 'h-[28px] text-[10px]';
      return `${base} ${memSize} bg-transparent hover:bg-white/10 text-[#8e8e8e] hover:text-white rounded-md ${pressed}`;
    }

    if (btn.type === 'scientific') {
      const sciFontSize = isScientific ? 'text-[13px]' : 'text-[14px]';
      return `${base} ${size} bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white ${sciFontSize} ${pressed}`;
    }

    if (btn.type === 'function') {
      const funcFontSize = isScientific ? 'text-[16px]' : 'text-[20px]';
      return `${base} ${size} bg-[#a5a5a5] hover:bg-[#d4d4d4] active:bg-[#8e8e8e] text-black ${funcFontSize} ${pressed}`;
    }
    if (btn.type === 'operator') {
      const opFontSize = isScientific ? 'text-[18px]' : 'text-[24px]';
      const opKey = btn.key;
      const isActiveOp = activeOperator && opKey === activeOperator;
      if (isActiveOp) {
        return `${base} ${size} bg-white text-[#FF9500] hover:bg-white/90 ${opFontSize} font-medium ${pressed}`;
      }
      return `${base} ${size} bg-[#FF9500] hover:bg-[#FFa733] active:bg-[#e68600] text-white ${opFontSize} font-medium ${pressed}`;
    }
    // Number buttons
    const numFontSize = isScientific ? 'text-[18px]' : 'text-[22px]';
    return `${base} ${size} bg-[#505050] hover:bg-[#6a6a6a] active:bg-[#3a3a3a] text-white ${numFontSize} ${pressed}`;
  };

  const gap = isScientific ? 'gap-[6px]' : 'gap-[10px]';
  const px = isScientific ? 'px-2' : 'px-3';

  return (
    <div className="flex flex-col h-full w-full bg-[#1c1c1c] rounded-xl overflow-hidden select-none">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between px-3 pt-2">
        <button
          onClick={() => setIsScientific(!isScientific)}
          className="text-[10px] text-[#8e8e8e] hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/10"
        >
          {isScientific ? '◁ Basic' : 'Scientific ▷'}
        </button>
        {memory !== 0 && (
          <span className="text-[10px] text-[#8e8e8e]">M</span>
        )}
      </div>

      {/* Display Area */}
      <div className="flex flex-col items-end justify-end px-4 pt-1 pb-2 min-h-[80px]">
        {/* Expression line */}
        <div className="text-[#8e8e8e] text-[12px] h-5 text-right w-full truncate mb-0.5">
          {state.expression}
          {state.openParens > 0 && <span className="text-orange-400/60"> {'('.repeat(state.openParens)}</span>}
        </div>
        {/* Main display */}
        <div className="text-right w-full overflow-hidden">
          <span
            className={`text-white font-extralight tracking-tight ${getDisplayFontSize(state.display, isScientific)} leading-tight`}
          >
            {state.display === 'Error' ? 'Error' : formatDisplay(state.display)}
          </span>
        </div>
      </div>

      {/* Memory Row (only in basic mode) */}
      {!isScientific && (
        <div className={`grid grid-cols-4 ${px} gap-1 pb-1`}>
          {memoryRow.map((btn) => (
            <button
              key={btn.key}
              className={getButtonClasses(btn, activeKey === btn.key)}
              onClick={btn.action}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Scientific Buttons */}
      {isScientific && (
        <div className={`flex flex-col ${gap} ${px} pb-1`}>
          {/* Memory row in scientific mode (inline) */}
          <div className={`grid grid-cols-4 gap-[4px]`}>
            {memoryRow.map((btn) => (
              <button
                key={btn.key}
                className="flex items-center justify-center h-[28px] rounded-md text-[9px] text-[#8e8e8e] hover:text-white hover:bg-white/10 transition-colors select-none cursor-pointer"
                onClick={btn.action}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {scientificRows.map((row, rowIdx) => (
            <div key={`sci-${rowIdx}`} className={`grid grid-cols-4 ${gap}`}>
              {row.map((btn) => (
                <button
                  key={btn.key}
                  className={getButtonClasses(btn, activeKey === btn.key)}
                  onClick={btn.action}
                  style={!btn.wide ? { justifySelf: 'center' } : undefined}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Buttons Grid */}
      <div className={`flex flex-col ${gap} ${px} pb-3 flex-1`}>
        {buttons.map((row, rowIdx) => (
          <div key={`basic-${rowIdx}`} className={`grid grid-cols-4 ${gap}`}>
            {row.map((btn) => (
              <button
                key={btn.key}
                className={getButtonClasses(btn, activeKey === btn.key)}
                onClick={btn.action}
                onMouseDown={() => setActiveKey(btn.key)}
                onMouseUp={() => setActiveKey(null)}
                onMouseLeave={() => setActiveKey(null)}
                style={btn.wide ? {} : { justifySelf: 'center' }}
              >
                {btn.wide ? (
                  <span className="pl-4 self-center text-left w-full">{btn.label}</span>
                ) : (
                  btn.label
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
