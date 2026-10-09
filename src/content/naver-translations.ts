/** English display titles; original Korean publication metadata stays in naver.ts. */
import titles1 from './naver-titles-1.json' with { type: 'json' }
import titles2 from './naver-titles-2.json' with { type: 'json' }
import titles3 from './naver-titles-3.json' with { type: 'json' }
import titles4 from './naver-titles-4.json' with { type: 'json' }

export const naverTitleTranslations: Record<string, string> = { ...titles1, ...titles2, ...titles3, ...titles4 }
