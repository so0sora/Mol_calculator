import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { Calculate, SubscriptConverter } from './ExtraFunction';
import atomDataJson from './atom.json';
import Result from './Result';

type AtomDataType = {
  [key: string]: {
    symbol: string;
    atomic_mass: number;
    kor?: string; // 한글 명 필드 추가 (옵셔널)
  };
};

const atomData: AtomDataType = atomDataJson as AtomDataType;

// help 페이지 컴포넌트
function HelpPage() {
  const navigate = useNavigate();

  // 지원하는 원소 목록 추출 (한글 이름 포함)
  const atomList = Object.entries(atomData).map(
    ([symbol, data]) =>
      `${symbol} (${data.symbol}${data.kor ? ', ' + data.kor : ''})`
  );

  // 지원하는 단위 목록
  const unitList = [
    '몰: mol, MOL, mole, 몰', '질량: g, kg', '부피: L, mL', 'NA'
  ];

  return (
    <div
      style={{
        background: '#222',
        color: '#fff',
        minHeight: '100vh',
        padding: 0,
      }}
    >
      {/* 헤더 + 뒤로가기 버튼 */}
      <div className="header">
        <button
          className="menu-btn"
          style={{ marginLeft: 16 }}
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
        >
          {/* ← 아이콘(뒤로가기 버튼의의) */}
          <svg width="28" height="28" viewBox="0 0 28 28">
            <polyline points="18,6 10,14 18,22" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="header-title">mol_calculator</span>
      </div>
      <div style={{ padding: 32, paddingTop: 80 }}>
        <h2>사용법</h2>
        <p>첫 번째 텍스트 박스에 분자식(화학식)을 입력하면 분자량(화학식량)을 구할 수 있다.</p>
        <p>아래 첨자로 변환하기 버튼을 클릭하면 첫 번쨰 텍스트 박스에 입력된 마지막 숫자가 아래 첨자로 바뀐다.</p>
        <p>그 옆의 ALL 버튼을 클릭하면 입력된 모든 숫자가 아래 첨자로 바뀐다.</p>
        <p>두 번째 텍스트 박스에 값과 단위를 입력하면 다른 여러 단위로 변환한 계산 결과가 출력된다.</p>
        <h2>지원하는 원소</h2>
        <div style={{ maxHeight: 200, overflowY: 'auto', background: '#191919', padding: 12, borderRadius: 8, fontSize: 15 }}>
          {atomList.map((atom, i) => (
            <div key={i}>{atom}</div>
          ))}
        </div>
        <h2 style={{ marginTop: 24 }}>지원하는 단위</h2>
        <div style={{ background: '#191919', padding: 12, borderRadius: 8, fontSize: 15 }}>
          {unitList.map((unit, i) => (
            <div key={i}>{unit}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 메인 앱 컴포넌트
function MainApp() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [parsedAtoms, setParsedAtoms] = useState<{ symbol: string, count: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleMenuClick = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const handleHelpMenuClick = () => {
    navigate('/help');
    setSideMenuOpen(false);
  };

  const handleSubscript = () => {
    setInputValue(SubscriptConverter.toSubscriptLastChar(inputValue));
  };

  const handleConvert = () => {
    setError(null);

    const allowedUnits = ['몰','mole', 'mol', 'g', 'kg', 'L', 'mL', 'NA'];
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
          <br /><br /><br />

          {/* help 버튼 */}
          <button
            onClick={handleHelpMenuClick}
            className="help-btn"
            aria-label="도움말"
          >
            help
          </button>

          <br /><br /><br />
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
                ALL
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
                값: {amount !== null ? amount : '-'} / 단위: {unit || '-'}
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

// 실제 라우팅 적용
function RouterApp() {
  return (
    <BrowserRouter basename='https://so0sora.github.io/mol_calculator'>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RouterApp;

