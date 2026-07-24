/**
 * 生命数字密码计算器
 * 基于苏醒《生命数字密码》
 */

/**
 * 将一个数逐位相加到个位数（保留卓越数11/22/33）
 */
function reduceToSingle(num, forceSingle = false) {
  if (!forceSingle && (num === 11 || num === 22 || num === 33)) return num;
  while (num > 9) {
    let sum = 0;
    const s = String(num);
    for (let i = 0; i < s.length; i++) {
      sum += parseInt(s[i]);
    }
    num = sum;
    if (!forceSingle && (num === 11 || num === 22 || num === 33)) return num;
  }
  return num;
}

/**
 * 从出生日期字符串中提取所有单个数字
 */
function extractDigits(dateStr) {
  // dateStr format: YYYYMMDD
  const digits = [];
  for (const ch of dateStr) {
    const d = parseInt(ch);
    if (!isNaN(d)) digits.push(d);
  }
  return digits;
}

/**
 * 计算命运数（命数/生命数）
 * 将出生年月日所有数字依次相加，简化到最后一位个位数
 * 如果出现11/22/33，不再继续相加
 */
export function calcLifePath(year, month, day) {
  const dateStr = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  const digits = extractDigits(dateStr);
  const total = digits.reduce((a, b) => a + b, 0);
  return { total, lifePath: reduceToSingle(total) };
}

/**
 * 计算天赋数
 * 天赋数就是命运数计算过程中的两位数总和（在简化之前）
 */
export function calcTalentNumber(year, month, day) {
  const { total } = calcLifePath(year, month, day);
  return { talent: total, lifePath: reduceToSingle(total) };
}

/**
 * 计算生日数
 * 出生日期，简化到个位数（29→11为卓越数）
 */
export function calcBirthDay(day) {
  return reduceToSingle(day);
}

/**
 * 计算先天数（三个阶段）
 * 阶段1：出生月 → 型塑启蒙期
 * 阶段2：出生日 → 产出壮年期
 * 阶段3：出生年 → 丰收晚年期
 */
export function calcInnateNumbers(year, month, day) {
  const stage1 = reduceToSingle(month);
  const stage2 = reduceToSingle(day);
  const yearSum = String(year).split('').map(Number).reduce((a, b) => a + b, 0);
  const stage3 = reduceToSingle(yearSum);
  return { stage1, stage2, stage3 };
}

/**
 * 各命数对应的阶段1年龄段（型塑启蒙期结束年龄）
 */
const stage1AgeMap = {
  1: 27, 2: 26, 3: 34, 4: 33, 5: 32,
  6: 31, 7: 30, 8: 29, 9: 28, 11: 26, 22: 33, 33: 31
};

export function getStageAgeRanges(lifePath) {
  const end1 = stage1AgeMap[lifePath] || 28;
  const end2 = end1 + 9;
  return {
    stage1: `0 ~ ${end1}岁（型塑启蒙期）`,
    stage2: `${end1 + 1} ~ ${end2}岁（产出壮年期）`,
    stage3: `${end2 + 1}岁以后（丰收晚年期）`
  };
}

/**
 * 计算限制数
 * 出生月（简化到个位）+ 出生日（简化到个位）
 */
export function calcRestrictionNumber(month, day) {
  const m = reduceToSingle(month, true);
  const d = reduceToSingle(day, true);
  return { restriction: reduceToSingle(m + d, true) };
}

/**
 * 计算流年数
 * 当年数字 + 出生月 + 出生日，相加到个位数
 */
export function calcPersonalYear(year, month, day) {
  const currentYear = new Date().getFullYear();
  const dateStr = `${currentYear}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  const digits = extractDigits(dateStr);
  const total = digits.reduce((a, b) => a + b, 0);
  return reduceToSingle(total, true);
}

/**
 * 计算指定年份的流年数
 * 流年数始终简化到个位数
 */
export function calcPersonalYearFor(targetYear, month, day) {
  const dateStr = `${targetYear}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  const digits = extractDigits(dateStr);
  const total = digits.reduce((a, b) => a + b, 0);
  return reduceToSingle(total, true);
}

/**
 * 计算频率最多数
 * 统计出生年月日中每个数字出现的次数
 */
export function calcMostFrequent(year, month, day) {
  const dateStr = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  const digits = extractDigits(dateStr);
  const freq = {};
  for (const d of digits) {
    freq[d] = (freq[d] || 0) + 1;
  }
  // 找出出现频率 > 2 的数字（仅1-9，0不属于性格数字体系）
  const result = [];
  for (const [num, count] of Object.entries(freq)) {
    const n = parseInt(num);
    if (n >= 1 && n <= 9 && count >= 3) {
      result.push({ digit: n, count });
    }
  }
  // 按频率降序排列
  result.sort((a, b) => b.count - a.count);
  return { freq, dominant: result };
}

/**
 * 填充九宫格
 * 九宫格布局：
 * | 3 | 6 | 9 |
 * | 2 | 5 | 8 |
 * | 1 | 4 | 7 |
 *
 * 注意：书中布局是
 * | 1 | 4 | 7 |
 * | 2 | 5 | 8 |
 * | 3 | 6 | 9 |
 * 按书中原始布局
 */
