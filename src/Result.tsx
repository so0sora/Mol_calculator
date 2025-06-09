import React from 'react';
import atomDataJson from './atom.json';

type AtomDataType = {
  [key: string]: {
    symbol: string; //영어 명
    kor: string; //한글 명
    atomic_mass: number; //원자량
  };
};

const atomData: AtomDataType = atomDataJson as AtomDataType;

interface ResultProps {
  parsedAtoms: { symbol: string; count: number }[];
  amount?: number | null;
  unit?: string;
}   

const AVOGADRO = 6.02; // 아보가드로 수

// 분자 하나당 원자의 개수 계산 함수
function getAtomCountPerMolecule(parsedAtoms: { symbol: string; count: number }[]) {
  return parsedAtoms.reduce((sum, atom) => sum + atom.count, 0);
}

const Result: React.FC<ResultProps> = ({ parsedAtoms, amount, unit }) => {
  if (!parsedAtoms || parsedAtoms.length === 0) return null;

  // 맨 앞에 계수(숫자)가 있는지 확인
  let moleculeCount = 1;
  let atomsForFormula = parsedAtoms;
  if (
    parsedAtoms.length > 0 &&
    typeof parsedAtoms[0].symbol === 'string' &&
    !isNaN(Number(parsedAtoms[0].symbol))
  ) {
    moleculeCount = Number(parsedAtoms[0].symbol);
    atomsForFormula = parsedAtoms.slice(1);
  }

  const formula = atomsForFormula
    .map(atom => {
      const mass = atomData[atom.symbol]?.atomic_mass ?? 0;
      return `${atom.count}×${mass}`;
    })
    .join(' + ');

  const total = atomsForFormula
    .reduce(
      (sum, atom) =>
        sum + ((atomData[atom.symbol]?.atomic_mass ?? 0) * atom.count),
      0
    );

  // 분자 하나당 원자의 개수
  const atomsPerMolecule = getAtomCountPerMolecule(parsedAtoms);

  // 단위별 계산
  const isKg = unit === 'kg' && amount && total > 0;
  const isG = unit === 'g' && amount && total > 0;
  const isMol = unit === 'mol' && amount && total > 0;
  const isL = unit === 'L' && amount && total > 0;
  const isNA = unit === 'NA' && amount && total > 0;
  const amountInG = isKg ? amount * 1000 : amount;

  // 0도씨 1기압에서 1mol 기체의 부피(L)
  const MOLAR_VOLUME = 22.4;

  // g, kg → mol, L, NA
  let gToMol = null;
  let gToL = null;
  let gToNA = null;
  let gToAtomCount = null;
  if ((isG || isKg) && amountInG && total > 0) {
    gToMol = amountInG / total;
    gToL = gToMol * MOLAR_VOLUME;
    gToNA = gToMol * AVOGADRO;
    gToAtomCount = gToMol * atomsPerMolecule * AVOGADRO;
  }

  // mol → g, L, NA
  let molToG = null;
  let molToL = null;
  let molToNA = null;
  let molToAtomCount = null;
  if (isMol && amount) {
    molToG = amount * total;
    molToL = amount * MOLAR_VOLUME;
    molToNA = amount * AVOGADRO;
    molToAtomCount = amount * atomsPerMolecule * AVOGADRO;
  }

  // L → mol, g, NA
  let lToMol = null;
  let lToG = null;
  let lToNA = null;
  let lToAtomCount = null;
  if (isL && amount) {
    lToMol = amount / MOLAR_VOLUME;
    lToG = lToMol * total;
    lToNA = lToMol * AVOGADRO;
    lToAtomCount = lToMol * atomsPerMolecule * AVOGADRO;
  }

  // NA → mol, g, L, 원자수
  let naToMol = null;
  let naToG = null;
  let naToL = null;
  let naToAtomCount = null;
  if (isNA && amount) {
    naToMol = amount / AVOGADRO;
    naToG = naToMol * total;
    naToL = naToMol * MOLAR_VOLUME;
    naToAtomCount = amount * AVOGADRO * atomsPerMolecule;
  }

  return (
    <div style={{ marginTop: '16px', color: '#fff' }}>
      {/* 원자 정보 출력 */}
      {atomsForFormula.map((atom, idx) => (
        <div key={idx}>
          {atom.symbol}({atomData[atom.symbol]?.symbol ?? '-'} {atomData[atom.symbol]?.kor ?? '-'}) {atom.count}개
          {moleculeCount > 1 ? ` × ${moleculeCount}` : ''}
          {' '}
          (원자량: {atomData[atom.symbol]?.atomic_mass ?? '-'}{moleculeCount > 1 ? ` × ${moleculeCount}` : ''})
        </div>
      ))}
      <div style={{ marginTop: '12px', fontWeight: 'bold' }}>
        분자량(화학식량): 
        {moleculeCount > 1
          ? `${moleculeCount}(${atomsForFormula.map(atom => `${atom.count}×${atomData[atom.symbol]?.atomic_mass ?? 0}`).join(' + ')})`
          : atomsForFormula.map(atom => `${atom.count}×${atomData[atom.symbol]?.atomic_mass ?? 0}`).join(' + ')}
        <br />
        = {moleculeCount > 1
          ? `${moleculeCount}(${atomsForFormula.reduce((sum, atom) => sum + ((atomData[atom.symbol]?.atomic_mass ?? 0) * atom.count), 0).toFixed(3)}) = ${(atomsForFormula.reduce((sum, atom) => sum + ((atomData[atom.symbol]?.atomic_mass ?? 0) * atom.count), 0) * moleculeCount).toFixed(3)}`
          : atomsForFormula.reduce((sum, atom) => sum + ((atomData[atom.symbol]?.atomic_mass ?? 0) * atom.count), 0).toFixed(3)}
        <br /><br />
      </div>

      {/* mol 입력 시: 질량, 부피(L), 원자/분자 개수 모두 출력 */}
      {isMol && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: '#82b2ff' }}>
          {/* 질량 */}
          질량 계산: 몰 수(mol) × 1몰의 질량(g/mol) = 질량(g)
          <br />
          {amount}mol × {total.toFixed(3)}g/mol = {molToG !== null ? molToG.toFixed(3) : '-'} g
          <br /><br />
          {/* 부피 */}
          (0℃, 1atm, 기체일 때)<br />
          부피 계산: 몰 수(mol) × 1몰의 부피(22.4L/mol) = 부피(L)
          <br />
          {amount}mol × 22.4L/mol = {molToL !== null ? molToL.toFixed(3) : '-'} L
          <br /><br />
          {/* 원자/분자 개수 */}
          원자의 개수 계산: 몰 수(mol) × 분자 하나당 원자의 개수 × 아보가드로 수(6.02×10²³) = 총 원자 개수
          <br />
          {amount} × {atomsPerMolecule} × 6.02 × 10²³ = {molToAtomCount !== null && molToAtomCount.toLocaleString('fullwide', { useGrouping: true })}개
        </div>
      )}
      {/* g, kg 입력 시: 몰, 부피(L), 원자/분자 개수 모두 출력 */}
      {(isG || isKg) && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: isKg ? '#ffe082' : '#b2ffb2' }}>
          {/* 몰 수 */}
          몰 수 계산: 질량(g) ÷ 1몰의 질량(g/mol) = 몰 수(mol)
          <br />
          {amountInG}g ÷ {total.toFixed(3)}g/mol = {gToMol !== null ? gToMol.toFixed(4) : '-'} mol
          <br /><br />
          {/* 부피 */}
          (0℃, 1atm, 기체일 때)<br />
          부피 계산: 몰 수(mol) × 1몰의 부피(22.4L/mol) = 부피(L)
          <br />
          {gToMol !== null ? gToMol.toFixed(4) : '-'} mol × 22.4L/mol = {gToL !== null ? gToL.toFixed(3) : '-'} L
          <br /><br />
          {/* 원자/분자 개수 */}
          원자의 개수 계산: 몰 수(mol) × 분자 하나당 원자의 개수 × 아보가드로 수(6.02×10²³) = 총 원자 개수
          <br />
          {gToMol !== null ? `${gToMol.toFixed(4)} × ${atomsPerMolecule} × 6.02 × 10²³ = ${gToAtomCount !== null ? gToAtomCount.toLocaleString('fullwide', { useGrouping: true }) : '-'}` : '-'}개
        </div>
      )}
      {/* L 입력 시: 몰, 질량, 원자/분자 개수 모두 출력 */}
      {isL && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: '#ffd1dc' }}>
          (0℃, 1atm, 기체일 때)
          <br />
          {/* 몰 수 */}
          몰 수 계산: 부피(L) ÷ 1몰의 부피(22.4L/mol) = 몰 수(mol)
          <br />
          {amount}L ÷ 22.4L/mol = {lToMol !== null ? lToMol.toFixed(4) : '-'} mol
          <br /><br />
          {/* 질량 */}
          질량 계산: 몰 수(mol) × 1몰의 질량(g/mol) = 질량(g)
          <br />
          {lToMol !== null ? `${lToMol.toFixed(4)}mol × ${total.toFixed(3)}g/mol = ${lToG !== null ? lToG.toFixed(3) : '-'}` : '-'} g
          <br /><br />
          {/* 원자/분자 개수 */}
          원자의 개수 계산: 몰 수(mol) × 분자 하나당 원자의 개수 × 아보가드로 수(6.02×10²³) = 총 원자 개수
          <br />
          {lToMol !== null ? `${lToMol.toFixed(4)} × ${atomsPerMolecule} × 6.02 × 10²³ = ${lToAtomCount !== null ? lToAtomCount.toLocaleString('fullwide', { useGrouping: true }) : '-'}` : '-'}개
        </div>
      )}
      {/* NA 입력 시: 몰, 질량, 부피(L), 원자수 모두 출력 */}
      {isNA && (
        <div style={{ marginTop: '12px', fontWeight: 'bold', color: '#ffb347' }}>
          {/* 몰 수 */}
          몰 수 계산: 개수 ÷ 아보가드로 수(6.02×10²³) = 몰 수(mol)
          <br />
          {amount} ÷ (6.02 × 10²³) = {naToMol !== null ? naToMol.toExponential(4) : '-'} mol
          <br /><br />
          {/* 질량 */}
          질량 계산: 몰 수(mol) × 1몰의 질량(g/mol) = 질량(g)
          <br />
          {naToMol !== null ? `${naToMol.toExponential(4)} mol × ${total.toFixed(3)}g/mol = ${naToG !== null ? naToG.toFixed(3) : '-'}` : '-'} g
          <br /><br />
          {/* 부피 */}
          (0℃, 1atm, 기체일 때)<br />
          부피 계산: 몰 수(mol) × 1몰의 부피(22.4L/mol) = 부피(L)
          <br />
          {naToMol !== null ? `${naToMol.toExponential(4)} mol × 22.4L/mol = ${naToL !== null ? naToL.toExponential(3) : '-'}` : '-'} L
          <br /><br />
          {/* 원자/분자 개수 */}
          원자의 개수 계산: 계수 × 아보가드로 수(6.02×10²³) × 분자 하나당 원자의 개수 = 총 원자 개수
          <br />
          {amount} × (6.02×10²³) × {atomsPerMolecule} = {naToAtomCount !== null ? naToAtomCount.toLocaleString('fullwide', { useGrouping: true }) : '-'}개
        </div>
      )}
    </div>
  );
};

export default Result;