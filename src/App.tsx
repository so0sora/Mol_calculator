import React, { useState } from 'react';
import './App.css';
import { Calculate, SubscriptConverter } from './ExtraFunction';
import atomDataJson from './atom.json';
import Result from './Result';

type AtomDataType = {
  [key: string]: {
    symbol: string;
    atomic_mass: number;
  };
};

const atomData: AtomDataType = atomDataJson as AtomDataType;

function App() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [parsedAtoms, setParsedAtoms] = useState<{ symbol: string, count: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleMenuClick = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const handleSubscript = () => {
    setInputValue(SubscriptConverter.toSubscriptLastChar(inputValue));
  };

  const handleConvert = () => {
    setError(null);

    const allowedUnits = ['mol', 'g', 'kg', 'L', 'g/mol', 'L/mol', 'NA'];
    if (unit && !allowedUnits.includes(unit)) {
      setParsedAtoms([]);
      setError(`지원되지 않는 단위입니다: ${unit}`);
      return;
    }

    const regex = /([A-Z][a-z]?)/g;
    const symbols = inputValue.match(regex) || [];
    const invalid = symbols.filter(sym => !atomData[sym]);
    if (invalid.length > 0) {
      setParsedAtoms([]);
      setError(`지원하지 않는 원소 기호가 있습니다: ${invalid.join(', ')}`);
      return;
    }

    const result = Calculate.parseMolecule(inputValue);
    setParsedAtoms(result);
  };

  const parseAmountUnit = (value: string) => {
    const match = value.trim().match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (match) {
      return {
        amount: Number(match[1]),
        unit: match[2].trim() || ''
      };
    }
    return { amount: null, unit: '' };
  };

  const { amount, unit } = parseAmountUnit(inputValue2);

  return (
    <div className="App">
      {/* 최상단 헤더 */}
      <div className="header">
        <button
          onClick={handleMenuClick}
          className="menu-btn"
          aria-label="open side menu"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
        <span className="header-title">mol_calculator</span>
      </div>

      {/* 사이드 메뉴 */}
      <div className={`side-menu${sideMenuOpen ? ' open' : ''}`}>
        {sideMenuOpen && (
          <button
            onClick={handleMenuClick}
            className="close-btn"
            aria-label="메뉴 닫기"
          >
            <span className="close-icon">
              <span className="close-bar close-bar1" />
              <span className="close-bar close-bar2" />
            </span>
          </button>
        )}
        <ul className="side-menu-list">
          <li></li>
          <li>개발자: 최은우</li>
          <li>도움을 주신 분: 송태영</li>
        </ul>
        <div style={{
          fontSize: '11px',
          color: '#bbb',
          textAlign: 'center',
          marginTop: 'auto',
          marginBottom: '12px'
        }}>
          v1.0.1<br />
          2025-06-10
        </div>
      </div>

      {/* 사이드 메뉴 블러 오버레이 */}
      {sideMenuOpen && (
        <div className="overlay" onClick={handleMenuClick}></div>
      )}

      {/* 본문 영역 */}
      <div className="main-content">
        <div className="center-box">
          {/* 인풋 영역 */}
          <div className="input-area">
            <input
              type="text"
              className="text-input"
              placeholder="분자식/화학식 입력 (ex. H₂O)"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 0, marginBottom: '8px' }}>
              <button
                className="subscript-btn convert"
                onClick={() => setInputValue(SubscriptConverter.toSubscriptLastChar(inputValue))}
              >
                아래 첨자로 변환하기
              </button>
              <button
                className="subscript-btn all"
                onClick={() => setInputValue(SubscriptConverter.toSubscriptAll(inputValue))}
              >
                All
              </button>
            </div>
            <input
              type="text"
              className="text-input"
              placeholder="값, 단위 입력 (ex. 1 mol or 10 g)"
              value={inputValue2}
              onChange={e => setInputValue2(e.target.value)}
            />
            {inputValue2 && (
              <div style={{ marginTop: '12px', color: '#fff' }}>
                계수: {amount !== null ? amount : '-'} / 단위: {unit || '-'}
              </div>
            )}
            {/*아래 방향 화살표*/}
            <button className="convert-btn" onClick={handleConvert} aria-label="변환"> 
              <svg width="24" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M12 19l7-7M12 19l-7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              변환하기
            </button>
            {error && (
              <div style={{ color: 'red', marginTop: '12px', fontWeight: 'bold' }}>
                {error}
              </div>
            )}
          </div>
          {/* 아웃풋 영역 */}
          <div className="output-area">
            <Result parsedAtoms={parsedAtoms} amount={amount} unit={unit} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;