export function calcGrid(year, month, day) {
  // 初始化九宫格
  const grid = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 0, 7: 0, 8: 0, 9: 0
   };

  // 获取出生日期的所有数字
  const dateStr = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  const digits = extractDigits(dateStr);

  // 每个数字在九宫格对应位置加一
  for (const d of digits) {
    if (d > 0 && d <= 9) {
      grid[d]++;
    }
  }

  // 计算空缺数
  const missing = [];
  for (let i = 1; i <= 9; i++) {
    if (grid[i] === 0) missing.push(i);
  }

  // 计算连线
  const lines = checkLines(grid);

  return { grid, missing, lines };
}

/**
 * 检查九宫格中的连线
 * 8条主线：123, 456, 789, 147, 258, 369, 159, 357
 * 4条副线：24, 26, 48, 68
 */
export function checkLines(grid) {
  const mainLines = [
    [1, 2, 3], [4, 5, 6], [7, 8, 9],
    [1, 4, 7], [2, 5, 8], [3, 6, 9],
    [1, 5, 9], [3, 5, 7]
  ];
  const subLines = [[2, 4], [2, 6], [4, 8], [6, 8]];

  const active = [];
  const inactive = [];

  for (const line of mainLines) {
    const name = line.join('');
    const hasAll = line.every(n => grid[n] > 0);
    if (hasAll) {
      active.push({ name, numbers: line, type: 'main' });
    } else {
      inactive.push({ name, numbers: line, type: 'main' });
    }
  }

  for (const line of subLines) {
    const name = line.join('');
    const hasAll = line.every(n => grid[n] > 0);
    if (hasAll) {
      active.push({ name, numbers: line, type: 'sub' });
    } else {
      inactive.push({ name, numbers: line, type: 'sub' });
    }
  }

  return { active, inactive };
}

/**
 * 获取星座对应数字
 */
export function getZodiacNumber(month, day) {
  const zodiacRanges = [
    { start: [1, 20], end: [2, 18], num: 11 }, // 水瓶
    { start: [2, 19], end: [3, 20], num: 2 },  // 双鱼
    { start: [3, 21], end: [4, 19], num: 3 },  // 白羊
    { start: [4, 20], end: [5, 20], num: 4 },  // 金牛
    { start: [5, 21], end: [6, 21], num: 5 },  // 双子
    { start: [6, 22], end: [7, 22], num: 6 },  // 巨蟹
    { start: [7, 23], end: [8, 22], num: 1 },  // 狮子
    { start: [8, 23], end: [9, 22], num: 7 },  // 处女
    { start: [9, 23], end: [10, 23], num: 8 }, // 天秤
    { start: [10, 24], end: [11, 22], num: 9 }, // 天蝎
    { start: [11, 23], end: [12, 21], num: 1 }, // 射手
    { start: [12, 22], end: [1, 19], num: 2 },  // 魔羯
  ];
  // 简化星座数字
  const zodiacNumMap = { 11: 2, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 };

  // 按书中对应关系
  const zodiacNum = {
    '白羊座': 1, '魔羯座': 1, '金牛座': 2, '双子座': 3, '双鱼座': 3,
    '巨蟹座': 4, '狮子座': 5, '处女座': 6, '天秤座': 7, '天蝎座': 8, '射手座': 9,
    '水瓶座': 11
  };

  let zodiacName = '';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiacName = '白羊座';
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiacName = '金牛座';
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) zodiacName = '双子座';
  else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) zodiacName = '巨蟹座';
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacName = '狮子座';
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiacName = '处女座';
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) zodiacName = '天秤座';
  else if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) zodiacName = '天蝎座';
  else if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) zodiacName = '射手座';
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiacName = '魔羯座';
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiacName = '水瓶座';
  else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) zodiacName = '双鱼座';

  const num = zodiacNum[zodiacName] || 1;
  return { zodiac: zodiacName, number: num, reducedNumber: reduceToSingle(num) };
}

/**
 * 完整计算一个人的所有数字密码
 */
export function calculateAll(year, month, day) {
  const { total, lifePath } = calcLifePath(year, month, day);
  const { talent } = calcTalentNumber(year, month, day);
  const birthDay = calcBirthDay(day);
  const innate = calcInnateNumbers(year, month, day);
  const stageAges = getStageAgeRanges(lifePath);
  const { restriction } = calcRestrictionNumber(month, day);
  const personalYear = calcPersonalYear(year, month, day);
  const { freq, dominant } = calcMostFrequent(year, month, day);
  const { grid, missing, lines } = calcGrid(year, month, day);
  const zodiac = getZodiacNumber(month, day);

  // 计算9年流年周期
  const currentYear = new Date().getFullYear();
  const personalYears = [];
  for (let y = currentYear; y < currentYear + 9; y++) {
    personalYears.push({
      year: y,
      number: calcPersonalYearFor(y, month, day)
    });
  }

  return {
    lifePath,
    talent,
    talentDisplay: `${talent}/${lifePath}`,
    birthDay,
    innate,
    stageAges,
    restriction,
    personalYear,
    personalYears,
    freq,
    dominant,
    grid,
    missing,
    lines,
    zodiac
  };
}
