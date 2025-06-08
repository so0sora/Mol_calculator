import React from 'react';
import atomDataJson from './atom.json';

type AtomDataType = {
  [key: string]: {
    symbol: string;
    atomic_mass: number;
  };
};

const atomData: AtomDataType = atomDataJson as AtomDataType;

interface ResultProps {
  parsedAtoms: { symbol: string; count: number }[];
  amount?: number | null;
  unit?: string;
}

const Result: React.FC<ResultProps> = ({ parsedAtoms, amount, unit }) => {
  if (!parsedAtoms || parsedAtoms.length === 0) return null;

  const formula = parsedAtoms
    .map(atom => {
      const mass = atomData[atom.symbol]?.atomic_mass ?? 0;
      return `${atom.count}×${mass}`;
    })
    .join(' + ');

  const total = parsedAtoms
    .reduce(
      (sum, atom) =>
        sum + ((atomData[atom.symbol]?.atomic_mass ?? 0) * atom.count),
      0
    );

  // 단위별 계산
  const isKg = unit === 'kg' && amount && total > 0;
  const isG = unit === 'g' && amount && total > 0;
  const isMol = unit === 'mol' && amount && total > 0;
  const isL = unit === 'L' && amount && total > 0;
  const amountInG = isKg ? amount * 1000 : amount;

  // 0도씨 1기압에서 1mol 기체의 부피(L)
  const MOLAR_VOLUME = 22.4;

  // g, kg → mol, L
  let gToMol = null;
  let gToL = null;
  if ((isG || isKg) && amountInG && total > 0) {
    gToMol = amountInG / total;
    gToL = gToMol * MOLAR_VOLUME;
  }

  // mol → g, L
  let molToG = null;
  let molToL = null;
  if (isMol && amount) {
    molToG = amount * total;
    molToL = amount * MOLAR_VOLUME;
  }

  // L → mol, g
  let lToMol = null;
  let lToG = null;
  if (isL && amount) {
    lToMol = amount / MOLAR_VOLUME;
    lToG = lToMol * total;
  }

  return (
    <div style={{ marginTop: '16px', color: '#fff' }}>
      {parsedAtoms.map((atom, idx) => (
        <div key={idx}>
          {atom.symbol} {atom.count}개 (원자량: {atomData[atom.symbol]?.atomic_mass ?? '-'})
        </div>
      ))}
      <div style={{ marginTop: '12px', fontWeight: 'bold' }}>
        분자량(화학식량): {formula}
        <br />
        = {total.toFixed(3)}
      </div>
      {/* g, kg 입력 시: 몰, 부피(L) 모두 출력 */}
      {(isG || isKg) && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: isKg ? '#ffe082' : '#b2ffb2' }}>
          몰 수 계산: {amountInG}g ÷ {total.toFixed(3)}g/mol = {gToMol !== null ? gToMol.toFixed(4) : '-'} mol
          <br />
          (0℃, 1atm일 때) 부피 계산: {gToMol !== null ? gToMol.toFixed(4) : '-'} mol × 22.4L/mol = {gToL !== null ? gToL.toFixed(3) : '-'} L
        </div>
      )}
      {/* mol 입력 시: 질량, 부피(L) 모두 출력 */}
      {isMol && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: '#82b2ff' }}>
          질량 계산: {amount}mol × {total.toFixed(3)}g/mol = {molToG !== null ? molToG.toFixed(3) : '-'} g
          <br />
          (0℃, 1atm일 때) 부피 계산: {amount}mol × 22.4L/mol = {molToL !== null ? molToL.toFixed(3) : '-'} L
        </div>
      )}
      {/* L 입력 시: 몰, 질량 모두 출력 */}
      {isL && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: '#ffd1dc' }}>
          <div>(0℃, 1atm일 때)</div>
          <div>
            몰 수 계산: {amount}L ÷ 22.4L/mol = {lToMol !== null ? lToMol.toFixed(4) : '-'} mol
          </div>
          <div>
            질량 계산: {lToMol !== null ? lToMol.toFixed(4) : '-'}mol × {total.toFixed(3)}g/mol = {lToG !== null ? lToG.toFixed(3) : '-'} g
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;