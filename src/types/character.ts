/**
 * 캐릭터 일관성을 위한 캐릭터 시트
 */
export interface CharacterSheet {
  id: string;
  name: string;
  species: string;  // 종족 (예: 사람, 토끼, 곰, 여우 등)
  age: string;      // 나이대 (예: 어린이, 청소년, 성인)
  gender: string;   // 성별
  appearance: {
    hairColor?: string;      // 머리 색상
    hairStyle?: string;      // 머리 스타일
    eyeColor?: string;       // 눈 색상
    skinTone?: string;       // 피부 톤
    clothing?: string;       // 주요 의상
    height?: string;         // 키 (상대적)
    build?: string;          // 체형
    distinctiveFeatures?: string;  // 특징적인 외모 요소
  };
  personality?: string;  // 성격 (선택)
  referenceImage?: string;  // 첫 번째 생성 이미지 URL (참조용)
}

/**
 * 캐릭터 시트를 프롬프트 문자열로 변환
 */
export function characterSheetToPrompt(character: CharacterSheet): string {
  const { name, species, age, gender, appearance } = character;
  
  const parts = [
    `Character: ${name}`,
    `Species: ${species}`,
    `Age: ${age}`,
    `Gender: ${gender}`,
  ];

  if (appearance.hairColor) parts.push(`Hair: ${appearance.hairColor} ${appearance.hairStyle || ''}`);
  if (appearance.eyeColor) parts.push(`Eyes: ${appearance.eyeColor}`);
  if (appearance.skinTone) parts.push(`Skin tone: ${appearance.skinTone}`);
  if (appearance.clothing) parts.push(`Clothing: ${appearance.clothing}`);
  if (appearance.height) parts.push(`Height: ${appearance.height}`);
  if (appearance.build) parts.push(`Build: ${appearance.build}`);
  if (appearance.distinctiveFeatures) parts.push(`Distinctive features: ${appearance.distinctiveFeatures}`);

  return parts.join(', ');
}

/**
 * 스토리에서 자동으로 캐릭터 추출 (간단한 버전)
 */
export function extractCharacterFromStory(storyText: string): Partial<CharacterSheet> | null {
  // 간단한 패턴 매칭으로 캐릭터 추출
  const patterns = {
    rabbit: /토끼|rabbit/i,
    bear: /곰|bear/i,
    fox: /여우|fox/i,
    cat: /고양이|cat/i,
    dog: /강아지|개|dog|puppy/i,
    bird: /새|bird/i,
    mouse: /쥐|mouse/i,
    child: /아이|어린이|소년|소녀|child|boy|girl/i,
  };

  for (const [species, pattern] of Object.entries(patterns)) {
    if (pattern.test(storyText)) {
      return {
        species: species === 'child' ? 'human child' : species,
        age: 'young',
        appearance: {
          clothing: 'simple, colorful outfit',
        }
      };
    }
  }

  return null;
}

/**
 * 기본 캐릭터 시트 생성
 */
export function createDefaultCharacter(name: string = 'Main Character'): CharacterSheet {
  return {
    id: `char_${Date.now()}`,
    name,
    species: 'human child',
    age: 'young child (5-8 years old)',
    gender: 'neutral',
    appearance: {
      hairColor: 'brown',
      hairStyle: 'short and neat',
      eyeColor: 'brown',
      skinTone: 'light',
      clothing: 'simple colorful t-shirt and pants',
      height: 'average for age',
      build: 'normal, healthy child build',
    },
  };
}
