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

  // kg 단위 입력 시 g으로 변환하여 계산
  const isKg = unit === 'kg' && amount && total > 0;
  const isG = unit === 'g' && amount && total > 0;
  const amountInG = isKg ? amount * 1000 : amount;

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
      {/* kg 또는 g → mol 변환식 및 결과 */}
      {(isKg || isG) && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: isKg ? '#ffe082' : '#b2ffb2' }}>
          몰 수 계산: {amountInG}g ÷ {total.toFixed(3)}g/mol <br />
          = {(amountInG && total > 0 ? (amountInG / total).toFixed(4) : '-')} mol
        </div>
      )}
    </div>
  );
};

export default Result;