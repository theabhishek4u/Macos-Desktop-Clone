'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

type Operation = '+' | '−' | '×' | '÷' | null;

interface CalcState {
  display: string;
  previousValue: number | null;
  operation: Operation;
  waitingForOperand: boolean;
  justEvaluated: boolean;
  expression: string;
}

const initialState: CalcState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  justEvaluated: false,
  expression: '',
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

function getDisplayFontSize(display: string): string {
  const formatted = formatDisplay(display);
  if (formatted.length > 12) return 'text-3xl';
  if (formatted.length > 9) return 'text-4xl';
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
    default:
      return right;
  }
}

function operationSymbol(op: Operation): string {
  return op ?? '';
}

export default function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeKeyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = useCallback(() => {
    setState(initialState);
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
        // Starting a new calculation after pressing =
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
        // If in the middle of an operation, calculate percentage of previousValue
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
        // Chain operation: calculate the pending operation first
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
      };
    });
  }, []);

  const clearEntry = useCallback(() => {
    setState((prev) => {
      if (prev.display === 'Error') {
        return initialState;
      }
      // If we just evaluated, AC resets everything
      if (prev.justEvaluated) {
        return initialState;
      }
      return { ...prev, display: '0' };
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for keys we handle
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

      // Visual feedback
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

  // Determine active operator
  const activeOperator = state.waitingForOperand ? state.operation : null;

  // Button definitions
  type ButtonDef = {
    label: string;
    action: () => void;
    type: 'number' | 'operator' | 'function';
    wide?: boolean;
    key: string;
  };

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
    const base =
      'relative flex items-center justify-center rounded-full font-normal select-none cursor-pointer transition-all duration-75 active:scale-[0.92] focus:outline-none focus:ring-0 focus:ring-offset-0';
    const size = btn.wide ? 'h-[56px] col-span-2' : 'h-[56px] w-[56px]';
    const pressed = isActive ? 'scale-[0.92]' : '';

    if (btn.type === 'function') {
      return `${base} ${size} bg-[#a5a5a5] hover:bg-[#c5c5c5] text-black text-[20px] ${pressed}`;
    }
    if (btn.type === 'operator') {
      // Active operator: white background, orange text
      const opKey = btn.key;
      const isActiveOp = activeOperator && opKey === activeOperator;
      if (isActiveOp) {
        return `${base} ${size} bg-white text-orange-500 text-[24px] font-medium ${pressed}`;
      }
      return `${base} ${size} bg-orange-500 hover:bg-orange-400 text-white text-[24px] font-medium ${pressed}`;
    }
    // Number buttons
    return `${base} ${size} bg-[#505050] hover:bg-[#606060] text-white text-[22px] ${pressed}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1c1c1c] rounded-xl overflow-hidden select-none">
      {/* Display Area */}
      <div className="flex flex-col items-end justify-end px-5 pt-2 pb-1 min-h-[100px]">
        {/* Expression line */}
        <div className="text-[#8e8e8e] text-xs h-5 text-right w-full truncate mb-1">
          {state.expression}
        </div>
        {/* Main display */}
        <div className="text-right w-full overflow-hidden">
          <span
            className={`text-white font-light tracking-tight ${getDisplayFontSize(state.display)} leading-tight`}
          >
            {state.display === 'Error' ? 'Error' : formatDisplay(state.display)}
          </span>
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="flex flex-col gap-[10px] px-3 pb-3">
        {buttons.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-4 gap-[10px]">
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
                {/* Wide 0 button: left-align the text with padding */}
                {btn.wide ? (
                  <span className="pl-5 self-center text-left w-full">{btn.label}</span>
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
