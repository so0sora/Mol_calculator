import React, { useState } from 'react';
import './App.css';
import { Calculate, SubscriptConverter } from './ExtraFunction';
import atomDataJson from './atom.json';

type AtomDataType = {
  [key: string]: {
    symbol: string;
    atomic_mass: number;
  };
};

const atomData: AtomDataType = atomDataJson as AtomDataType;

function App() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState(''); /* inputValue는 입력받은 분자식/화학식*/
  const [inputValue2, setInputValue2] = useState(''); /* inputValue는 입력받은 계수와 단위위*/
  const [parsedAtoms, setParsedAtoms] = useState<{ symbol: string, count: number }[]>([]); // 결과 저장용
  const [error, setError] = useState<string | null>(null); // 오류 메시지 상태 추가

  const handleMenuClick = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const handleSubscript = () => {
    setInputValue(SubscriptConverter.toSubscriptLastChar(inputValue));
  };

  // 변환 버튼 클릭 시 결과 저장
  const handleConvert = () => {
    setError(null); // 이전 오류 초기화
    // 분자식에서 원소 기호 추출 (아래첨자 포함)
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

  return (
    <div className="App">
      {/* 최상단 헤더 */}

      <div className="header">
        {/* 햄버거 버튼(사이드 메뉴 열기기) */}
        <button
          onClick={handleMenuClick}
          className="menu-btn"
          aria-label="open side menu"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <span className="header-title"> 
          mol_calculator
        </span>
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
          <li>아직 미완성임.</li>
          <li>개발자: 최은우</li>
        </ul>
      </div>

      {/* 사이드 메뉴 블러 오버레이 */}
      {sideMenuOpen && (
        <div className="overlay" onClick={handleMenuClick}></div>
      )}

      {/* 본문 영역 */}
      <div className="main-content">
        <div className="center-box">

          <input /* 분자식을 입력받는 텍스트 박스 */
            type="text"
            className="text-input"
            placeholder="분자식/화학식 입력 (ex. H₂O)"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <button className="subscript-btn" onClick={handleSubscript}> 
            아래 첨자로 변환하기
          </button>
          <input /* 계수와 단위를 입력받는 텍스트 박스*/
            type="text"
            className="text-input"
            placeholder="계수, 단위 입력 (ex. 1 mol, 10 kg)"
            value={inputValue2}
            onChange={e => setInputValue2(e.target.value)}
          />
          <button className="convert-btn" onClick={handleConvert} aria-label="변환">
            <svg width="24" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M12 19l7-7M12 19l-7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
             변환하기
          </button>
          {/* 오류 메시지 출력 */}
          {error && (
            <div style={{ color: 'red', marginTop: '12px', fontWeight: 'bold' }}>
              {error}
            </div>
          )}
          {/* 결과 출력 예시 */}
          {parsedAtoms.length > 0 && (
            <div style={{ marginTop: '16px', color: '#fff' }}>
              {parsedAtoms.map((atom, idx) => (
                <div key={idx}>
                  {atom.symbol} {atom.count}개 (원자량: {atomData[atom.symbol]?.atomic_mass ?? '-'})
                </div>
              ))}

              {/* 분자량/화학식량 계산 식 및 결과 출력 */}
              <div style={{ marginTop: '12px', fontWeight: 'bold' }}>
                분자량(화학식량):<br />
                {/* 계산식 */}
                {parsedAtoms
                  .map(atom => {
                    const mass = atomData[atom.symbol]?.atomic_mass ?? 0;
                    return `${atom.count}×${mass}`;
                  })
                  .join(' + ')
                }
                <br />
                = {
                  parsedAtoms
                    .reduce(
                      (sum, atom) =>
                        sum + ((atomData[atom.symbol]?.atomic_mass ?? 0) * atom.count),
                      0
                    )
                    .toFixed(3)
                }
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default App;